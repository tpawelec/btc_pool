/* Currency Variable */
var cCurrency = "USD";
var cPrice = '';

/* User id */
var userId = 'a';

/* API */
var apiUrl = 'http://work.monero.me:12345/api/user-data.php';

/* DOMs */
var btn = $('#currencySelect');
var pplnsDOM =$('#pplnsWindow');

var pplnsWidth;

function loadData(resp) {
	var pplns = resp.pplns_window;
	
	var totalShares = 0;

	pplns.forEach(function(block){
		totalShares += block.total_shares;
	})

	var factor = Math.floor(totalShares / pplnsWidth)
	console.log(pplnsWidth);

	pplns.forEach(function(block, index) {
		pplnsDOM.append('<li class="block" id='+ index +'></li>');
		var currBlock = $('#pplnsWindow > .block:nth-child(' + (index + 1) +')');

		currBlock.css({'width': Math.floor(block.total_shares / factor)});
		currBlock.append('<li style="width: ' + Math.floor((block.user_shares*10) / factor) + 'px"></li>');

	})
}

function callApi() {
	$.ajax({
		url: apiUrl,
		method: 'GET',
		data: {
			id: userId
		},
		success: (response) => loadData(response),
		error: (response) => showError(response)
	});
}
$(document).ready(function () {

    'use strict';
    
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

    /* Show miner ID on Dashboard */
    $('#minerId').text(userId);

    var winWidth = $('.container').width();
    console.log(winWidth)
    pplnsWidth = Math.floor(winWidth * 0.9);
    pplnsDOM.css({'width': pplnsWidth});

    callApi();
});