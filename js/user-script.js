/*jshint browser:true,sub:true, quotmark:double, multistr:true, -W119, nonstandard:true */
/*global $, Offline, moment, numbro, Chart, cPrice:true, cCurrency:true, 
poolUrl, coinUrl, chartUrl, apiUrlUser,settingsUrl, getUrlVars, userPayoutUrl, btn, apiInterval, bgSec,updateNavUrl, changeNavHeight, x */

/* API */
var apiUrl = "http://work.monero.me:12345/api/user-data.php";

/* DOMs */
var pplnsDOM =$("#pplnsWindow");
/* CHART DOM*/
var chartCanvas = document.getElementById("myChart").getContext("2d");

var pplnsWidth;
var balance;
var payoutSum = 0;
var activeWorkers;

/* Variable for multiplier in pplns graph */
var pplnsMultiplier = 10;


/* Screen flag */
var screenFlag = "dashboard";

/* Hiding keyboard on mobile devices */
function hideKeyboard() {
  setTimeout(function() {

    //creating temp field
    var field = document.createElement("input");
    field.setAttribute("type", "text");
    field.setAttribute("style", "position:absolute; top: 0px; opacity: 0; -webkit-user-modify: read-write-plaintext-only; left:0px;");
    document.body.appendChild(field);

    field.onfocus = function(){
      setTimeout(function() {

        field.setAttribute("style", "display:none;");
        setTimeout(function() {
          document.body.removeChild(field);
          document.body.focus();
      }, 14);

    }, 200);
  };
  field.focus();
}, 50);

}

function showResponse(resp) {
    var $respPopup = $(".server-response");
    $(".css-popup").css({
        visibility: "visible",
        opacity: 1,
        display: "block"

    });
    $(".css-popup > .wrapper > *:not(p)").css({
            display: "none"
    });
    $respPopup.css({
            display: "flex"
        });
    if(resp.error) {
        $respPopup.html("<p class=\"prompt-sign api-fail\">&times;</p><p class=\"message\">" + resp.msg + "</p>");
    } else {
        $respPopup.html("<p class=\"prompt-sign api-success\">&#x2714;</p><p class=\"message\">" + resp.msg + "</p>");
    }
}

