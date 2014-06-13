	/*!
	 * ## AdServing js library:
	 * Version  : **2.1.2**  
	 * Released : **Fri Jun 13 2014 07:41:53 GMT+0200 (CEST)** 
	 * @author Brian Demant <brian.demantgmail.com> (2013)
	 */

	// Module pattern for scope and more effective minification
	(function (window, definition) { 
		window.AdServ = definition(window, window.document); 
	})(window,  function (window, document) { 
		var AdServ = window.AdServ || {};
		AdServ.version = '2.1.2';
		AdServ.released = 'Fri Jun 13 2014 07:41:53 GMT+0200 (CEST)';
		window.AdServ = AdServ; 
		DEBUG = true;
		
	var
		domContentLoaded = 'DOMContentLoaded',
		addEventListener = 'addEventListener',
		onreadystatechange = 'onreadystatechange',
		readyState = 'readyState'
		; 
		
	 
	// Protect against missing console.log
	AdServ.log_messages = [];
	function safe_log(kind) {
		return function(msg) {
			try {
				AdServ.log_messages.push(kind + ":" + JSON.stringify(msg));
			} catch (e) {
				AdServ.log_messages.push(kind + ":" + msg);
			}
		};
	}

	if (typeof window.console !== 'undefined') {
		var console = window.console;
	} else {
		console = {};
	}
	console.log = console.log || safe_log("log");
	console.debug = console.debug || safe_log("debug");
	console.error = console.error || safe_log("error");
	console.warn = console.warn || safe_log("warn");
	 
	// Protect against missing globals
	window.adServingLoad = window.adServingLoad || '';

	// TODO: test todo
	if (!Date.now) {
		Date.now = function now() {
			return +new Date();
		};
	}
	 
	if (DEBUG) {
		var ie = false;
		(function(ua) {
			var result;
			if (result = /msie\s*(\d+)/.exec(ua)) {
				ie = {
					version : parseInt(result[1])
				}
			} else if (result = /trident\/\s*(\d+)/.exec(ua)) {
				ie = {
					version : parseInt(result[1]) + 4
				}
			}
			if (ie) {
				var jscript = 0 /*@cc_on + @_jscript_version @*/;
				ie.supported = (jscript >= 5.8 || ie.version > 10);
				ie.emulated = (
				( ie.version == 7 && jscript != 5.7) ||
				( ie.version == 8 && jscript != 5.8) ||
				( ie.version == 9 && jscript != 5.9) ||
				( ie.version == 10 && jscript != 10)
				);
			}
		})(navigator.userAgent.toLowerCase());

		AdServ.ie = ie;
	}

	// Shortcuts to maximize minification 
	var toString = Object.prototype.toString;
	var slice = Array.prototype.slice;
	var urlencode = encodeURIComponent;
	var activeX = window.ActiveXObject;

	/**
	 * empty function which does nothing .. it is used for placeholding
	 *
	 * @method    noop
	 * @private
	 */
	function noop() {}

	function randhex(length) {
		return ((1 + Math.random()) * 0x100000000).toString(16).substr(1, length);
	}

	function count() {
		return guid.count.toString(16).substr(1, 4);
	}

	/**
	 * Create a `GUID` to use when an unique id is needed
	 *
	 *
	 * @method    guid
	 * @private
	 *
	 * @return    {String}                     something like `ad_FF40_47A1_0102_F034`
	 */
	function guid() {

		guid.count++;
		if (!guid.date) {
			// 1128117600000 == +new Date("2005-10-01 00:00")
			guid.date = ((Date.now() - 1128117600000) / 1000 | 0).toString(16);
			guid.count = 0x10001;
			setTimeout(function() {
				guid.date = false;
			}, 1000);
		}
		var result = toArray(arguments);
		result.push(guid.date);
		result.push(count());
		result.push(randhex(8));
		return result.join("_");
	}
	AdServ.guid = guid;

	function toArray(list) {
		return slice.call(list, 0);
	}

	/**
	 * detects if item is a function
	 *
	 * @method    isFunction
	 * @private
	 *
	 * @param     {mixed}  item
	 *
	 * @return    {Boolean}
	 */
	function isFunction(item) {
		return item && typeof item === "function";
	}

	/**
	 * Detects if item is an object
	 *
	 * @method    isObject
	 * @private
	 *
	 * @param     {mixed}  item
	 *
	 * @return    {Boolean}
	 */
	function isObject(item) {
		return item && typeof item === "object" && toString.call(item) === "[object Object]";
	}

	/**
	 * Detects if item is an array
	 *
	 * @method    isArray
	 * @private
	 *
	 * @param     {mixed}  item
	 *
	 * @return    {Boolean}
	 */
	function isArray(item) {
		return item && typeof item === "object" && toString.call(item) === "[object Array]";
	}

	/**
	 * Detects if item is a string
	 *
	 * @method    isString
	 * @private
	 *
	 * @param     {mixed}  item    the item to test
	 *
	 * @return    {Boolean}
	 */
	function isString(item) {
		return item && typeof item === "string";
	}

	/**
	 * Detects if item is a string
	 *
	 * @method    isString
	 * @private
	 *
	 * @param     {mixed}  item    the item to test
	 *
	 * @return    {Boolean}
	 */
	function isUndefined(item) {
		return item && typeof item === "undefined";
	}

	/**
	 * Detects if item is a dom element
	 *
	 * @method    isElement
	 * @private
	 *
	 * @param     {mixed}  item    the item to test
	 *
	 * @return    {Boolean}
	 */
	function isElement(item) {
		return item ? item.nodeType === 1 : false;
	}

	/**
	 * Detects if item is a dom node
	 *
	 * @method    isNode
	 * @private
	 *
	 * @param     {mixed}  item    the item to test
	 *
	 * @return    {Boolean}
	 */
	function isNode(item) {
		return item ? item.nodeType === 9 : false;
	}

	/**
	 * Wrap a function and throttle the frequency, so that a given heavy
	 * function will not destroy performance
	 *
	 * @method    throttle
	 * @private
	 *
	 * @param     {Function}  fn    function to wrap
	 * @param     {Function}  ms    minimum ms between calls to the fn
	 */
	function throttle(fn, ms) {
		var disabled = false;
		return function() {
			if (!disabled) {
				disabled = true;
				fn();
				setTimeout(function() {
					fn();
					disabled = false;
				}, ms);
			}
		};
	}

	/**
	 * Shortcut to optimize minification
	 *
	 * @private
	 * @method    len
	 **/
	function len(item) {
		return item.length;
	}

	/**
	 * Mixing objects to a new combined object, **does not clone**
	 *
	 * @private
	 * @method    mix
	 *
	 * @param     {Object}  defaults          default options
	 * @param     {Object}  overrides         Overrides
	 *
	 * @return    {Object}                    a mix of the default and overrides
	 *
	 * @example
	 *   mix({ fun : true },{});
	 *   => { fun : true }
	 *
	 *
	 *   mix({ fun : true },{ fun : false });
	 *   => { fun : false }
	 *
	 *
	 *   mix({ fun : true },{ dead : false });
	 *   => { fun : true, dead : false }
	 */
	function mix(defaults, overrides) {
		var result = {};
		var k;
		for (k in defaults) {
			if (defaults.hasOwnProperty(k)) {
				result[k] = defaults[k];
			}
		}
		for (k in overrides) {
			if (overrides.hasOwnProperty(k)) {
				result[k] = overrides[k];
			}
		}
		return result;
	}

	/**
	 * Parse query string or hash and get the value for the key, prefers search over hash
	 *
	 *
	 * Note : **UNTESTET!**
	 *
	 * @private
	 * @method    getRequestParameter
	 *
	 * @param     {String}   key                key in query or hash
	 *
	 * @return    {String}                     Value for the key (if any)
	 *
	 * @example
	 *   getRequestParameter('foo');
	 */
	function getRequestParameter(key) {
		var qs = location.search + "&" + location.hash;
		if (len(qs) > 1) {
			var start = qs.indexOf(key + "=");
			if (start > -1) {
				var end = (qs.indexOf("&", start) > -1) ? qs.indexOf("&", start) : len(qs);
				return qs.substring(qs.indexOf("=", start) + 1, end);
			}
		}
	}

	function isSupportedBrowser() {
		return   ( ('addEventListener' in window || 'attachEvent' in window)
		           && ('querySelector' in document && 'querySelectorAll' in document)
		           && ('JSON' in window && 'stringify' in JSON && 'parse' in JSON)
		           && ('postMessage' in window)
		);
	}
	AdServ.isSupportedBrowser = isSupportedBrowser;
	// ### AdServ.ready 
	// A basic onload wrapper.  
	//
	// Based on [domready](https://github.com/ded/domready)  
	// (c) Dustin Diaz 2012 - License MIT
	//
	// **params:** 
	//
	//  * **callback** callback to call when doc is ready 

	var ready = AdServ.ready = (function (ready) {
		var fns = [], fn, f = false 
				, testEl = document.documentElement
				, hack = testEl.doScroll
	//			, domContentLoaded = 'DOMContentLoaded'
	//			, addEventListener = 'addEventListener'
	//			, onreadystatechange = 'onreadystatechange'
	//			, readyState = 'readyState'
				, loaded = /^loade|c/.test(document[readyState]);

		function flush(f) {
			loaded = 1;
			while (f = fns.shift()) {
				f()
			}
		}

		document[addEventListener] && document[addEventListener](domContentLoaded, fn = function () {
			document.removeEventListener(domContentLoaded, fn, f)
			flush();
		}, f);
	 
		hack && document.attachEvent(onreadystatechange, fn = function () {
			if (/^c/.test(document[readyState])) {
				document.detachEvent(onreadystatechange, fn);
				flush();
			}
		});

		return (ready = hack ?
		                function (fn) {
			                self != top ?
			                loaded ? fn() : fns.push(fn) :
			                function () {
				                try {
					                testEl.doScroll('left')
				                } catch (e) {
					                return setTimeout(function () { ready(fn) }, 50)
				                }
				                fn()
			                }()
		                } :
		                function (fn) {
			                loaded ? fn() : fns.push(fn)
		                })
	})();
	var $ID = AdServ.$ID = function(target) {
		if (isElement(target)) {
			return target;
		}
		return document.getElementById(target);
	}
	 
	// Shortcut for querySelector  
	var $ = AdServ.$ = function(selector, parent) {
		// Returns elem directly if selector is an element 
		if (isElement(selector)) {
			return selector;
		}

		// Defaults to search from document if parent is not provided
		if (!parent) {parent = document;}

		return parent.querySelector(selector);
	};

	// Shortcut for querySelectorAll
	var $$ = AdServ.$$ = function(selector, parent) {
		// Defaults to search from document if parent is not provided
		if (!parent) {parent = document;}

		return slice.call(parent.querySelectorAll(selector));
	}; 

	// Shim for getComputedStyle used by `AdServ.css`
	var getComputedStyle;
	if (!window.getComputedStyle) {
		getComputedStyle = function getComputedStyleShim(el, pseudo) {
			var style = {};
			style.el = el;
			style.getPropertyValue = function getPropertyValueShim(prop) {
				var re = /(\-([a-z]){1})/g;
				if (prop == 'float') {
					prop = 'styleFloat';
				}
				if (re.test(prop)) {
					prop = prop.replace(re, function() {
						return arguments[2].toUpperCase();
					});
				} 
				return style.el.currentStyle[prop] ? style.el.currentStyle[prop] : null;
			};
			return style;
		};
	} else {
		getComputedStyle = window.getComputedStyle;
	}

	// get css property for an element
	var css = AdServ.css = function(elemOrSelector, name) {
		// Ensure element is an element and not a selector
		var elem = $ID(elemOrSelector);
		if (!elem) {
			return null;
		}
		return getComputedStyle($(elem)).getPropertyValue(name);
	};

	// Test if an element is *visible* (searches up the tree until BODY is reached)
	var isVisible = AdServ.isVisible = function(elemOrSelector) {
		var elem = $ID(elemOrSelector);
		if (!elem) {
			return false;
		}
		// Body must be visible (anything else would be silly)
		if (elem.nodeName === 'BODY') {
			return true;
		}

		// Is it hidden from sight?
		if (css(elem, 'visibility') == 'hidden') {
			return false;
		}

		// Is it displayed?
		if (css(elem, 'display') == 'none') {
			return false;
		}

		// Is it transparent?
		if (css(elem, 'opacity') == '0') {
			return false;
		}

		// Look up the tree
		return isVisible(elem.parentNode);
	};
	 

	var evil = function(s) {
		return (new Function("return (" + s + ")"))();
	};

	/**
	 * a minimal JSON parser .. based on json2 (https://github.com/douglascrockford/JSON-js)
	 *
	 * defaults to built in JSON.parse
	 */
	var parseJSON = typeof JSON === 'object' ? JSON.parse : function(source) {
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
	var eventHandlers = {};

	// ### AdServ.on
	// Register a listener on an event
	//
	// **params:** 
	//
	//  * **event** eventname
	//  * **fn** callback
	//  * **context** *optional* scope to bind to .. defaults to window
	var on = AdServ.on = function(event, fn, context) {
		if (event && fn) {
			eventHandlers[event] = (typeof eventHandlers[event] === 'undefined') ? [] : eventHandlers[event];

			eventHandlers[event].push(function(args) {

				return  fn.apply(context || window, args);
			});
		}
	};

	// ### AdServ.once
	// Register a listener on an event (but only first time) 
	//
	// **params:** 
	//
	//  * **event** eventname
	//  * **fn** callback
	//  * **context** *optional* scope to bind to .. defaults to window
	var once = AdServ.once = function(event, fn, context) {
		on(event, function() {
			fn();
			fn = noop;
		}, context);
	};

	// ## AdServ.emit
	// Emit (trigger) an event
	//
	// **params:** 
	//
	//  * **event** eventname 
	//  * **arguments** *optional* all other arguments are passed on to the callback
	var emit = AdServ.emit = function(event) {
		if (typeof eventHandlers[event] !== 'undefined') {
			var args = slice.call(arguments, 1);
			for (var i = 0; i < len(eventHandlers[event]); i++) {
				eventHandlers[event][i](args);
			}
		}
	};

	var bind = AdServ.bind = function(elem, type, handler) {
		if (elem[addEventListener]) {
			elem[addEventListener](type, handler, false);
		} else {
			// can't use elem[attachEvent]("on" + type, handler);
			elem.attachEvent("on" + type, handler);
		}
	};
	var unbind = AdServ.unbind = function(elem, type, handler) {
		if (elem[addEventListener]) {
			elem.removeEventListener(type, handler, false);
		} else {
			elem.detachEvent(type, handler);
		}
	};

	// ----

	// Save original `onresize`
	var originalResize = window['onresize'] || noop;

	// Register new wrapping `onresize`
	window.onresize = function() {
		try {
			originalResize();
		} catch (e) {}
		emit('resize');
	};

	// Emit load event when dom is loaded
	ready(function() {
		emit('load');
	}); 
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
		cb = cb || noop;
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

		function cancelAbort() {
			clearTimeout(requestTimeout);
		}

		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				/* `onload` reset as it will re-issue the cb */
				xhr.onload = noop;

				cancelAbort();

				cb(xhr.status != 200 ? "err : " + xhr.status : null, xhr.responseText, xhr);
			}
		};
	 
		xhr.onload = function() {
			cancelAbort();
			if (xhr.status) {
				// Will this ever happen? 
				//console.error('onload with status!!!');

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
					//console.log("malformed json", url, e);
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
	// This part is based on **SWFObject v1.4** 
	//
	//  Flash Player detection and embed - http://blog.deconcept.com/swfobject/
	// 
	//  SWFObject is (c) 2006 Geoff Stearns and is released under the MIT License:
	//  http://www.opensource.org/licenses/mit-license.php
	// 
	//  SWFObject is the SWF embed script formarly known as FlashObject. The name was changed for legal reasons.
	var playerVersion;
	// ### getPlayerVersion 
	//
	// **returns:** installed version of  flash
	//
	function getPlayerVersion() {
		if (activeX) {
			try {
				var atx = new activeX('ShockwaveFlash.ShockwaveFlash');
				if (atx) {
					var version = atx.GetVariable('$version').substring(4);
					return parseFloat(version.replace(',', '.'));
				}
			} catch (e) {
			}
		} else {
			var plugin = window.navigator.plugins["Shockwave Flash"];
			if (plugin && plugin.description) {
				return parseFloat(plugin.description.match(/(\d+)\.(\d+)/)[0]);
			}
		}
		return "0";
	}

	playerVersion = getPlayerVersion();

	var isFlashSupported = AdServ.flash = playerVersion >= 6 ? playerVersion : false;

	// ### _Constructor:_ Flash 
	//
	// **creates:** an Object used to embed flash
	//
	var Flash = function(url, id, width, height) {
		this.params = {quality : 'best', allowscriptaccess : 'always', wmode : 'opaque'};
		this.vars = { };
		this.attrs = {
			swf : url,
			id : id,
			w : width,
			h : height
		};
	};

	Flash.prototype = {
		// ### _flash_.addParam
		//
		// add a parameter to the embeded html 
		//
		addParam : function(key, value) {
			this.params[key] = value;
		},

		// ### _flash_.addVariable
		//
		// add a variable to the query string
		//
		addVariable : function(key, value) {
			this.vars[key] = value;
		},

		// ### _flash_.getVars
		//
		// generates a query string from provided values
		//
		// **returns:** query string
		//
		getVars : function() {
			var queryString = [];
			var key;
			for (key in this.vars) {
				queryString.push(key + "=" + this.vars[key]);
			}
			return queryString;
		},

		// ### _flash_.getSWFHTML
		//
		// generates html embed code for all browsers
		//
		// **returns:** html code
		//
		getSWFHTML : function() {
			var html;
			var params = this.params;
			var attrs = this.attrs;
			var vars = this.getVars().join("&"); 
			var common = ' width="' + attrs["w"] + '" height="' + attrs["h"] + '" id="' + attrs["id"] + '" name="' + attrs["id"] + '" ';

			if (activeX) {
				html = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + common
				       + '><param name="movie" value="' + attrs["swf"] + '" />';

				for (key in params) {
					html += '<param name="' + key + '" value="' + params[key] + '" />';
				}

				if (len(vars) > 0) {
					html += '<param name="flashvars" value="' + vars + '" />';
				}
				html += '</object>';
			} else {
				html = '<embed type="application/x-shockwave-flash" src="' + attrs["swf"] + '"' + common;
				for (var key in params) {
					html += key + '="' + params[key] + '" ';
				}
				if (len(vars) > 0) {
					html += ' flashvars="' + vars + '"';
				}
				html += '>';
			}
			return html;
		},

		// ### _flash_.write
		//
		// Writes the embed html into the provided target
		//
		// **params:** 
		//
		//  * **target** id of the element to embed the flash file
		//
		// **returns:** true if flash is supported and the code was embedded
		//
		write : function(target) {
			if (isFlashSupported) {
				var elem = $ID(target);
				if (elem) { 
					elem.innerHTML = this.getSWFHTML(); 
					return true;
				}
			}
			return false;
		}
	};

	// legacy support 
	window.baSWFObject = Flash;
	var engines = {};

	function passbackHandlerMaker(elem, campaign) {
		var uid = guid("handler", campaign.adspace);
		return function(iframe) {
			return function(m) {
				var payload, err;
				try {
					payload = parseJSON(m.data);
				} catch (e) {
					err = e;
				}
				if (!err && payload.adspace == campaign.adspace) {
	//				console.log("payload:", payload);
					console.warn("passback from adspace " + campaign.adspace + " to " + payload.next)
					//			iframe.contentDocument.body.innerHTML = "<b>THIS WAS REJECTED</b>";
					console.log("campaign rejected:", campaign);
	//				console.log("elem:", uid, elem);
					//			console.log("err:", err);
	//				console.log("m:", m);
					//			console.log("payload:", campaign.nesting | 0);
	//				iframe.style.display = "none";
					elem.innerHTML = ""; // would rather just hide iframe .. but deep tunnel make this harder
					campaign.nesting = (campaign.nesting | 0) + 1;
					if (campaign.nesting < 10) {
						//setTimeout(function() {
							AdServ.load({ adspaces : [
								{id : payload.next, target : elem, adServingLoad : campaign.ctx.adServingLoad}
							]})
						//},0)
					} else {
						console.error("too deep")
					}
				}
			}
		};
	};

	function makeA(elem, campaign) {
		var a = document.createElement('a');
		a.id = guid("a", campaign.adspace, campaign.campaign)
		a.setAttribute('href', campaign.click);
		a.setAttribute('target', "_blank");
		a.appendChild(elem);
		return a;
	}

	function makeImg(campaign) {
		var img = document.createElement('img');
		img.id = guid("img", campaign.adspace, campaign.campaign); 
		img.border = 0;
		img.src = campaign.image;
		return img;
	}

	engines["image"] = function renderImage(elem, campaign) {
		var img = makeImg(campaign);
		var a = makeA(img, campaign);
		elem.appendChild(a);
	}

	engines["iframe"] = function renderImage(elem, campaign) {
		var ifrm = document.createElement("iframe");
		ifrm.id = guid('iframe', campaign.adspace, campaign.campaign);
		ifrm.style.width = campaign.width + "px";
		ifrm.style.height = campaign.height + "px";
		ifrm.style.border = 0;
		ifrm.style.borderStyle = "none";
		ifrm.frameBorder = 0;
		ifrm.scrolling = "no";

		AdServ.bind(window, "message", passbackHandlerMaker(elem, campaign)(ifrm))

		ifrm.src = campaign.iframe_src;
		elem.appendChild(ifrm);
	}

	engines["flash"] = function renderFlash(elem, campaign) {
	//	console.debug("qwe");

		var url = campaign.flash + "?" + campaign.click_tag_type + "=" + urlencode(campaign.click);
		console.log(url,campaign);
		var flash = new Flash(url, guid('flash', campaign.adspace, campaign.campaign), campaign.width, campaign.height);
		if (!flash.write(elem)) {
			var img = makeImg(campaign);
			var a = makeA(img, campaign);
			elem.appendChild(a);
		}
	}

	engines["txt"] = function renderImage(elem, campaign) {
		var text = document.createTextNode(campaign.txt);
		var a = makeA(text, campaign);
		elem.appendChild(a);
	}

	engines["wallpaper"] = function renderwallpaper(elem, campaign) {
		function adserving_bgclick(a) {
			if (!a) {
				a = window.event;
			}
			var tg = (window.event) ? a.srcElement : a.target;
			if (tg == elem) {
				window.open(campaign.click);
			}
		}

		elem.style.backgroundImage = 'url(' + campaign.wallpaper + ')';
		elem.style.backgroundRepeat = campaign.wallpaper_repeat || 'no-repeat';
		elem.onclick = adserving_bgclick;

		var classes = document.body.getAttribute('class');
		document.body.setAttribute('class', (classes || '') + ' adserving_wallpaper_loaded');
		emit('wallpaper_loaded', campaign);
	}

	engines["html"] = function renderHtml(elem, campaign) {
		
		var script, original;

		function safeScriptContent(js) { 
			// remove document.write to avoid accidential dom rewrite
	//		return js.replace('document.write(', 'console.log("WARNING : document.write -> "+');
			return js.replace('document.write(', 'console.warn("WARNING : banner: ' + campaign.banner + ' uses document.write");document.write(');
	//		return js.replace('document.write(', 'console.warn("WARNING document.write");document.write(');
	//		console.log(js);
	//		
	//		return "console.log('x')";
		}

		//console.debug("using direct access"); 
		elem.innerHTML = campaign.html;
	//	elem.src = "javascript:" + campaign.html_as_js;
	 
			
		var scripts = elem.getElementsByTagName("script");
	//	console.log(scripts.length);
	//	console.log(elem.innerHTML);

		// just in case the result is an inline iframe
		var iframes = elem.getElementsByTagName("iframe");
		if (iframes.length == 1) {
			AdServ.bind(window, "message", passbackHandlerMaker(elem, campaign)(iframes[0]));
		}

		var original; 
		var length = scripts.length;
		var uid = guid("js", campaign.adspace, campaign.campaign);
		for (var i = 0; i < length; i++) {
	//		alert("script " + i);
			original = scripts[i];
			console.log("original", original);
			if (original.src) {
				console.log("original.src");
				script = document.createElement("script");
				script.id = uid + "_" + i;
				script.src = original.src; 
	//			setTimeout((function(script, elem) {
	//				return function() {
						elem.appendChild(script);
	//				}
	//			})(script, elem), 0);
			}

			if (original.innerText) {
				console.log("original.txt");
				script = document.createElement("script");
				script.id = uid + "_" + i;
	//			console.log(original.innerHTML); 
				script.innerText = safeScriptContent(original.innerText);
	//			setTimeout((function (script,elem) {
	//				return function() {
						elem.appendChild(script);
	//				}
	//			})(script,elem),0);
	////			break;
			} else if (original.innerHTML) {
	//			alert("using script.innerHTML");
				console.log("original.html", original);
	//			eval(safeScriptContent(original.innerHTML));
				setTimeout((function(src) {
					return function() {
						console.log("eval", src); 
						eval(safeScriptContent(src));
					}
				})(original.innerHTML), 1000);
			}
		}
	 
	}

	function createIframe(campaign) {
		var ifrm = document.createElement("iframe");
		ifrm.id = guid('iframe', campaign.adspace, campaign.campaign);
		ifrm.style.width = campaign.width + "px";
		ifrm.style.height = campaign.height + "px";
		ifrm.style.border = 0;
		ifrm.style.borderStyle = "none";
		ifrm.frameBorder = 0;
		ifrm.scrolling = "no";
		return ifrm;
	}
	function wrapIframe(target, campaign) {
		var ifrm = createIframe(campaign);
		target.appendChild(ifrm);
		ifrm.contentDocument.write('<!doctype html><body style="margin:0px;padding:0px;width:100%;height:100%;"></body>');

		AdServ.bind(window, "message", passbackHandlerMaker(target, campaign)(ifrm))

		return ifrm;
	}

	function makeFloat(campaign) {
		console.log(campaign);

		var uid = guid('float');
		console.log("got a floating banner!", uid);
	//	console.log(" floating_close_position : " + campaign.floating_close_position);
	//	console.log(" floating_position : " + campaign.floating_position);
	//	console.log(" floating_time : " + campaign.floating_time);
		var style = 'position:fixed; width:' + campaign.width + 'px; height:' + (campaign.height) + 'px; z-index:2147483646;';

		if (campaign.floating_position == 'centre') {
			style += 'left:50%; top:50%;' +
			         'margin-left:-' + (campaign.width / 2) + 'px;' +
			         'margin-top:-' + ((campaign.height + 16) / 2) + 'px;';
		} else if (campaign.floating_position == 'top_centre') {
			style += 'left:50%; top:0;' +
			         'margin-left:-' + (campaign.width / 2) + 'px;';
		} else if (campaign.floating_position == 'top_left') {
			style += 'left:0; top:0;';
		} else if (campaign.floating_position == 'top_right') {
			style += 'right:0; top:0;';
		} else if (campaign.floating_position == 'bottom_left') {
			style += 'left:0; bottom:0;';
		} else if (campaign.floating_position == 'bottom_right') {
			style += 'right:0; bottom:0;';
		} else if (campaign.floating_position == 'bottom_centre') {
			style += 'left:50%; bottom:0;' +
			         'margin-left:-' + (campaign.width / 2) + 'px;' +
			         'margin-top:-' + (campaign.height / 2) + 'px;' +
			         ';position:fixed !important;';
		} else if (campaign.floating_position.indexOf(".") > 0) {
			var coords = campaign.floating_position.split(".");
			style += 'left:' + coords[0] + '; top:' + coords[1] + ';';
		}
	//	console.error('TODO: REMOVE YELLOW'); 

		var floatingElem = document.createElement('div');
		floatingElem.id = "floating_" + uid;

		floatingElem.close = function() {
			clearTimeout(floatingElem.timeout);
			floatingElem.style.display = 'none';

			floatingElem.close = noop;
		};
		floatingElem.timeout = setTimeout(floatingElem.close, 1000 * campaign.floating_time);

		var contentElem = document.createElement('div');
		contentElem.id = "content_" + uid;
		

		if (campaign.floating_close_position.indexOf('off') != 0) {
			var closeElem = document.createElement('div');
			bind(closeElem, 'click', floatingElem.close);
			closeElem.id = "close_" + uid;
			var closeStyle = 'position:absolute; width:16px; height:16px;z-index:2147483646;border:0px; cursor:pointer;';
			style += "background:#fff;";
			if (campaign.floating_close_position == 'top_left') {
				closeStyle += 'left:0; top:0;';
			} else if (campaign.floating_close_position == 'top_right') {
				closeStyle += 'right:0; top:0;';
			} else if (campaign.floating_close_position == 'bottom_left') {
				closeStyle += 'left:0; bottom:0;';
			} else if (campaign.floating_close_position == 'bottom_right') {
				closeStyle += 'right:0; bottom:0;';
			}
			closeElem.setAttribute('style', closeStyle);
			var closeImg = document.createElement('img');
			closeImg.src = AdServ.baseUrl + '/close.gif';
			closeElem.appendChild(closeImg);
	//		if (campaign.floating_close_position.indexOf('top') > -1) {
			floatingElem.appendChild(closeElem);
		}

		floatingElem.appendChild(contentElem);
		floatingElem.setAttribute('style', style);
		floatingElem.setAttribute('class', "adserving_float adserving_float_" + campaign.adspace);
		document.body.appendChild(floatingElem);
		return campaign.elem = contentElem;
	}
	function render(campaign) {
		var ifrm;
		var targetElem;
		if (campaign.elem) { 
			targetElem = campaign.elem;
			if (campaign.floating) {
				targetElem = makeFloat(campaign);
			}
			if (campaign.iframe && campaign.banner_type !== 'iframe' && campaign.banner_type !== 'wallpaper') {
				if (campaign.banner_type !== 'html') {
					ifrm = wrapIframe(targetElem, campaign);
					targetElem = ifrm.contentDocument.body;
				} else {
					ifrm = createIframe(campaign);
	//				ifrm.src = AdServ.baseUrl+"/api/v2/get/html/" + campaign.banner;
					ifrm.src = AdServ.baseUrl + "/show_campaign.php?nocount=1&adspaceid=" + campaign.adspace + "&campaignid=" + campaign.campaign + "&bannerid=" + campaign.banner
	//				console.log(ifrm.src);
					AdServ.bind(window, "message", passbackHandlerMaker(targetElem, campaign)(ifrm));
					targetElem.appendChild(ifrm);
					return;
				}
			}
			var engine = engines[campaign.banner_type];
			if (engine) {
				engine(targetElem, campaign);
				emit('adspace_loaded', campaign);
			} else {
				console.error('no renderer for banner type yet : ' + campaign.banner_type, campaign);
			}
		} else {
			console.error('no element for banner yet : ' + campaign.banner_type, campaign);
		}
	};
	AdServ.render = render;
	  
	function getContext(adspace, contexts) {
		var ctxName = adspace.context || '_GLOBAL_';
		adspace.context = contexts[ctxName] = contexts[ctxName] || {
			name : ctxName,
			ids : [],
			adspaces : {},
			keyword : adspace.keyword || AdServ.keyword,
			searchword : adspace.searchword || AdServ.searchword,
			adServingLoad : ''
		};
		
		if (adspace.adServingLoad) {
			adspace.context.adServingLoad += adspace.adServingLoad;
		}
		
		if (!AdServ.keyword) {
			AdServ.keyword = adspace.keyword;
		}
	}

	function set(name,def,args) {
		AdServ[name] = (isObject(args[0]) && args[0][name]) || AdServ[name] || def;
	}
	var prepareContexts = function(args) {
		set('baseUrl','',args);
		set('keyword','',args);
		set('searchword','',args);

		var conf = { baseUrl : AdServ.baseUrl, xhrTimeout : 5000, guid : guid("ad") };

		for (var index = 0; index < len(args); index++) {
			var arg = args[index];
			if (isFunction(arg)) {
				conf.ondone = arg;
			} else if (isObject(arg)) {
				conf = mix(conf, arg);
			} else if (isArray(arg)) {
				conf['adspaces'] = arg;
			}
		}

		if (!isArray(conf['adspaces'])) {
			var global = window['ba_adspaces'];
			if (!global || len(global) === 0 || global.added) {
				conf['adspaces'] = []
	//			console.warn('adspaces empty');
			} else {
				global.added = true;
				conf['adspaces'] = global;
			}
		}

		if (!conf['wallpaper']) {
			var global = window['ba_wallpaper'];
			if (!global || len(global) === 0 || global.added) {
	//			console.warn('no wallpaper');
			} else {
				global.added = true;
				conf['wallpaper'] = global;
			}
		}
		if (!conf['floating']) {
			var global = window['ba_floating'];
			if (!global || len(global) === 0 || global.added) {
	//			console.warn('no wallpaper');
			} else {
				global.added = true;
				conf['floating'] = [global];
			}
		}

		var contexts = conf.contexts = {};
		var adspaces = conf.adspaces;
		for (index = 0; index < len(adspaces); index++) {
			var adspace = adspaces[index];
			if (adspace.id > 0) {
				getContext(adspace, contexts);
				adspace.context.ids.push(adspace.id);
				adspace.context.adspaces[adspace.id] = adspace;
			} else {
				// console.error('no id', adspace);
			}
		}
		if (conf['floating']) {
			adspaces = conf['floating'];
			for (index = 0; index < len(adspaces); index++) {
				var adspace = adspaces[index];
				if (adspace.id > 0) {
					getContext(adspace, contexts);
					adspace.context.floating = adspace;
					adspace.context.adspaces[adspace.id] = adspace;
				} else {
					// console.error('no id', adspace);
				}
			}
		}
		if (conf['wallpaper']) {
			var adspace = conf['wallpaper'];
			if (adspace.id > 0) {
				getContext(adspace, contexts);
				adspace.context.wallpaper = adspace;
				adspace.context.adspaces[adspace.id] = adspace;
			} else {
				// console.error('no id', adspace);
			}
		}

		if (conf['adspaces'].length == 0 && !conf['wallpaper'] && !conf['floating']) {
			console.error('no adspaces or wallpaper provided');
		} else {

	//		if (conf['wallpaper']) {
	//			console.log('wallpaper', conf['wallpaper']);
	//		}
	//		if (conf['floating']) {
	//			if (conf['floating'].length == 1) {
	//				console.log('floating', conf['floating'][0]);
	//			} else {
	//				console.log('floating', conf['floating']);
	//			}
	//		}
	//		console.log('adspaces', conf['adspaces']);

		}

		return conf;
	};

	var showCampaign = function(campaign) {
		render(campaign);
	};

	var checkVisibility = throttle(function() {
		var notReady = [];
		for (var index = 0; index < len(invisibleAdspaces); index++) {
			var campaign = invisibleAdspaces[index];
			if (isVisible(campaign.elem)) {
				if (recheck) {
					clearInterval(recheck);
				}
				showCampaign(campaign);
			} else {
				notReady.push(campaign);
			}
		}
		invisibleAdspaces = notReady;
	}, 200);

	AdServ.on('resize', function() {
		if (recheck) {
			clearInterval(recheck);
		}
		checkVisibility();
	});

	var recheck = 0;
	var invisibleAdspaces = [];
	AdServ.loadAdspaces = AdServ.load = function load() {
		var conf = prepareContexts(arguments);
		var anyWaiting = 0;
		// count contexts
		for (var x in conf.contexts) {
			anyWaiting++;
		}

		for (var ctxName in conf.contexts) {
			//noinspection JSUnfilteredForInLoop
			var ctx = conf.contexts[ctxName];
			var url = conf.baseUrl + '/api/v2/get/campaigns.json?'
			          + (ctx.wallpaper ? '&wallpaper=' + ctx.wallpaper.id : '')
			          + (ctx.floating ? '&floating=' + ctx.floating.id : '')
			          + '&adspaces=' + ctx.ids.join(',')
			          + '&adServingLoad=' + urlencode(ctx.adServingLoad)
			          + '&keyword=' + urlencode(ctx.keyword)
			          + '&sw=' + urlencode(ctx.searchword)
			          + '&uid=' + conf.guid + '&count';
			getJSON(url, (function(ctx) {

				ctx.conf = conf;
				return function(err, data) {
					if (err) {
						// console.error(err);
					} else {
						var campaigns = data.campaigns;
						ctx.adServingLoad = data.meta.adServingLoad;
						for (var index = 0; index < len(campaigns); index++) {
							var campaign = campaigns[index];

							campaign.ctx = ctx;
							campaign.target = ctx.adspaces[campaign.adspace].target || ctx.adspaces[campaign.adspace].wallpaperTarget || document.body;
							campaign.type = (campaign.wallpaper ? "wallpaper:" : "") + (campaign.floating ? "floating:" : "") + campaign.banner_type;
							campaign.elem = $ID(campaign.target);
							if (campaign.elem) {
								console.log(campaign.elem);

								if ($ID(ctx.adspaces[campaign.adspace].target)) {
									campaign.elem.innerHTML = '<!-- Adspace ' + campaign.adspace + ' here -->';
								}
								
								console.log("adspace:" + campaign.adspace);
								
								if (campaign.campaign && campaign.banner && campaign.adspace) {
									console.log("group:" + campaign.group);
	//								console.log("campaign:" + campaign.campaign);
	//								console.log("banner:" + campaign.banner);
	//								console.log("keyword:" + campaign.ctx.keyword);
									campaign.target !== document.body && console.log(campaign.banner_type, campaign.elem);
									invisibleAdspaces.push(campaign);
								} else {
									console.warn("Adspace was empty: " + campaign.adspace, campaign);
								}

							} else {
								console.error("target for adspace not found : " + campaign.target, campaign);
							}
						}
					}
					--anyWaiting;
					if (!anyWaiting) {
						ready(function() {
							checkVisibility();
						});
					}
				};
			})(ctx));
		}

		return conf;
	};

	console.debug("AdServ.released : " + AdServ.released);

		return AdServ; 
	});