"use strict";

var tellTransport = function(trans) {
	console.log("using " + trans);
	tellTransport = noop; // but only once
};
var tellEvent= function(trans) {
	console.log("using " + trans);
	tellEvent = noop; // but only once
};

/**
 * basic AJAX get request .. aborts after 5 seconds (AdServ.conf.xhrTimeout = 5000)
 *
 * usage
 *
 * AdServ.get('http://something', function (err,data,xhr) {
	 * if (err)
	 *   alert(err)
	 * else
	 *    process(data);
	 * });
 *
 * @param url
 * @param cb callback
 * @returns XMLHttpRequest
 */
var get = AdServ.get = function(url, cb) {
	var requestTimeout, xhr;
	if (window.XDomainRequest) {
		tellTransport("XDomainRequest");
		xhr = new XDomainRequest();
	} else if (window.XMLHttpRequest) {
		tellTransport("XMLHttpRequest");
		xhr = new XMLHttpRequest();
	} else {
		try {
			xhr = new ActiveXObject("Msxml2.XMLHTTP");
			tellTransport("XMLHTTP");
		} catch (e) {
			return null;
		}
	}

	var abort = function() {
		xhr.abort();
		cb("aborted by a timeout", null, xhr);
	};

	requestTimeout = setTimeout(abort, 5000);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			tellEvent('onreadystatechange');
			xhr.onload = noop; // onload reset as it will re-issue the cb
//			console.log('onreadystatechange ' + xhr.readyState);
			clearTimeout(requestTimeout);
			cb(xhr.status != 200 ? "err : " + xhr.status : null, xhr.responseText, xhr);
		}
	};
	xhr.onload = function() {
		tellEvent('onload');

		clearTimeout(requestTimeout);
		if (xhr.status) {
			// will this ever happen?
			for (var i = 0; i < 10; i++) {
				console.log('onload with status');
			}
			
			cb(xhr.status != 200 ? "err : " + xhr.status : null, xhr.responseText, xhr);
		} else {
			cb(xhr.responseText ? null : "err : no response", xhr.responseText, xhr);
		}
	};
	xhr.open("GET", url, true);
	xhr.send();
	return xhr;
};

/**
 * same as AdServ.get but data is passed as parsed json
 */
var getJSON = AdServ.getJSON = function(url, cb) {
	return get(url, function(err, value, xhr) {
		var json = value;
		if (!err) {
			json = parseJSON(value);
		}
		cb(err, json, xhr);
	})
};
