/*jshint browser:true,sub:true */
/*global $, Offline, moment, numbro, Chart, cPrice:true, cCurrency:true, poolUrl, coinUrl, chartUrl, apiUrlUser, btn, apiInterval */

/* Stats DOM */
var htmlStats = $(".pool-stats p");

/* CHART DOM*/
var chartCanvas = document.getElementById("myChart").getContext("2d");
/*
    Converts timestamp to "human" form
*/
function convertTime(timestamp) {
    "use strict";
    var nowTime = Math.floor(Date.now() / 1000);
    var minutes = Math.floor((nowTime - timestamp) / 60);
    return minutes;
}

/*
    Take response from pool-front api and put it in DOM
*/
function processStats(resp) {
    "use strict";
    htmlStats.each(function () {
        if($(this).attr("id") === "pool_fee") {
            $(this).text(resp[$(this).attr("id")] * 100 + "%");
        } else if($(this).attr("id") === "pool_network_diff") {
            var diff = resp[$(this).attr("id")] / resp["pool_hashrate"];
            //var now = moment();
            var next = moment().add(diff, "seconds");
        $(this).html(resp[$(this).attr("id")] + "<br>(" + moment().to(next, true) + ")");
        } else if($(this).attr("id") === "pool_hashrate") { 
            $(this).text((numbro(resp[$(this).attr("id")]).format("0a.00")).toUpperCase() + "H/s");
        } else {
            $(this).text(resp[$(this).attr("id")]);
        }
    });

    var innerHTMLTable = "";
    resp["pool_last_blocks"].forEach(function (record) {
        innerHTMLTable += "<tr><td>" + record.block_id + "</td>";
        if(record.anon_miner) {
            innerHTMLTable += "<td class=\"miner-id\">" + record.miner + "</td>";
        } else {
            innerHTMLTable += "<td class=\"miner-id\"><a href=\"user-panel.html?id=" + record.miner + "\" class=\"miner-link\">" + record.miner + "</a></td>";
        }
        innerHTMLTable += "<td>" + record.reward + "XMR<br>(" + (record.reward * cPrice).toFixed(2) + " " + cCurrency + ")</td>";
        innerHTMLTable += "<td>" + convertTime(record.time) + " minutes ago</td></tr>";
    });

    $(".table-body").html(innerHTMLTable);
}

/*
    Take response from pool-coin
*/
function processCoin(resp) {
    "use strict";
    cPrice = resp["pool_coin_price"][cCurrency];
    htmlStats.each(function () {
        if ($(this).attr("id") === "pool_coin_price") {
            $(this).text(cPrice + " " + cCurrency);
        }
    });

    /* STATS */
    $.ajax({
        url: poolUrl,
        method: "GET",
        success: function(response) {processStats(response);}
    });
}

/*
    Take response from pool_chart and draw chart
*/