function loadData(resp) {
	
    var innerHTMLTable = "";
    /*
        DASHBOARD
        */
        if(screenFlag === "dashboard") {

            var pplns = resp.pplns_window;
            var chart = resp.hashrate_graph;

            var totalShares = 0;
            payoutSum = 0;


            var $userStats = $("#dashBoardSection p");
            $userStats.each(function() {
                if($(this).attr("id") === "shares") {
                    var minerShares = resp.valid_shares + resp.invalid_shares;
                    $(this).html("Valid: " + (numbro(resp.valid_shares).format("0a.00")).toUpperCase() + " (" + (resp.valid_shares/minerShares)*100 + "%) <br/ >Invalid: " + (numbro(resp.invalid_shares).format("0a.00")).toUpperCase() + " (" + (resp.invalid_shares/minerShares)*100 + "%)");
                } else if($(this).attr("id") === "workersDashboard") {
                    $(this).html("Active: " + resp.worker_count_active + "<br/ >Total: " + resp.worker_count);
                }else if($(this).attr("id") === "balance") {
                    balance = resp.balance;
                    var widthPerc = (resp.balance / resp.payout_balance)*100;
                    var value = "<span>" + resp.balance + "XMR <br/>("+ (resp.balance * cPrice) + " " + cCurrency + ")</span> \
                    <ul id=\"balanceBar\">\
                    <li class=\"userShares\" style=\"width:" + widthPerc + "%;\"></li>\
                    </ul>";
                    $(this).html(value);
                } else if($(this).attr("id") === "cur_hashrate" || $(this).attr("id") === "avg_hashrate") { 
                    $(this).text((numbro(resp[$(this).attr("id")]).format("0a.00")).toUpperCase() + "H/s");
                }
            });

            $("body").on("mouseover", "#balanceBar", function(e) {
                e.preventDefault();
                $("#payBalance").text(resp.payout_balance + " XMR");
                $("#payFee").text(resp.payout_fee + " XMR");
                $("#balanceOnHover").css({
                    display: "block",
                    opacity: 1,
                    top: e.pageY,
                    left: e.pageX});

            });

            $("body").on("mouseout", "#balanceBar", function(e){ 
                $("#balanceOnHover").css({
                    display: "none",
                    opacity: 0}); 
            });


            drawChart(chart);

            pplns.forEach(function(block){
                totalShares += block.total_shares;
                payoutSum += block.user_payout;
            });
            payoutSum = payoutSum.toFixed(5);
            pplnsWidth = $("#pplnsWindow").width();
            var factor = Math.floor(totalShares / pplnsWidth);
            pplnsDOM.empty();
            pplns.forEach(function(block, index) {
                pplnsDOM.append("<li class=\"block\" id="+ index +"></li>");
                var currBlock = $("#pplnsWindow > .block:nth-child(" + (index + 1) +")");

                currBlock.css({
                    width: Math.floor(block.total_shares / factor)
                });
                currBlock.append("<li class=\"shares\" style=\"width: " + Math.floor((block.user_shares*pplnsMultiplier) / factor) + "px\"></li>");

            });


            $("body").on("mouseover", ".block", function(e) {
                e.preventDefault();
                var i;
                if(e.target === this) {
                    i = e.target.id;
                } else {
                    i = e.target.parentNode.id;
                }
                if(pplns[i].block_id === null) {
                    $("#onHover .title:first-child").css({
                        display: "none"
                    });
                    $("#blockId").text("Currently mined block");
                } else {
                    $("#onHover .title:first-child").css({
                        display: "inline-block"
                    });
                    $("#blockId").text(pplns[i].block_id);
                }
                $("#sharesPplns").text(pplns[i].user_shares + "/" + pplns[i].total_shares);
                $("#userPayout").text(pplns[i].user_payout + " (" + (pplns[i].user_payout * cPrice).toFixed(3) + cCurrency + ")");
                $("#onHover").css({
                    display: "block", 
                    opacity: 1,
                    top: e.pageY,
                    left: e.pageX
                });

            });

            $("body").on("mouseout", ".block", function(e){ 
                $("#onHover").css({
                    display: "none",
                    opacity: 0
                }); 
            });


            $(".note-factor span").text(pplnsMultiplier);
            $(".note-info span").text(payoutSum + " XMR (" + (payoutSum * cPrice) + " " + cCurrency + ")");

        }
    /*
        PAYOUTS
        */
        else if(screenFlag === "payouts") {

            innerHTMLTable = "";
            var payouts = resp.payouts;
            payouts.forEach(function(po) {
                var now = moment(new Date());
                var stamp = moment.unix(po.date);
                var duration = moment.duration(now.diff(stamp));
                var mnts = duration.asMinutes();
                if(mnts > 1440) {
                    innerHTMLTable += "<tr><td>" + stamp.format("DD.MM.YYYY HH:mm:ss Z") + "</td>";
                } else {
                    if(mnts < 60) {
                        innerHTMLTable += "<tr><td>" + Math.floor(mnts) + " ago</td>";
                    } else {
                        innerHTMLTable += "<tr><td>" + Math.floor(mnts/60) + "hrs and " + Math.round(((Math.floor(mnts/60)) % 1) * 60) + "min ago</td>";
                    }
                }

                innerHTMLTable += "<td>" + po.amount + " XMR </br> (" + po.amount * cPrice + " " + cCurrency + ")</td>";
                innerHTMLTable += "<td>" + po.status + "</td>";
                if(po.txid === null) {
                    innerHTMLTable += "<td>&nbsp;</td></tr>";
                } else {
                    innerHTMLTable += "<td><a href=\"" + userPayoutUrl.replace("#", po.txid) + "\" target=\"_blank\">" + po.txid + "</td></tr>";
                }
            });

            $("#payoutsSection .table-body").html(innerHTMLTable);

        }
    /*
        WORKERS
        */
        else if(screenFlag === "workers") {

            innerHTMLTable = "";
            var workers = resp.workers;
            workers.forEach(function(worker) {
                if(worker.active === true) {
                    activeWorkers += 1;
                }
            });
            workers.forEach(function(worker) {
                innerHTMLTable += "<tr><td>" + worker.name + "</td>";
                innerHTMLTable += "<td>" + convertTime(worker.last_share) + " minutes ago</td>";
                if(worker.active === true) {
                    innerHTMLTable += "<td class=\"active-worker\">&#x2714;</td>";
                } else if (worker.active === false) {
                    innerHTMLTable += "<td class=\"unactive-worker\">&times;</td>";
                }
                innerHTMLTable += "<td>" + (numbro(worker.cur_hashrate).format("0a.00")).toUpperCase() + "H/s</td>";
                innerHTMLTable += "<td>" + (numbro(worker.avg_hashrate).format("0a.00")).toUpperCase() + "H/s</td></tr>";
            });

            $("#workersSection .table-body").html(innerHTMLTable);
            filterTable($("#nameSearch").val());

        }


    }

    function drawChart(chartSet) {
        "use strict";

        var datasets = [];
        var serverNames = [];
        var labels = [];
        var i = 0;

        for(var serverName in chartSet) {
            if(chartSet.hasOwnProperty(serverName)) {
            serverNames.push(serverName);
            datasets[i] = [];
            for(var number in chartSet[serverName]) {
                if(chartSet[serverName].hasOwnProperty(number)) {
                datasets[i].push(chartSet[serverName][number][1]);
                if (i === 0) {
                    labels.push(moment(chartSet[serverName][number][0] * 1000).format("DD.MM.YYYY HH:mm:ss Z"));
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
        maintainAspectRatio: false,
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

function convertTime(timestamp) {
    "use strict";
    var nowTime = Math.floor(Date.now() / 1000);
    var minutes = Math.floor((nowTime - timestamp) / 60);
    return minutes;
}

function filterTable(regexp) {
	var $tableRows = $("#workersTable > tbody tr");
	if(regexp.length !== 0) {
		var searchregexp = new RegExp(unescape(regexp, "g"));
		$tableRows.each(function() {
			if(!searchregexp.test($(this).children()[0].textContent)) {
				$(this).css({
                    display: "none"
                });
			} else {
				$(this).css({
                    display: "table-row"
                });
			}

		});
	} else {
		$tableRows.each(function() {
            $(this).css({
                display: "table-row"
            });
        });
	}

	var rowIndex = 0;
	$tableRows.each(function() {
        if($(this).css("display") === "table-row") {
           if(rowIndex % 2 === 0) {
              $(this).css({
                "background-color": "initial"
            });
          } else {
              $(this).css({
                "background-color": bgSec
            });
          }
          rowIndex++;
      }
  });

}

function callApi() {
	$.ajax({
		url: apiUrlUser,
		method: "GET",
		data: {
			id: getUrlVars()["id"],
            screen: screenFlag
        },
        success: function(response) {loadData(response);}
    });

  $.ajax({
    url: coinUrl,
    method: "GET",
    success: function(response) {processCoin(response);}
});
}

function processCoin(resp) {
    "use strict";
    cPrice = resp["pool_coin_price"][cCurrency];
    $("#balance span").html(balance + "XMR <br />("+ (balance * cPrice)  + " " + cCurrency + ")");
    $(".note-info span").text(payoutSum  + " XMR (" + (payoutSum * cPrice)  + " " + cCurrency + ")");
}

function passwordLogin() {
    $.ajax({
        url: apiUrlUser,
        method: "POST",
        data: {
            id: getUrlVars()["id"],
            password: $("#userPassword").val()
        },
        success: function(response, status, xhr) {
            if(response.auth_status === true) {
                $(".css-popup > .wrapper > *:not(p)").css({
                    display: "none"
                });
                $(".css-popup").css({
                    visibility: "hidden",
                    opacity: 0
                });


                $("#userLink").css({
                   display: "inline-block"
               });
                $("#logOut").css({
                    display: "flex"
                });
                hideKeyboard();
                callApi();
                localStorage.setItem("userIdLogged", getUrlVars()["id"]);
                updateNavUrl();
                changeNavHeight(x);
                apiInterval[0] = function() {callApi();};
                apiInterval[1] = setInterval(apiInterval[0], 10000);
            } else {
                $(".css-popup > .wrapper > *:not(p)").css({
                    display: "none"
                });
                $(".wrong-password").css({
                    display: "flex"
                });
            }
        }
    });
}

function apiLogin() {
    $.ajax({
                   url: apiUrlUser,
                   method: "GET",
                   data: {
                       id: getUrlVars()["id"]
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
                       if(response.auth_needed === true) {
                           $(".css-popup").css({
                               visibility: "visible",
                               opacity: 1
                           });

                           $(".css-popup").bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){ 
                            $("#userPassword").focus();
                        });

                       } else {
                          callApi();
                          localStorage.setItem("userIdNotLogged", getUrlVars()["id"]);
                          updateNavUrl();
                          changeNavHeight(x);
                          apiInterval[0] = function() {callApi();};
                          apiInterval[1] = setInterval(apiInterval[0], 10000);
                          $("#userLink").css({
                           display: "inline-block"
                       });
                          $("#logOut").css({
                            display: "flex"
                        });

                      }
                  }
              }
          });
}
/*


	DOCUMENT ON READY


    */
    $(document).ready(function () {
        "use strict";

        if(document.cookie.indexOf("user_token") < 0) { // check if user is logged (if cookie exist)
            if(location.search.indexOf("id=") < 0){ // check if url is correct (if id is in url)
                alert("No login id");
            } else {
                apiLogin();
           }
       } else {
        if(localStorage.userIdLogged === getUrlVars()["id"]) {
            callApi();
            apiInterval[0] = function() {callApi();};
            apiInterval[1] = setInterval(apiInterval[0], 10000);
        } else {
            apiLogin();
        }
      }


      $(".css-popup .close").click(function (e) {
        e.preventDefault();
        if($(".wrong-id").css("display") === "flex") {
            window.location.href = "index.html";
        } else if($(".password-form").css("display") === "flex" || $(".wrong-password").css("display") === "flex") {
            if(localStorage.userIdLogged == null || localStorage.userIdNotLogged == null) {
                window.location.href = "index.html";
            } else if(localStorage.userIdNotLogged === null || localStorage.userIdLogged != null) {
                window.location.href = "user-panel.html?id=" + localStorage.userIdLogged;
            } else if(localStorage.userIdLogged === null || localStorage.userIdNotLogged != null) {
                window.location.href = "user-panel.html?id=" + localStorage.userIdNotLogged;
            }
        } else {            
            $(".css-popup").css({
                visibility: "hidden",
                opacity: 0
            });
        }
    });

      /* Password prompt on css popup */
      $("#passwordLogin").click(function (e) {
        e.preventDefault();
        passwordLogin();
    });

      $("#passwordLogin").keyup(function (e) {
        if(e.which === 13 || e.keyCode === 13) {
            e.preventDefault();
            passwordLogin();
        }
    });
      /* Password again */
      $("#passwordAgain").click(function (e) {
        e.preventDefault();
        $(".css-popup > .wrapper > *:not(p)").css({
            display: "none"
        });
        $(".password-form").css({
            display: "flex"
        });
    });

      $("#userMenu li").click(function (e) {
          e.preventDefault();

          var sectionId = e.currentTarget.id + "Section";

          screenFlag = e.currentTarget.id.toLowerCase();

          $("body > div:not(:first-child)").css({
            display: "none"
        });
          $("#"+sectionId).css({
            display: "block"
        });
          if(screenFlag != "settings") {
            callApi();
            apiInterval[1] = setInterval(apiInterval[0], 10000);
            } else {
                clearInterval(apiInterval[1]);
                $.ajax({
                    url: settingsUrl,
                    method: "GET",
                    data: {
                        id: getUrlVars()["id"]
                    },
                    success: function(resp) {
                        $("#diffSetting").val(resp.difficulty);
                        $("#payoutLvl").val(resp.payout_level);
                        $("#email").val(resp.email);
                        $("#enableConstDiff").prop("checked", _ => resp.const_diff);
                        $("#passwordProtected").prop("checked", _ => resp.protect_profile);
                        $("#authMiners").prop("checked", _ => resp.protect_miners);
                        $("#anonymous").prop("checked", _ => resp.anonymize);
                        $("#notification").prop("checked", _ => resp.email_me);
                        
                    }
                });
            }
      });

      /* Show miner ID on Dashboard */
      $("#minerId").text(getUrlVars()["id"]);

    /*
    When clicked on currency variable and html content is updated. Then API is called.
    */
    $(".dropdown-content p").click(function (e) {
        cCurrency = e.currentTarget.id;
        btn.text(cCurrency);
        /* COIN */
        $.ajax({
            url: coinUrl,
            method: "GET",
            success: function(response) {processCoin(response);}
        });
    });

    $("#nameSearch").on("keyup", function(e) {
    	e.preventDefault();
    	if(e.which === 13 || e.keyCode === 13) {
    		filterTable(e.currentTarget.value);
            hideKeyboard();
    	} else if(e.which === 8 || e.keyCode === 8) {
    		if(e.currentTarget.value.length === 0) {
    			filterTable(e.currentTarget.value);
    		}
    	}
        
    });

    /* 
    On hover on PPLNS legend
    */
    $(".legend p").on("mouseover", function(e) {
        e.preventDefault();
        if($(this).index() === 0) {
            $("#pplnsLegendHover p").text("Red line indicates when a block was mined");
        } else if($(this).index() === 1) {
            $("#pplnsLegendHover p").text("White area is your contribution to that block");
        } else if($(this).index() === 2) {
            $("#pplnsLegendHover p").text("Blue area indicates other contributions");
        }

        $("#pplnsLegendHover").css({
            display: "block", 
            opacity: 1,
            top: e.pageY,
            left: e.pageX});
    });

    $(".legend p").on("mouseout", function(e) {
        e.preventDefault();

        $("#pplnsLegendHover").css({
            display: "none",
            opacity: 0
        });
    });

    /*
        Settings section
    */
    var $tooltip = $(".col-tooltip");
    var duration = 500;
    $tooltip.hide();
    $("#newPasswordConfirm").focusout(function() {
        if($(this).val() != $("#newPassword").val()) {
            $tooltip.slideDown(duration);
            $("#newPassword").focus();
        }
    });

    $("#newPasswordConfirm").on("keyup", function() {
            $tooltip.slideUp(duration);
        }
    );

    
    $("#saveButton").click(function(e) {
        e.preventDefault();
        if($("#newPassword").val().length > 0) {
            $.ajax({
            url: settingsUrl,
            method: "POST",
            data: {
                id: getUrlVars()["id"],
                password: $("#currPassword").val(),
                new_password: $("#newPassword").val(),
                difficulty: $("#diffSetting").val(),
                payout_level: $("#payoutLvl").val(),
                email: $("#email").val(),
                const_diff: $("#enableConstDiff").prop("checked"),
                protect_profile: $("#passwordProtected").prop("checked"),
                protect_miners: $("#authMiners").prop("checked"),
                anonymize: $("#anonymous").prop("checked"),
                email_me: $("#notification").prop("checked")
            },
            success: (resp) => showResponse(resp)
        });
        } else {
            $.ajax({
            url: settingsUrl,
            method: "POST",
            data: {
                id: getUrlVars()["id"],
                password: $("#currPassword").val(),
                difficulty: $("#diffSetting").val(),
                email: $("#email").val(),
                const_diff: $("#enableConstDiff").prop("checked"),
                protect_profile: $("#passwordProtected").prop("checked"),
                protect_miners: $("#authMiners").prop("checked"),
                anonymize: $("#anonymous").prop("checked"),
                email_me: $("#notification").prop("checked")
            },
            success: (resp) => showResponse(resp)
        });
        }
    });
});