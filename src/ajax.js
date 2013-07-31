"use strict";

// Basic AJAX get request .. aborts after 5 seconds 
//
// *Usage:*
// 
//		AdServ.get('http://something', function (err,data,xhr) {
//		  if (err)
//		    alert(err)
//		  else
//		    process(data);
//		});  

var get = AdServ.get = function(url, cb) {
	var requestTimeout, xhr;
	if (window.XDomainRequest) {
		xhr = new XDomainRequest();
		xhr.onprogress = function() {};
		/* ie9 bugfix*/
	} else if (window.XMLHttpRequest) {
		xhr = new XMLHttpRequest();
	} else {
		try {
			xhr = new activeX("Msxml2.XMLHTTP");
		} catch (e) {
			return null;
		}
	}

	// Abort after 5 seconds 
	requestTimeout = setTimeout(function abort() {
		xhr.abort();
		cb("aborted by a timeout", null, xhr);
	}, 5000);

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			// `onload` reset as it will re-issue the cb 
			xhr.onload = noop;

			cancelAbort();

			cb(xhr.status != 200 ? "err : " + xhr.status : null, xhr.responseText, xhr);
		}
	};

	// Remove abort trigger
	function cancelAbort() {
		clearTimeout(requestTimeout);
	}

	xhr.onload = function() {
		cancelAbort();
		if (xhr.status) {
			// Will this ever happen? 
			console.error('onload with status!!!');

			cb(xhr.status != 200 ? "err : " + xhr.status : null, xhr.responseText, xhr);
		} else {
			cb(xhr.responseText ? null : "err : no response", xhr.responseText, xhr);
		}
	};

	// Go go go!
	xhr.open("GET", url, true);
	xhr.send();
	return xhr;
};

// Same as AdServ.get but data is passed as json 
var getJSON = AdServ.getJSON = function(url, cb) {
	return get(url, function(err, value, xhr) {
		var json = value;
		if (!err) {
			json = parseJSON(value);
		}
		cb(err, json, xhr);
	})
};
