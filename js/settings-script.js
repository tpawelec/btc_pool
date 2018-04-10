$(document).ready(function() {

	var $tooltip = $('.col-tooltip');
	var duration = 500;
	$tooltip.hide();
	$('#newPasswordConfirm').focusout(function() {
		if($(this).val() != $('#newPassword').val()) {
			$tooltip.slideDown(duration);
			$(this).focus()
		}
	});

	$('#newPasswordConfirm').on('keyup', function() {
			$tooltip.slideUp(duration);
		}
	);
});