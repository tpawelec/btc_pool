/*jslint browser: true*/ /*global  $, window*/
/*jshint sub:true*/

/* Currency Variable */
var cCurrency = "USD";

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
        }

        $(this).text(resp[$(this).attr('id')]);

    });
}

/* 
    Take response from pool-coin
*/
function processCoin(resp) {
    'use strict';
    htmlStats.each(function () {
        if ($(this).attr('id') === 'pool_coin_price') {
            $(this).text(resp['pool_coin_price'][cCurrency] + ' ' + cCurrency);
        }
    });
}

/*
    Take response from pool_chart and draw chart
*/
function drawChart(resp) {
    var datasets = [[],[]];
    var i = 0;

    for(var serverName in resp.pool_hashrate_graph) {
        for(var number in resp.pool_hashrate_graph[serverName]) {
            datasets[i].push(resp.pool_hashrate_graph[serverName][number][0]);
        }
        i++;
    }
    console.log(datasets[0]);
    var myChart = new Chart(chartCanvas, {
    type: 'line',
    data: {
        labels: datasets[0],
        datasets: [{
            data: datasets[0],
            backgroundColor: [
                'rgba(255, 99, 0, 0.2)',
            ],
            borderColor: [
                'rgba(0,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        },
        {
            data: datasets[1],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
            ],
            borderColor: [
                'rgba(34,99,132,1)',
                'rgba(10, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(2, 102, 255, 1)',
                'rgba(45, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }],
            xAxes: [{
                display: false
            }]
        }
    }
});
}
/* STATS AND CHART */

function callApi() {
    'use strict';

    /* STATS */
    $.ajax({
        url: poolUrl,
        method: 'GET',
        success: (response) => processStats(response)
    });
    /* COIN */
    $.ajax({
        url: coinUrl,
        method: 'GET',
        success: (response) => processCoin(response)
    });
    /* CHART */
    $.ajax({
        url: chartUrl,
        method: 'GET',
        success: (response) => drawChart(response)
    })
}


$(document).ready(function () {

    'use strict';

    /* DROPDOWN MENU WITH CURRENCIES */
    btn.click(function () {
        $('.dropdown-content').toggleClass('show');
    });

    $(window).click(function (e) {
        if (e.target.id !== 'currencySelect') {
            if ($('.dropdown-content').hasClass('show')) {
                $('.dropdown-content').toggleClass('show');
            }
        }

    });

    $('.dropdown-content p').click(function (e) {
        cCurrency = e.currentTarget.id;
        callApi();
        btn.text(cCurrency);
    });

    /* END */

    
    callApi();
});