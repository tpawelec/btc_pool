
/* Currency Variable */
var cCurrency = "USD";
var cPrice = '';

/* DROPDOWN MENU DOM */
var btn = $('#currencySelect');


/* API user panel */
var apiUrlUser = 'http://work.monero.me:12345/api/user-data.php';

/* API frontpage */

var chartUrl = 'http://work.monero.me:12345/api/pool-graph.php';
var coinUrl = 'http://work.monero.me:12345/api/pool-coin.php';
var poolUrl = 'http://work.monero.me:12345/api/pool-front.php';


/* User payouts link */
var userPayoutUrl = 'https://xmrchain.net/tx/#/1';

/* Zebra for tables */
var bgSec = '#1B5389'

/* Cookie value without ID */
var cookieVal = 'mock_token_value_';

var x = window.matchMedia("(max-width: 680px)")

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function updateNavUrl(){
    if(localStorage.userIdNotLogged == null && localStorage.userIdLogged != null) {
        $('#userLink').attr('href', 'user-panel.html?id=' + localStorage.userIdLogged);
    } else if(localStorage.userIdLogged == null && localStorage.userIdNotLogged != null) {
        $('#userLink').attr('href', 'user-panel.html?id=' + localStorage.userIdNotLogged);
    } else if(localStorage.userIdLogged != null && localStorage.userIdNotLogged != null) {
        $('#userLink').attr('href', 'user-panel.html?id=' + localStorage.userIdLogged);
    }
}

/* Gets user ID from cookie */
function getUserCookieVal(name) {
    var getCookieValues = function(cookie) {
        var cookieArray = cookie.split('=');
        return cookieArray[1].trim();
    };

    var getCookieNames = function(cookie) {
        var cookieArray = cookie.split('=');
        return cookieArray[0].trim();
    };

    var cookies = document.cookie.split(';');
    var cookieValue = cookies.map(getCookieValues)[cookies.map(getCookieNames).indexOf(name)];

    return (cookieValue === undefined) ? null : cookieValue.split(cookieVal)[1];
}

function changeNavHeight(x) {
    if (localStorage.userIdNotLogged != null || localStorage.userIdLogged != null) {
        if (x.matches) { // If media query matches
            $(".nav-bar").css({
                'height' : '14.7rem'
            });
            $("#logOut").css({
                'top' : '7.7rem'
            })
        } 
    } else {
        if(x.matches) {
             $(".nav-bar").css({
                'height' : '12.7rem'
            });
            $("#logOut").css({
                'top' : '5.5rem'
            })
        }
    }
}
$(document).ready(function() {

    /*
        Configure Offline.js
    */
    Offline.options = {
        checkOnLoad: false, // to check the connection status immediatly on page load.
        interceptRequests: true, // to monitor AJAX requests to check connection.
        reconnect: { // to automatically retest periodically when the connection is down (set to false to disable).
            initialDelay: 3, // delay time in seconds to wait before rechecking.
            delay: 10 // wait time in seconds between retries.
        },
        checks: {
            image: {
                url: 'https://www.google.pl/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png'
            }, 
            active: 'image'
        },
        requests: true // to store and attempt to remake requests which failed while the connection was down.
    };


    var run = function(){
        if (Offline.state === 'up')
        Offline.check();
        }
        setInterval(run, 5000);   
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
        Global AJAX Setup for error
    */
    $.ajaxSetup({
        error: function(jqXHR, exception) {
            $(".css-popup").css({
                display: "block"
            });
            $('.server-problem').css({
                display: "block"
            })
        }
    });


    if(localStorage.userIdNotLogged != null || localStorage.userIdLogged != null) {
        $('#userLink').css({
            display: 'inline-block'
        });
        $('#logOut').css({
            display: 'flex'
        });

        updateNavUrl();
    } else {
        $('#userLink').css({
            display: 'none'
        });
        $('#logOut').css({
            display: 'none'
        });
    }

    /*
        Change height of navigation on mobiles if logged
    */
    
    changeNavHeight(x);
    x.addListener(changeNavHeight);
    /*
        Event for "Logout"
    */
    $('#logOut').click(function(e){
    	e.preventDefault();
    	document.cookie = 'user_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    	localStorage.removeItem("userIdLogged");
        localStorage.removeItem("userIdNotLogged");
    	window.location.href = "index.html";
    })

});