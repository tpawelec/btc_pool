/*
TODO:
tooltip - linia pozioma
przeliczenie na waluty ( jeszcze na liście)

każdy request = xhr
w każdym requeście beforesend i sprawdzenie statusu. Jak źle to abort
*/

/*jslint browser: true*/ /*global  $, window*/
/*jshint sub:true*/

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
        if ($(this).attr('id') === 'last_mined_block') {
            $(this).html(resp['pool_last_mined_block_id'] + '<br>(' + convertTime(resp['pool_last_mined_block_time']) + ' minutes ago)');
        } else if($(this).attr('id') === 'pool_fee') {
            $(this).html(resp[$(this).attr('id')] + ' XMR<br>(' + resp[$(this).attr('id')] * cPrice + ' ' + cCurrency + ')');
            
        } else {
            $(this).text(resp[$(this).attr('id')]);
        }

    });
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
    var datasets = [[],[]];
    var serverNames = [];
    var labels = [];
    var i = 0;

    for(var serverName in resp.pool_hashrate_graph) {
        serverNames.push(serverName);
        for(var number in resp.pool_hashrate_graph[serverName]) {
            datasets[i].push(resp.pool_hashrate_graph[serverName][number][1]);
            if (i === 0) {
            labels.push(moment(resp.pool_hashrate_graph[serverName][number][0] * 1000).format("DD.MM.YYYY HH:mm:ss Z"));
        }
        }
        i++;
    }
    labels.reverse();
    Chart.defaults.global.defaultFontColor = "#f0edee";
    Chart.defaults.global.hover.onHover = function(x) {
        if(x[0]) {
        var index = x[0]._index;
        console.log(index);
    }
    };
    var myChart = new Chart(chartCanvas, {
    type: 'line',
    data: {
        labels: labels,
        datasets: [{
            label: serverNames[0],
            fill: true,
            data: datasets[0],
            borderColor: 'rgba(0,225,0,1)',
            backgroundColor: 'rgba(0,225,0,1)',
            borderWidth: 1,
            pointBackgroundColor: 'rgba(0,99,132,1)',
            pointRadius: 1,
            showLine: false
        },
        {
            label: serverNames[1],
            fill: true,
            data: datasets[1],
            borderColor: 'rgba(128,0,0,1)',
            backgroundColor: 'rgba(128,0,0,1)',
            borderWidth: 1,
            pointBackgroundColor: 'rgba(128,0,0,1)',
            pointRadius: 1.5,
            showLine: false
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true,
                    autoSkip: true,
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
            mode: 'index',
            backgroundColor: '#f0edee',
            xPadding: 20,
            yPadding: 20,
            bodyFontColor: '#191919',
            bodySpacing: 5,
            titleMarginBottom: 10,
            titleFontColor: '#191919'
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

    /* END */

    
    callApi();
});