function drawChart(resp) {
    "use strict";
    var datasets = [];
    var serverNames = [];
    var labels = [];
    var i = 0;

    for(var serverName in resp.pool_hashrate_graph) {
        if(resp.pool_hashrate_graph.hasOwnProperty(serverName)) {
        serverNames.push(serverName);
        datasets[i] = [];
        for(var number in resp.pool_hashrate_graph[serverName]) {
            if(resp.pool_hashrate_graph[serverName].hasOwnProperty(number)) {
            datasets[i].push(resp.pool_hashrate_graph[serverName][number][1]);
            if (i === 0) {
            labels.push(moment(resp.pool_hashrate_graph[serverName][number][0] * 1000).format("DD.MM.YYYY HH:mm:ss Z"));
        }
    }
        }
        i++;
    }
    }

    var GraphArraySet = [];
    var chartColors = ["#ff0000", "#00ff00", "#2992dd", "#ffd400", "#ff00ff", 
                        "#00ffff", "#000000", "#008620", "#001a9f", "#0096ff", 
                        "#dccf00", "#8d0088", "#890101", "#beb4b4", "#686868", 
                        "#97EAD2", "#69dcfc", "#9BC1BC", "#E6EBE0", "#E1AA7D",
                        "#B97375"];
    for(var k = 0; k < serverNames.length; k++) {
    	GraphArraySet[k] = {
    		label: serverNames[k],
            data: datasets[k],
            borderColor: chartColors[k],
            backgroundColor: chartColors[k],
            borderWidth: 1,
            pointBackgroundColor: chartColors[k],
            pointRadius: 1,
            showLine: true,
            fill: false
    	};
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
             topY = this.chart.scales["y-axis-0"].top,
             bottomY = this.chart.scales["y-axis-0"].bottom;

         // draw line
         ctx.save();
         ctx.beginPath();
         ctx.moveTo(x, topY);
         ctx.lineTo(x, bottomY);
         ctx.lineWidth = 2;
         ctx.strokeStyle = "#07C";
         ctx.stroke();
         ctx.restore();
      }
   }
}); 
    
    var myChart = new Chart(chartCanvas, {
    type: "LineWithLine",
    data: {
    	labels: labels,
    	datasets: GraphArraySet
    },
    options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            yAxes: [{
                id: "y-axis-0",
                ticks: {
                    beginAtZero:true,
                    autoSkip: true,
                    callback: function(label, index, labels) {
                        return numbro(label).format("3a");
                    }
                },
                gridLines: {
                    color: "rgba(240,237,238,0.5)",
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
            mode: "index",
            backgroundColor: "#f0edee",
            xPadding: 20,
            yPadding: 20,
            bodyFontColor: "#191919",
            bodySpacing: 5,
            titleMarginBottom: 10,
            titleFontColor: "#191919",
            callbacks: {
                label: function(tooltipItem, data) {
                    return data.datasets[tooltipItem.datasetIndex].label + ": " + numbro(tooltipItem.yLabel).format("3a");
                    }
            } 
        },
        legend: {
            position: "bottom",
            boxWidth: 50
        }
    }
}); 
}
/* STATS AND CHART */

function callApi() {
    "use strict";
    /* COIN */
    $.ajax({
        url: coinUrl,
        method: "GET",
        success: function(response) {processCoin(response);}
    });
    /*
    Stats API is called inside processCoin callback because of need of xmr prices
    */
    /* CHART */
    $.ajax({
        url: chartUrl,
        method: "GET",
        success: function(response) {drawChart(response);}
    });
}


$(document).ready(function () {

    "use strict";
    /*
    When clicked on currency variable and html content is updated. Then API is called.
    */
    $(".dropdown-content p").click(function (e) {
        cCurrency = e.currentTarget.id;
        btn.text(cCurrency);
        callApi();
    });


    
    $("body").on("click", ".miner-link", function (e) {
        e.preventDefault();
        window.location.href = "user-panel.html?id=" + e.currentTarget.text;
    });
    /* Login form and popup display */
    $("#loginForm").click(function (e) {
        e.preventDefault();
        $.ajax({
            url: apiUrlUser,
            method: "GET",
            data: {
                id: $("#userId").val()
            },
            success: function(response) {
                    if(response.error === "Username not found") {
                        $(".css-popup").css({
                            visibility: "visible",
                            opacity: 1
                        });
                        $(".css-popup > .wrapper > *:not(p)").css({
                            display: "none"
                        });
                        $(".wrong-id").css({
                            display: "flex"
                        });
                    } else {
                        window.location.href = "user-panel.html?id=" + $("#userId").val();
                    }
            }
        });
    });

    $(".css-popup .close").click(function (e) {
            e.preventDefault();
            $(".css-popup").css({
                visibility: "hidden",
                opacity: 0
        });
        });

    

    if(document.cookie.indexOf("user_token") < 0) {
        $(".login").css({
            display: "block"
        });
    } else {
        $(".login").css({
            display: "none"
        });
    }
    callApi();
    apiInterval[0] = function() {callApi();};
    apiInterval[1] = setInterval(apiInterval[0], 10000);
    
});