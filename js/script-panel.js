/*
TODO
Search engine
Fix refreshing (flag?)
*/
/* API Urls */

var logApiBase = "http://work.monero.me:12345/api/admin-log.php?auth=a&name=";
/* var logApiBase = "http://work.monero.me:12345/api/admin-log.php?" // auth=a&name=b auth and name will be filled later */

function loadLogs(resp) {
	console.log(resp);
}

/*
	There is one general function for calling LOG API, which takes one argument "name".
*/
function callApiLog(name) {
	return $.get(logApiBase + name);
}

function showError() {
	alert("There is problem with API");
}
/*
	NOTE:
	In mock-api there is probably typo: tile instead of title
*/

function showLogs(log1, log2) {
	var $logsSection = $("#logsTables");
	for(var arg = 0; arg < arguments.length; arg++) {
		var keys = Object.keys(arguments[arg][0]);
		var logObject = arguments[arg][0][keys[0]];
		var $logDiv = $("<div class=\"log\"><h2>" + logObject.tile + "</h2></div>");
		var $logTable = $("<table id=\"" + keys[0] + "\"><thead class=\"header\"><tr></tr></thead><tbody class=\"log-body\"></tbody>")
		$logDiv.append($logTable);
		$logsSection.append($logDiv);

		for(var headerIndex = 0; headerIndex < logObject.headers.length; headerIndex++) {
			$('#' + keys[0] + ' .header tr').append("<th>" + logObject.headers[headerIndex] + "</th>");
		}

		var $logTableBody = $('#' + keys[0] + ' .log-body')
		for(var recordIndex = 0; recordIndex < logObject.body.length; recordIndex++) {
			$logTableBody.append($("<tr><td>" + logObject.body[recordIndex][0] + "</td><td>" + logObject.body[recordIndex][1] + "</td></tr>"))
		}
	}
}
/*
	"Container" for calling log APIs. There are two mock-APIs: "a" and "b". 
	When official API will be relased add/remove invokation of callApiLog, change name
	and add argument in showLogs definition.
*/
function gatherLogs() {
	$.when(
		callApiLog("a"), 
		callApiLog("dfgd"))
	.done(
		showLogs)
	.fail( 
		showError);
}
$(document).ready(function () {
	gatherLogs();

	//setTimeout(gatherLogs, 10000);

	/* Search Function */
	$("#searchButton").click(function (e) {
		e.preventDefault();
		if ($('#searchField').val().length !== 0) {

			$('table').each(function() {

    		//Handle special characters used in regex
    		var searchregexp = new RegExp($("#searchField").val().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "gi");

        //$& will maintain uppercase and lowercase characters.
        $(this).html($(this).html().replace(searchregexp, "<span class = 'highlight'>$&</span>"));
        
    });

		}

	})
})