/* API Urls */

var logApiBase = "http://work.monero.me:12345/api/admin-log.php?auth=a&name=a";
/* var logApiBase = "http://work.monero.me:12345/api/admin-log.php?" // auth=a&name=b auth and name will be filled later */

function loadLogs(resp) {
	console.log(resp);
}
function callApiLog() {
	$.ajax({
		url: logApiBase,
		method: 'GET',
		success: (response) => loadLogs(response)
	})
}
$(document).ready(function () {
	callApiLog();
})