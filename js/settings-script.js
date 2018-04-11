function showResponse(resp) {
	var $respPopup = $('.server-response');
	$('.css-popup').css({
		visibility: "visible",
		opacity: 1
    });
	$('.css-popup > .wrapper > *:not(p)').css({
            display: 'none'
        });
    $respPopup.css({
        	display: 'flex'
        })
	if(resp.error) {
		$respPopup.html('<p class="prompt-sign api-fail">&#x2714;</p><p class="message">' + resp.msg + '</p>');
	} else {
		$respPopup.html('<p class="prompt-sign api-success">&#x2714;</p><p class="message">' + resp.msg + '</p>');
	}
}

$(document).ready(function() {

	var $tooltip = $('.col-tooltip');
	var duration = 500;
	$tooltip.hide();
	$('#newPasswordConfirm').focusout(function() {
		if($(this).val() != $('#newPassword').val()) {
			$tooltip.slideDown(duration);
			$('#newPassword').focus()
		}
	});

	$('#newPasswordConfirm').on('keyup', function() {
			$tooltip.slideUp(duration);
		}
	);

	$.ajax({
		url: settingsUrl,
		method: 'GET',
		data: {
			id: getUrlVars()['id']
		},
		success: function(resp) {
			$('#diffSetting').val(resp.difficulty);
			$('#email').val(resp.email);
			$('#enableConstDiff').prop("checked", _ => resp.const_diff);
			$('#passwordProtected').prop("checked", _ => resp.protect_profile);
			$('#authMiners').prop("checked", _ => resp.protect_miners);
			$('#anonymous').prop("checked", _ => resp.anonymize);
			$('#notification').prop("checked", _ => resp.email_me);
			
		}
	});
	// {"difficulty":0,"email":"","const_diff":false,"protect_profile":false,"protect_miners":false,"anonymize":false,"email_me":false}
	$('#saveButton').click(function(e) {
		e.preventDefault();
		if($('#newPassword').val().length > 0) {
			$.ajax({
			url: settingsUrl,
			method: 'POST',
			data: {
				id: getUrlVars()['id'],
				password: $('#currPassword').val(),
				new_password: $('#newPassword').val(),
				difficulty: $('#diffSetting').val(),
				email: $('#email').val(),
				const_diff: $('#enableConstDiff').prop("checked"),
				protect_profile: $('#passwordProtected').prop("checked"),
				protect_miners: $('#authMiners').prop("checked"),
				anonymize: $('#anonymous').prop("checked"),
				email_me: $('#notification').prop("checked")
			},
			success: (resp) => showResponse(resp)
		});
		} else {
			$.ajax({
			url: settingsUrl,
			method: 'POST',
			data: {
				id: getUrlVars()['id'],
				password: $('#currPassword').val(),
				difficulty: $('#diffSetting').val(),
				email: $('#email').val(),
				const_diff: $('#enableConstDiff').prop("checked"),
				protect_profile: $('#passwordProtected').prop("checked"),
				protect_miners: $('#authMiners').prop("checked"),
				anonymize: $('#anonymous').prop("checked"),
				email_me: $('#notification').prop("checked")
			},
			success: (resp) => showResponse(resp)
		});
		}
	});

	$('.css-popup .close').click(function (e) {
        e.preventDefault();           
        $('.css-popup').css({
            visibility: "hidden",
            opacity: 0
        });
    });
});