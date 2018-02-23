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

	pplns.forEach(function(block, index) {
		pplnsDOM.append('<li class="block" id='+ index +'></li>');
		var currBlock = $('#pplnsWindow > .block:nth-child(' + (index + 1) +')');

		currBlock.css({'width': Math.floor(block.total_shares / factor)});
		currBlock.append('<li style="width: ' + Math.floor((block.user_shares*10) / factor) + 'px"></li>');

	})
	$('body').on('mouseover', '.block', function(e) {
		e.preventDefault();
		if(e.target === this) {
			var i = e.target.id;
		} else {
			var i = e.target.parentNode.id;
		}
			if(pplns[i].block_id === null) {
				$('#blockId').text('null');
			} else {
				$('#blockId').text(pplns[i].block_id);
			}
			$('#shares').text(pplns[i].user_shares);
			$('#payout').text(pplns[i].user_payout + ' (' + (pplns[i].user_payout * cPrice).toFixed(3) + ') ' + cCurrency);
			$('#onHover').css({'display' : 'block',  'opacity' : 1, 'top' : e.pageY, 'left' : e.pageX});
		
	});

	$('body').on('mouseout', '.block', function(e){ 
	//	if(e.target === this) {
			$('#onHover').css({'display' : 'none', 'opacity' : 0}); 
	//	}
	});

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

	 $.ajax({
        url: coinUrl,
        method: 'GET',
        success: (response) => processCoin(response)
    });
}

function processCoin(resp) {
    'use strict';
    cPrice = resp['pool_coin_price'][cCurrency];
	}
$(document).ready(function () {

    'use strict';

    /* Show miner ID on Dashboard */
    $('#minerId').text(userId);

    var winWidth = $('.container').width();
    pplnsWidth = Math.floor(winWidth * 0.9);
    pplnsDOM.css({'width': pplnsWidth});

    callApi();

    /*
    When clicked on currency variable and html content is updated. Then API is called.
    */
    $('.dropdown-content p').click(function (e) {
        cCurrency = e.currentTarget.id;
        btn.text(cCurrency);
        /* COIN */
    $.ajax({
        url: coinUrl,
        method: 'GET',
        success: (response) => processCoin(response)
    });
    });
});