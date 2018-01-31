/*
TODO
Search engine!!
*/
/* API Urls */

var logApiBase = "http://work.monero.me:12345/api/admin-log.php?auth=a&name=";
/* var logApiBase = "http://work.monero.me:12345/api/admin-log.php?" // auth=a&name=b auth and name will be filled later */

/* "Flags" */
var searchF = {};

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
		var columns = logObject.headers.length;
		var $logDiv = $("<div class=\"log\"><h2>" + logObject.tile + "</h2></div>");
		var $logTable = $("<table id=\"" + keys[0] + "\"><thead class=\"header\"><tr></tr></thead><tbody class=\"log-body\"></tbody></table>")
		searchF[keys[0]] = '';
		$logDiv.append($logTable);
		$logsSection.append($logDiv);

		for(var headerIndex = 0; headerIndex < columns; headerIndex++) {
			$('#' + keys[0] + ' .header tr').append("<th>" + logObject.headers[headerIndex] + "</th>");
		}

		var $logTableBody = $('#' + keys[0] + ' .log-body');
		//for(var recordIndex = logObject.body.length - 1; recordIndex >= 0; recordIndex--) {
		// ^ whole log or last 50 entries \/
		for(var recordIndex = logObject.body.length - 1; recordIndex >= (logObject.body.length / 2); recordIndex--) {
			$logTableBody.append("<tr></tr>");
			var $row = $logTableBody.find("tr:last-child");
			for(var colCell = 0; colCell < columns; colCell++) {
				$row.append("<td>" + logObject.body[recordIndex][colCell] + "</td>")
			} 
		}

		var searchForm = '<form class="search-form">\
						<input id="searchField' + keys[0] + '"  type="text" name="Search">\
						</form>'
		$logTable.after(searchForm);
	}
}

function refreshTables(log1, log2) {
	console.log("reff")
	var $logsSection = $("#logsTables");
	for(var arg = 0; arg < arguments.length; arg++) {
		var keys = Object.keys(arguments[arg][0]);
		var logObject = arguments[arg][0][keys[0]];
		var columns = logObject.headers.length;

		var $logTableBody = $('#' + keys[0] + ' .log-body');
		$logTableBody.find("tr").remove();
		//for(var recordIndex = logObject.body.length - 1; recordIndex >= 0; recordIndex--) {
		// ^ whole log or last 50 entries \/
		for(var recordIndex = logObject.body.length - 1; recordIndex >= (logObject.body.length / 2); recordIndex--) {
			$logTableBody.append("<tr></tr>");
			var $row = $logTableBody.find("tr:last-child");
			for(var colCell = 0; colCell < columns; colCell++) {
					$row.append("<td>" + logObject.body[recordIndex][colCell] + "</td>");
			} 
		}

		if(searchF[keys[0]] != '') {
			filterTable(keys[0]);
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

function refreshLogs() {
	$.when(
		callApiLog("a"), 
		callApiLog("dfgd"))
	.done(
		refreshTables)
	.fail( 
		showError);
}

function filterTable (id) {
	if(searchF[id].length !== 0) {

		//var searchregexp = new RegExp('[a-z]*' + $('#searchField' + id).val() + "[a-z]*", "gi");
		var searchregexp = new RegExp('[a-z]*' + searchF[id] + "[a-z]*", "gi");
		$("#" + id + " > tbody tr").each(function() {
			if(!searchregexp.test($(this).children().text())) {
				$(this).css({'display': 'none'});
			} else {
				$(this).css({'display': 'table-row'});
			}

		})
	}
}

$(document).ready(function () {
	gatherLogs();

	setInterval(refreshLogs, 10000);

	/* Search Function */
	$("body").on('click', 'button', function (e) {
		e.preventDefault();
		var tableId = e.currentTarget.id.substr('searchButton'.length);
		highlightWords(tableId);
		
	});

	$("body").on('keyup', 'input', function (e) {
		if((e.which > 32 && e.which < 127) || e.which == 08) {
			var tableId = e.currentTarget.id.substr('searchField'.length);
			searchF[tableId] = e.currentTarget.value;
			console.log(searchF);
			filterTable(tableId);
		}
	})

	$("#searchField").keypress(function (e) {
		if(e.which == 13) {
			highlightWords(e);
		}
	})
})