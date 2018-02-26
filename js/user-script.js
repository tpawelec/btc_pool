/* User id */
var userId = 'a';

/* API */
var apiUrl = 'http://work.monero.me:12345/api/user-data.php';

/* DOMs */
var btn = $('#currencySelect');
var pplnsDOM =$('#pplnsWindow');
/* CHART DOM*/
var chartCanvas = document.getElementById("myChart").getContext('2d');

var pplnsWidth;
var balance;
var payoutSum = 0;
var activeWorkers = 0;

/* Variable for multiplier in pplns graph */
var pplnsMultiplier = 10;

function showError(resp) {
	alert("There is a problem with server \n" + resp)
}

function loadData(resp) {
	var pplns = resp.pplns_window;
	var chart = resp.hashrate_graph;
	var workers = resp.workers;
	var totalShares = 0;
	

	pplns.forEach(function(block){
		totalShares += block.total_shares;
		payoutSum += block.user_payout;
	});

	var factor = Math.floor(totalShares / pplnsWidth);

	pplns.forEach(function(block, index) {
		pplnsDOM.append('<li class="block" id='+ index +'></li>');
		var currBlock = $('#pplnsWindow > .block:nth-child(' + (index + 1) +')');

		currBlock.css({'width': Math.floor(block.total_shares / factor)});
		currBlock.append('<li class="shares" style="width: ' + Math.floor((block.user_shares*pplnsMultiplier) / factor) + 'px"></li>');

	});

	workers.forEach(function(worker) {
		if(worker.active === true) {
			activeWorkers += 1;
		}
	})
	$('body').on('mouseover', '.block', function(e) {
		e.preventDefault();
		if(e.target === this) {
			var i = e.target.id;
		} else {
			var i = e.target.parentNode.id;
		}
			if(pplns[i].block_id === null) {
				$('.title:first-child').text('');
				$('#blockId').text('Currently mined block');
			} else {
				$('#blockId').text(pplns[i].block_id);
			}
			$('#sharesPplns').text(pplns[i].user_shares + '/' + pplns[i].total_shares);
			$('#userPayout').text(pplns[i].user_payout + ' (' + (pplns[i].user_payout * cPrice).toFixed(3) + cCurrency + ')');
			$('#onHover').css({'display' : 'block',  'opacity' : 1, 'top' : e.pageY, 'left' : e.pageX});
		
	});

	$('body').on('mouseout', '.block', function(e){ 
			$('#onHover').css({'display' : 'none', 'opacity' : 0}); 
	});


	$('.note-factor span').text(pplnsMultiplier);
	$('.note-info span').text(payoutSum + ' XMR (' + (payoutSum * cPrice) + ' ' + cCurrency + ')');

	var $userStats = $('#dashBoardSection p');
	$userStats.each(function() {
		if($(this).attr('id') === 'shares') {
			var minerShares = resp.valid_shares + resp.invalid_shares;
			$(this).html('Valid: ' + (numbro(resp.valid_shares).format('0a.00')).toUpperCase() + ' (' + (resp.valid_shares/minerShares)*100 + '%) <br/ >Invalid: ' + (numbro(resp.invalid_shares).format('0a.00')).toUpperCase() + ' (' + (resp.invalid_shares/minerShares)*100 + '%)');
		} else if($(this).attr('id') === 'workers') {
			$(this).html('Active: ' + activeWorkers + '<br/ >Total: ' + workers.length)
		}else if($(this).attr('id') === 'balance') {
			balance = resp.balance;
			var widthPerc = (resp.balance / resp.payout_balance)*100;
			var value = '<span>' + resp.balance + 'XMR <br/>('+ (resp.balance * cPrice) + ' ' + cCurrency + ')</span> \
								<ul id="balanceBar">\
									<li class="userShares" style="width:' + widthPerc + '%;"></li>\
								</ul>';
			$(this).html(value);
		} else if($(this).attr('id') === 'cur_hashrate' || $(this).attr('id') === 'avg_hashrate') { 
            $(this).text((numbro(resp[$(this).attr('id')]).format('0a.00')).toUpperCase() + 'H/s');
        }
	});

	$('body').on('mouseover', '#balanceBar', function(e) {
		e.preventDefault();
			$('#payBalance').text(resp.payout_balance + ' XMR');
			$('#payFee').text(resp.payout_fee + ' XMR');
			$('#balanceOnHover').css({'display' : 'block',  'opacity' : 1, 'top' : e.pageY, 'left' : e.pageX});
		
	});

	$('body').on('mouseout', '#balanceBar', function(e){ 
			$('#balanceOnHover').css({'display' : 'none', 'opacity' : 0}); 
	});

	var innerHTMLTable = ''
	workers.forEach(function(worker) {
		innerHTMLTable += '<tr><td>' + worker.name + '</td>';
		innerHTMLTable += '<td>' + convertTime(worker.last_share) + ' minutes ago</td>';
		if(worker.active === true) {
			innerHTMLTable += '<td class="active-worker">&#x2714;</td>';
		} else if (worker.active === false) {
			innerHTMLTable += '<td class="unactive-worker">&times;</td>';
		}
		innerHTMLTable += '<td>' + (numbro(worker.cur_hashrate).format('0a.00')).toUpperCase() + 'H/s</td>'
		innerHTMLTable += '<td>' + (numbro(worker.avg_hashrate).format('0a.00')).toUpperCase() + 'H/s</td></tr>'
	});

	$('#workersSection .table-body').html(innerHTMLTable);
	drawChart(chart);

}

