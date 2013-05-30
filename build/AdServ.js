"use strict";
/*!
 * AdServ 0.0.8 / 2013-05-30 08:56:41
 * @author Brian Demant <brian.demantgmail.com> (2013)
 */
(function (window, definition) { 
	window.AdServ = definition(window, window.document); 
})(window,  function (window, document) { 
	var AdServ = window.AdServ || {};
	AdServ.version = '0.0.8';
	AdServ.released = '2013-05-30 08:56:41';
	window.AdServ = AdServ; 
	// header ----------------------------------------------------------------------

	// Source: src/legacy.js
	// -----------------------------------------------------------------------------
	AdServ.adspaces = AdServ.adspaces || window.ba_adspaces || [];
	window.adServingLoad = window.adServingLoad || '';

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



	// Source: src/dom.js
	// -----------------------------------------------------------------------------
	var getElem = function(query) {
		if (isElement(query)) {
			return query;
		}
		var kind = query.charAt(0);
		return (kind === '#') ? document.getElementById(query.substr(1)) : null;
	};
	AdServ.$ = getElem;

	var getComputedStyle;
	if (!window.getComputedStyle) {
		getComputedStyle = function(el, pseudo) {
			this.el = getElem(el);
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
		elem = getElem(elem);
		return getComputedStyle(getElem(elem)).getPropertyValue(name);
	};

	AdServ.css = css;

	var isVisible = function(elem) {
		elem = getElem(elem);
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
		eventHandlers[event] = (eventHandlers[event] === undefined) ? [] : eventHandlers[event];

		eventHandlers[event].push(function (args) {
			return fn.apply(context || window, args);
		}); 
	};

	AdServ.on = on;
	  

	/**
	* @param event name of event
	*/
	var emit = function (event) {
		if (eventHandlers[event] !== undefined) {
			var args = Array.prototype.slice.call(arguments, 1);
			for (var i = 0; i < eventHandlers[event].length; i++) {
				eventHandlers[event][i](args);
			}
		} 
	};

	AdServ.emit = emit;
	// 
	var originalResize = window.onresize || noop;
	window.onresize = function() {
//		console.log('Adserv.emit : resize'); 
		emit('resize'); 
		originalResize();
	} ;



	// Source: src/json.js
	// -----------------------------------------------------------------------------
	var evil = function(s) {
		return (new Function("return (" + s + ")"))();
	};

	/**
	 * a minimal JSON parser .. based on json2 (https://github.com/douglascrockford/JSON-js)
	 *
	 * defaults to built in JSON.parse
	 */
	AdServ.parseJSON = typeof JSON === 'object' ? JSON.parse : function(source) {
		source += "";
		if (source != '') {

			// support for chinese?
	//	var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
	//	//cx.lastIndex = 0;
	//	if (cx.test(source)) {source = source.replace(cx, function (a) {return"\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)})}
			var simplified = source
				.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@")
				.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]")
				.replace(/(?:^|:|,)(?:\s*\[)+/g, "");
			if (/^[\],:{}\s]*$/.test(simplified)) {
				return evil(source);
			}
		}
		throw  "parseJSON failed";
	};

	// footer ----------------------------------------------------------------------
	return AdServ; 
});