$(document).ready(function() {
	$('#newPasswordConfirm').focusout(function() {
		if($(this).val() === $('#newPassword').val()) {
			console.log("tosamo")
		}
	})
})