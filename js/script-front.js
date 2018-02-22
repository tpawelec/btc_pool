/* Currency Variable */
var cCurrency = "USD";
var cPrice = '';

/* Stats DOM */
var htmlStats = $('.pool-stats p');

/* API Urls */

var chartUrl = 'http://work.monero.me:12345/api/pool-graph.php';
var coinUrl = 'http://work.monero.me:12345/api/pool-coin.php';
var poolUrl = 'http://work.monero.me:12345/api/pool-front.php';


/* DROPDOWN MENU DOM */
var btn = $('#currencySelect');

/* CHART DOM*/
var chartCanvas = document.getElementById("myChart").getContext('2d');
/*
    Converts timestamp to "human" form
*/
function convertTime(timestamp) {
    'use strict';
    var nowTime = Math.floor(Date.now() / 1000);
    var minutes = Math.floor((nowTime - timestamp) / 60);
    return minutes;
}

/*
    Take response from pool-front api and put it in DOM
*/
function processStats(resp) {
    'use strict';
    htmlStats.each(function () {
        if($(this).attr('id') === 'pool_fee') {
            $(this).text(resp[$(this).attr('id')] * 100 + '%');
        } else if($(this).attr('id') === 'pool_network_diff') {
            var diff = resp[$(this).attr('id')] / resp['pool_hashrate'];
            //var now = moment();
            var next = moment().add(diff, 'seconds');
        $(this).html(resp[$(this).attr('id')] + '<br>(' + moment().to(next, true) + ')');
        } else if($(this).attr('id') === 'pool_hashrate') { 
            $(this).text((numbro(resp[$(this).attr('id')]).format('0a.00')).toUpperCase() + 'H/s');
        } else {
            $(this).text(resp[$(this).attr('id')]);
        }

        //time (seconds) = network diff / hashrate
    });

    var innerHTMLTable = '';
    resp['pool_last_blocks'].forEach(function (record) {
        innerHTMLTable += '<tr><td>' + record.block_id + '</td>';
        if(record.anon_miner) {
            innerHTMLTable += '<td class="miner-id">' + record.miner + '</td>';
        } else {
            innerHTMLTable += '<td class="miner-id"><a href="#">' + record.miner + '</a></td>';
        }
        innerHTMLTable += '<td>' + record.reward + 'XMR<br>(' + (record.reward * cPrice).toFixed(2) + ' ' + cCurrency + ')</td>';
        innerHTMLTable += '<td>' + convertTime(record.time) + ' minutes ago</td></tr>';
    });

    $('.table-body').html(innerHTMLTable);
}

/*
    Take response from pool-coin
*/
function processCoin(resp) {
    'use strict';
    cPrice = resp['pool_coin_price'][cCurrency];
    htmlStats.each(function () {
        if ($(this).attr('id') === 'pool_coin_price') {
            $(this).text(cPrice + ' ' + cCurrency);
        }
    });

    /* STATS */
    $.ajax({
        url: poolUrl,
        method: 'GET',
        success: (response) => processStats(response)
    });
}

/*
    Take response from pool_chart and draw chart
*/

function drawChart(resp) {
    'use strict';
    var datasets = [];
    var serverNames = [];
    var labels = [];
    var i = 0;

    for(var serverName in resp.pool_hashrate_graph) {
        serverNames.push(serverName);
        datasets[i] = [];
        for(var number in resp.pool_hashrate_graph[serverName]) {
            datasets[i].push(resp.pool_hashrate_graph[serverName][number][1]);
            if (i === 0) {
            labels.push(moment(resp.pool_hashrate_graph[serverName][number][0] * 1000).format("DD.MM.YYYY HH:mm:ss Z"));
        }
        }
        i++;
    }

    var GraphArraySet = [];
    var chartColors = ['#ff0000', '#00ff00', '#0000dd', '#ffd400', '#ff00ff', 
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
/* STATS AND CHART */

function callApi() {
    'use strict';
    /* COIN */
    $.ajax({
        url: coinUrl,
        method: 'GET',
        success: (response) => processCoin(response)
    });
    /*
    Stats API is called inside processCoin callback because of need of xmr prices
    */
    /* CHART */
    $.ajax({
        url: chartUrl,
        method: 'GET',
        success: (response) => drawChart(response)
    })
}


$(document).ready(function () {

    'use strict';
    /*
        Global AJAX Setup for error
    */
    $.ajaxSetup({
        error: function(jqXHR, exception) {
            if (jqXHR.status === 0) {
                alert('Not connect.\n Verify Network.');
            } else if (jqXHR.status == 404) {
                alert('Requested page not found. [404]');
            } else if (jqXHR.status == 500) {
                alert('Internal Server Error [500].');
            } else if (exception === 'parsererror') {
                alert('Requested JSON parse failed.');
            } else if (exception === 'timeout') {
                alert('Time out error.');
            } else if (exception === 'abort') {
                alert('Ajax request aborted.');
            } else {
                alert('Uncaught Error.\n' + jqXHR.responseText);
            }
        }
    });
    /* DROPDOWN MENU WITH CURRENCIES */
    btn.click(function () {
        $('.dropdown-content').toggleClass('show');
    });

    /*
    When clicked anywhere else dropdown menu is closed
    */
    $(window).click(function (e) {
        if (e.target.id !== 'currencySelect') {
            if ($('.dropdown-content').hasClass('show')) {
                $('.dropdown-content').toggleClass('show');
            }
        }

    });

    /*
    When clicked on currency variable and html content is updated. Then API is called.
    */
    $('.dropdown-content p').click(function (e) {
        cCurrency = e.currentTarget.id;
        btn.text(cCurrency);
        callApi();
    });

    /* Login form and popup display */
    $('#loginForm').click(function (e) {
        e.preventDefault();

        /* PSEUDOCODE
            call API
            if user require password
                display csspopup with '.password-form' displayed
            else
                go to userpage
        */
        $('.css-popup').css({
            visibility: "visible",
            opacity: 1
        });

        

    });

    $('.css-popup .close').click(function (e) {
            e.preventDefault();
            $('.css-popup').css({
                visibility: "hidden",
                opacity: 0
        });
        });

    /* Password prompt on css popup */
    $('#passwordLogin').click(function (e) {
        e.preventDefault();

        /*PSEUDOCODE
        call API
        if password is incorrect
            hide '.password-form' and display '.wrong-password'
        else
            go to userpage

        */

        $('.password-form').css({
            display: 'none'
        });
        $('.wrong-password').css({
            display: 'block'
        });

    });

    /* Password again */
    $('#passwordAgain').click(function (e) {
        e.preventDefault();
        $('.password-form').css({
            display: 'block'
        });
        $('.wrong-password').css({
            display: 'none'
        });
    })

    /* Check if login */
    /* PSEUDOCODE
        if user is NOT logged
            show login form
        else
            hide login form
    */

    $('.login').css({
        display: 'block'
    });
    callApi();
    setInterval(callApi, 10000);
});