function drawChart(chartSet) {
    'use strict';
    var datasets = [];
    var serverNames = [];
    var labels = [];
    var i = 0;

    for(var serverName in chartSet) {
        serverNames.push(serverName);
        datasets[i] = [];
        for(var number in chartSet[serverName]) {
            datasets[i].push(chartSet[serverName][number][1]);
            if (i === 0) {
            labels.push(moment(chartSet[serverName][number][0] * 1000).format("DD.MM.YYYY HH:mm:ss Z"));
        }
        }
        i++;
    }
    var GraphArraySet = [];
    var chartColors = ['#ff0000', '#00ff00', '#2992dd', '#ffd400', '#ff00ff', 
                        '#00ffff', '#000000', '#008620', '#001a9f', '#0096ff', 
                        '#dccf00', '#8d0088', '#890101', '#beb4b4', '#686868', 
                        '#97EAD2', '#69dcfc', '#9BC1BC', '#E6EBE0', '#E1AA7D',
                        '#B97375'];
    for(var i = 0; i < serverNames.length; i++) {
    	GraphArraySet[i] = {
    		label: serverNames[i],
            fill: true,
            data: datasets[i],
            borderColor: chartColors[i],
            backgroundColor: chartColors[i],
            borderWidth: 1,
            pointBackgroundColor: chartColors[i],
            pointRadius: 1,
            showLine: true,
            fill: false
    	}
    }
    labels.reverse();
    Chart.defaults.global.defaultFontColor = "#f0edee";
    
    Chart.defaults.LineWithLine = Chart.defaults.line;
    Chart.controllers.LineWithLine = Chart.controllers.line.extend({
        draw: function(ease) {
      Chart.controllers.line.prototype.draw.call(this, ease);
      if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
         var activePoint = this.chart.tooltip._active[0],
             ctx = this.chart.ctx,
             x = activePoint.tooltipPosition().x,
             topY = this.chart.scales['y-axis-0'].top,
             bottomY = this.chart.scales['y-axis-0'].bottom;

         // draw line
         ctx.save();
         ctx.beginPath();
         ctx.moveTo(x, topY);
         ctx.lineTo(x, bottomY);
         ctx.lineWidth = 2;
         ctx.strokeStyle = '#07C';
         ctx.stroke();
         ctx.restore();
      }
   }
}); 
    
    var myChart = new Chart(chartCanvas, {
    type: 'LineWithLine',
    data: {
    	labels: labels,
    	datasets: GraphArraySet
    },
    options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            yAxes: [{
                id: "y-axis-0",
                ticks: {
                    beginAtZero:true,
                    autoSkip: true,
                    callback: function(label, index, labels) {
                        return numbro(label).format('3a');
                    }
                },
                gridLines: {
                    color: 'rgba(240,237,238,0.5)',
                    borderDash: [5,15]
                },
                scaleLabel: {
                    display: true,
                    labelString: "Hashrate H/s"
                }
            }],
            xAxes: [{
                id: "x-axis-0",
                ticks: {
                    display: false
                }
            }]
        },
        layout: {
            padding: {
                left: 15,
                right: 15,
                top: 0,
                bottom: 0
            }
        },
        tooltips: {
            intersect: false,
            mode: 'index',
            backgroundColor: '#f0edee',
            xPadding: 20,
            yPadding: 20,
            bodyFontColor: '#191919',
            bodySpacing: 5,
            titleMarginBottom: 10,
            titleFontColor: '#191919',
            callbacks: {
                label: function(tooltipItem, data) {
                    return data.datasets[tooltipItem.datasetIndex].label + ": " + numbro(tooltipItem.yLabel).format('3a');
                    }
            } 
        },
        legend: {
            position: 'bottom',
            boxWidth: 50
        }
    }
}); 
}

