"use strict";
/*!
 * AdServ 0.0.8 / 2013-06-03 13:57:32
 * @author Brian Demant <brian.demantgmail.com> (2013)
 */
(function (window, definition) { 
	window.AdServ = definition(window, window.document); 
})(window,  function (window, document) { 
	var AdServ = window.AdServ || {};
	AdServ.version = '0.0.8';
	AdServ.released = '2013-06-03 13:57:32';
	window.AdServ = AdServ; 
	// header ----------------------------------------------------------------------

	// Source: src/legacy.js
	// -----------------------------------------------------------------------------
	var isFunction = function(fn) {
		return fn && typeof fn === "function";
	};
	var isObject = function(obj) {
		return obj && typeof obj === "object";
	};
	var isArray= function(obj) {
		return obj && obj.toString() === "[object Array]";
	};
	var isString = function(str) {
		return str && typeof str === "string";
	};
	var isUndefined = function(obj) {
		return obj && typeof obj === "undefined";
	};
	var isElement = function(value) {
		return value ? value.nodeType === 1 : false;
	};
	var isNode = function(value) {
		return value ? value.nodeType === 9 : false;
	};
	 
	var noop = function () {};



	// Source: src/ajax.js
	// -----------------------------------------------------------------------------
	AdServ.conf = {xhrTimeout: 5000, baseUrl: ''};

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
	AdServ.get = function (url, cb) {
		var requestTimeout, xhr;
		try { xhr = new XMLHttpRequest(); } catch (e) {
			try { xhr = new ActiveXObject("Msxml2.XMLHTTP"); } catch (e) {
				return null;
			}
		}
		var abort = function () {
			xhr.abort();
			cb("aborted by a timeout", null, xhr);
		};

		requestTimeout = setTimeout(abort, AdServ.conf.xhrTimeout);
		xhr.onreadystatechange = function () {
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
	AdServ.getJSON = function (url, cb) {
		return AdServ.get(url, function (err, value, xhr) {
			var json = value;
			if (!err) {
				json = AdServ.parseJSON(value);
			}
			cb(err, json, xhr);
		})
	};
	



	// Source: src/dom.js
	// -----------------------------------------------------------------------------
	var $ = function(selector, el) {
		if (isElement(selector)) {
			return selector;
		}
		if (!el) {el = document;}
		return el.querySelector(selector);
	};

	var $$ = function(selector, el) {
		if (!el) {el = document;}
		return Array.prototype.slice.call(el.querySelectorAll(selector));
	};

	 
	AdServ.$ = $;
	AdServ.$$ = $$;

	var getComputedStyle;
	if (!window.getComputedStyle) {
		getComputedStyle = function(el, pseudo) {
			this.el = $(el);
			this.getPropertyValue = function(prop) {
				var re = /(\-([a-z]){1})/g;
				if (prop == 'float') {
					prop = 'styleFloat';
				}
				if (re.test(prop)) {
					prop = prop.replace(re, function() {
						return arguments[2].toUpperCase();
					});
				}
				return el.currentStyle[prop] ? el.currentStyle[prop] : null;
			};
			return this;
		};
	} else {
		getComputedStyle = window.getComputedStyle;
	}

	var css = function(elem, name) {
		elem = $(elem);
		return getComputedStyle($(elem)).getPropertyValue(name);
	};

	AdServ.css = css;

	var isVisible = function(elem) {
		elem = $(elem);
		if (!elem) {
			return false;
		}
		if (elem.nodeName === 'BODY') {
			return true;
		}
		if (css(elem, 'visibility') == 'hidden') {
			return false;
		}

		if (css(elem, 'display') == 'none') {
			return false;
		}
		if (css(elem, 'opacity') == '0') {
			return false;
		}
		return isVisible(elem.parentNode);
	};

	AdServ.isVisible = isVisible;

	



	// Source: src/event.js
	// -----------------------------------------------------------------------------
	var eventHandlers = {};

	/**
	 *
	 * @param event eventname
	 * @param fn callback
	 * @param context scope to bind to .. defaults to window
	 */
	var on = function (event, fn, context) {
		// initialze if first
		eventHandlers[event] = (typeof eventHandlers[event] === 'undefined') ? [] : eventHandlers[event];

		eventHandlers[event].push(function (args) {
			return fn.apply(context || window, args);
		});
	};

	AdServ.on = on;

	var once = function (event, fn, context) {
		on(event, function () {
			fn();
			fn = noop;
		}, context);
	};

	AdServ.once = once;

	/**
	 * @param event name of event
	 */
	var emit = function (event) {
		if (typeof eventHandlers[event] !== 'undefined') {
			var args = Array.prototype.slice.call(arguments, 1);
			for (var i = 0; i < eventHandlers[event].length; i++) {
				eventHandlers[event][i](args);
			}
		}
	};

	AdServ.emit = emit;
	// 
	var originalResize = window['onresize'] || noop;
	window.onresize = function () {
		try {
			originalResize();
		} catch (e) {}
		//console.log('Adserv.emit : resize'); 
		emit('resize');
	};

	var loaded = false;

	var originalLoad = window.onload || noop;

	window.onload = function () { 
		loaded = true;
		try {
			originalLoad();
		} catch (e) {}

		//console.log('Adserv.emit : resize'); 
		emit('load');
	};

	var ready = function (fn) {
		if (loaded) {
			fn()
		} else {
			once('load', fn);
		}
	};

	AdServ.ready = ready;



	// Source: src/json.js
	// -----------------------------------------------------------------------------
	// IE7 was the last not to have JSON.parse so we can remove the backup (loog in git if you need it)
	var parseJSON = JSON.parse;

	AdServ.parseJSON = parseJSON;



	// Source: src/api.js
	// -----------------------------------------------------------------------------
	var load = function() {
		console.log('loading %o', AdServ);

	};
	AdServ.load = load;

	// footer ----------------------------------------------------------------------
	return AdServ; 
});