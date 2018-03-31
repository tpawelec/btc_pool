
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

/* User ID typed in login input */
var userIdGlobal;

/* User payouts link */
var userPayoutUrl = 'https://xmrchain.net/tx/';
var userPayoutUrlSuffix = '/1';

/* Zebra for tables */
var bgSec = '#1B5389'

/* Cookie value without ID */
var cookieVal = 'mock_token_value_';

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
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

$(document).ready(function() {
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

    /*
    If user is logged "User panel" and "Logout" is displayed
    */
   if(document.cookie.indexOf('user_token') < 0) {
        $('#userLink').css({
            display: 'none'
        });
        $('#logOut').css({
            display: 'none'
        });
    } else {
        $('#userLink').css({
            display: 'inline-block'
        });
        $('#logOut').css({
            display: 'flex'
        });

    $('#userLink').attr('href', 'user-panel.html?id=' + getUserCookieVal('user_token'));
    }

    /*
        Event for "Logout"
    */
    $('#logOut').click(function(e){
    	e.preventDefault();
    	document.cookie = 'user_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    	localStorage.removeItem("id");
    	window.location.href = "index.html";
    })

});