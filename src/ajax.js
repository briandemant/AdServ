"use strict";


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
	try { xhr = new XMLHttpRequest(); } catch (e) {
		try { xhr = new ActiveXObject("Msxml2.XMLHTTP"); } catch (e) {
			return null;
		}
	}
	var abort = function() {
		xhr.abort();
		cb("aborted by a timeout", null, xhr);
	};

	requestTimeout = setTimeout(abort, 5000);
	xhr.onreadystatechange = function() {
		if (xhr.readyState != 4) {
			return;
		}
		clearTimeout(requestTimeout);
		cb(xhr.status != 200 ? "err : " + xhr.status : null, xhr.responseText, xhr);
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
