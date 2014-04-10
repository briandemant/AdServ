"use strict";
// ### AdServ.get
//
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
//
// **params:** 
//
//  * **url** url to call
//  * **cb** callback to call when the request is done or failed
//
// **returns:** XDomainRequest or XMLHttpRequest
function get(url, cb) {
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

	requestTimeout = setTimeout(function abort() {
		xhr.abort();
		cb("aborted by a timeout", null, xhr);
	}, 5000);

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			/* `onload` reset as it will re-issue the cb */
			xhr.onload = noop;

			cancelAbort();

			cb(xhr.status != 200 ? "err : " + xhr.status : null, xhr.responseText, xhr);
		}
	};

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

	xhr.open("GET", url, true);
	xhr.send();
	return xhr;
};
AdServ.get = get;

// ### AdServ.getJSON
//
// Same as AdServ.get but data is passed as json  
//
// **params:** 
//
//  * **url** url to call
//  * **cb** callback to call when the request is done or failed
//
// **returns:** XDomainRequest or XMLHttpRequest 
//  
function getJSON(url, cb) {
	return get(url, function(err, value, xhr) {
		var json = value;
		if (!err) {
			try {
				json = parseJSON(value);
			} catch (e) {
				console.log("malformed json", url, e);
				return cb("malformed json : " + e.message);
			}
		}
		cb(err, json, xhr);
	})
};
AdServ.getJSON = getJSON;

/**
 * Call and execute a js script
 *
 *  http://www.html5rocks.com/en/tutorials/speed/script-loading/
 *
 * @method    AdServ.loadScript
 * @public
 *
 * @param     {String}    url       default options
 * @param     {Function}  [onload]  callback on "onload" .. called before script
 *
 * @example
 *   loadScript("http://fmadserving.dk/main.js");
 *
 *
 *   loadScript("http://fmadserving.dk/main.js", function () {
 *	    console.log('loaded!');
 *   });
 */
function loadScript(url, onload) {
	onload = onload || noop;
	var script = document.createElement("script");
	// document.body is for ie6 support
	var head = document.head || document.body;
	script.src = (url.indexOf("?") > 0 ? url + "&" : url + "?") + 'rnd=' + Math.random();

	script.onload = script.onreadystatechange = function() {
		if (!script[readyState] || script[readyState] == "loaded" || script[readyState] == "complete") {
			onload();
			head.removeChild(script);
			script.onload = script.onreadystatechange = noop;
		}
	};
	head.appendChild(script);
}
AdServ.loadScript = loadScript;