function convertTime(timestamp) {
    'use strict';
    var nowTime = Math.floor(Date.now() / 1000);
    var minutes = Math.floor((nowTime - timestamp) / 60);
    return minutes;
}

function filterTable(regexp) {
	var $tableRows = $('#workersTable > tbody tr');
	if(regexp.length !== 0) {
		var searchregexp = new RegExp(unescape(regexp, "g"));
		$tableRows.each(function() {
			if(!searchregexp.test($(this).children().text())) {
				$(this).css({'display': 'none'});
			} else {
				$(this).css({'display': 'table-row'});
			}

		});
	} else {
		$tableRows.each(function() {
				$(this).css({'display': 'table-row'});
		})
	}

	var rowIndex = 0;
	$tableRows.each(function() {
				if($(this).css('display') === 'table-row') {
					if(rowIndex % 2 === 0) {
						$(this).css({'background-color': '#1B5389'});
					} else {
						$(this).css({'background-color': 'initial'});
					}
					rowIndex++;
				}
	});
}

function callApi() {
	$.ajax({
		url: apiUrl,
		method: 'GET',
		data: {
			id: userId
		},
		success: (response) => loadData(response),
		error: (response) => showError(response)
	});

	 $.ajax({
        url: coinUrl,
        method: 'GET',
        success: (response) => processCoin(response)
    });
}

function processCoin(resp) {
    'use strict';
    cPrice = resp['pool_coin_price'][cCurrency];
    $("#balance span").html(balance + 'XMR <br />('+ (balance * cPrice) + ' ' + cCurrency + ')');
    $('.note-info span').text(payoutSum + ' XMR (' + (payoutSum * cPrice) + ' ' + cCurrency + ')');
	}

/*


	DOCUMENT ON READY


*/
$(document).ready(function () {

    'use strict';
    $('#userMenu li').click(function (e) {
		e.preventDefault();

		var sectionId = e.currentTarget.id + "Section";
		
		$('body > div:not(:first-child)').css({'display': 'none'});
		$('#'+sectionId).css({'display': 'block'});
	});

    /* Show miner ID on Dashboard */
    $('#minerId').text(userId);

    var winWidth = $('.container').width();
    pplnsWidth = Math.floor(winWidth * 0.9);
    pplnsDOM.css({'width': pplnsWidth});

    callApi();

    /*
    When clicked on currency variable and html content is updated. Then API is called.
    */
    $('.dropdown-content p').click(function (e) {
        cCurrency = e.currentTarget.id;
        btn.text(cCurrency);
        /* COIN */
    $.ajax({
        url: coinUrl,
        method: 'GET',
        success: (response) => processCoin(response)
    });
    });

    $('#nameSearch').on('keyup', function(e) {
    	e.preventDefault();
    	if(e.which === 13 || e.keyCode === 13) {
    		filterTable(e.currentTarget.value);
    	} else if(e.which === 8 || e.keyCode === 8) {
    		if(e.currentTarget.value.length === 0) {
    			filterTable(e.currentTarget.value);
    		}
    	}
    })
});