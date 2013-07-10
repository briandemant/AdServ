"use strict";


/**
 * basic AJAX get request .. aborts after 5 seconds 
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
		xhr = new XDomainRequest();
		xhr.onprogress = function() {}; // ie9 bug
	} else if (window.XMLHttpRequest) {
		xhr = new XMLHttpRequest();
	} else {
		try {
			xhr = new activeX("Msxml2.XMLHTTP");
		} catch (e) {
			return null;
		}
	}
 
	requestTimeout = setTimeout(function abort() {
		xhr.abort();
		cb("aborted by a timeout", null, xhr);
	}, 5000);
	
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			xhr.onload = noop; // onload reset as it will re-issue the cb
//			console.log('onreadystatechange ' + xhr.readyState);
			clearTimeout(requestTimeout);
			cb(xhr.status != 200 ? "err : " + xhr.status : null, xhr.responseText, xhr);
		}
	};
	xhr.onload = function() {
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
