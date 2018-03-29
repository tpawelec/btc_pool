
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

/* Zebra for tables */
var bgSec = '#1B5389'
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
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
    }

    /*
        Event for "Logout"
    */
    $('#logOut').click(function(e){
    	e.preventDefault();
    	document.cookie = 'user_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    	localStorage.removeItem("id");
    	window.location = "index.html";
    })

});