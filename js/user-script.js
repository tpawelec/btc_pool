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

function loadData(resp) {
	var pplns = resp.pplns_window;
	var chart = resp.hashrate_graph;
	var totalShares = 0;

	pplns.forEach(function(block){
		totalShares += block.total_shares;
	})

	var factor = Math.floor(totalShares / pplnsWidth)

	pplns.forEach(function(block, index) {
		pplnsDOM.append('<li class="block" id='+ index +'></li>');
		var currBlock = $('#pplnsWindow > .block:nth-child(' + (index + 1) +')');

		currBlock.css({'width': Math.floor(block.total_shares / factor)});
		currBlock.append('<li class="shares" style="width: ' + Math.floor((block.user_shares*10) / factor) + 'px"></li>');

	})
	$('body').on('mouseover', '.block', function(e) {
		e.preventDefault();
		if(e.target === this) {
			var i = e.target.id;
		} else {
			var i = e.target.parentNode.id;
		}
			if(pplns[i].block_id === null) {
				$('#blockId').text('null');
			} else {
				$('#blockId').text(pplns[i].block_id);
			}
			$('#shares').text(pplns[i].user_shares);
			$('#payout').text(pplns[i].user_payout + ' (' + (pplns[i].user_payout * cPrice).toFixed(3) + ') ' + cCurrency);
			$('#onHover').css({'display' : 'block',  'opacity' : 1, 'top' : e.pageY, 'left' : e.pageX});
		
	});

	$('body').on('mouseout', '.block', function(e){ 
			$('#onHover').css({'display' : 'none', 'opacity' : 0}); 
	});

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
	}
$(document).ready(function () {

    'use strict';

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
});