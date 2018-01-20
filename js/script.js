/*jslint browser: true*/ /*global  $, window*/

$(document).ready(function () {


    'use strict';
    var cCurrency = "usd";

    /* DROPDOWN MENU WITH CURRENCIES */
    var btn = $('#currencySelect');

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
        btn.text(cCurrency);
    });

});