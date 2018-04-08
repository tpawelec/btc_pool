
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

/* Intervals for apicalls */
var frontInterval = [null, null],
    adminInterval = [null, null],
    userInterval = [null, null];


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
        Check if user is online
    *
    var checkStatus = function() {
        if (navigator.onLine) {
            $('.css-popup').css({
                visibility: "hidden",
                opacity: 0
            });
        } else {
            $('.css-popup').css({
                visibility: "visible",
                opacity: 1
            });
            $('.css-popup > .wrapper > *:not(p)').css({
                display: 'none'
            });
            $('.online-problem').css({
                display: 'flex'
            });
        }
    }
    checkStatus();

    window.addEventListener("ononline", function() {
        console.log("online")
        checkStatus();
    })
    window.addEventListener("onoffline", function() {
        console.log("offline")
        checkStatus();
    })
    */

    Offline.options = {
        checkOnLoad: true,
        interceptRequests: true,
        reconnect: {
            initialDelay: 3,
            delay: 1.5
        },
        requests: true,
        game: false,
        checks: {
            image: {
                url: 'http://work.monero.me:12345/tiny-image.gif'
            }, 
            active: 'image'}
    }

    Offline.on('up', function () {
        console.log("confirmed-up")
                $('.css-popup').css({
                visibility: "hidden",
                opacity: 0
            });
            });
            Offline.on('confirmed-down', function () {
                 console.log("down")
                 $('.css-popup').css({
                visibility: "visible",
                opacity: 1
            });
            $('.css-popup > .wrapper > *:not(p)').css({
                display: 'none'
            });
            $('.online-problem').css({
                display: 'flex'
            });
            });

        setInterval(function() {Offline.check()}, 1000);
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