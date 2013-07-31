"use strict";
// ## AdServ responsive js library:
// Version  : **0.1.2**  
// Released : **2013-07-31 12:13:36**
/*! AdServ 0.1.2 / 2013-07-31 12:13:36
 * @author Brian Demant <brian.demantgmail.com> (2013)
 */

// Module pattern for scope and more effective minification
(function (window, definition) { 
	window.AdServ = definition(window, window.document); 
})(window,  function (window, document) { 
	var AdServ = window.AdServ || {};
	AdServ.version = '0.1.2';
	AdServ.released = '2013-07-31 12:13:36';
	window.AdServ = AdServ; 
	

	// ## src/legacy.js
	/* ------------------------------------------------------------ */

	// Protect against missing console.log
	var console = window.console;

	if (!console) {
		console = {};
		console.log = console.error = function() {};
	} 

	// Protect against missing globals
	window.adServingLoad = window.adServingLoad || '';



	// ## src/utils.js
	/* ------------------------------------------------------------ */

	// Shortcuts to maximize minification 
	var toString = Object.prototype.toString;
	var slice = Array.prototype.slice;
	var urlencode = encodeURIComponent;  
	var activeX = window.ActiveXObject;
	 
	var noop = function() {};

	// Detectors
	var isFunction = function(fn) {
		return fn && typeof fn === "function";
	};

	var isObject = function(obj) {
		return obj && typeof obj === "object" && toString.call(obj) === "[object Object]";
	};

	var isArray = function(obj) {
		return obj && typeof obj === "object" && toString.call(obj) === "[object Array]";
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

	// Create a `GUID`
	var guid = AdServ.guid = function() {
		var guidPart = function() {
			return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
		};
		return  'ad_' + guidPart() + "_" + guidPart() + "_" + guidPart() + "_" + guidPart();
	};

	// Parse query string and get the value for the key  
	// **UNTESTET!**
	var getRequestParameter = function(key) {
		var qs = location.search || location.hash;
		if (len(qs) > 1) {
			var start = qs.indexOf(key + "=");
			if (start > -1) {
				var end = (qs.indexOf("&", start) > -1) ? qs.indexOf("&", start) : len(qs);
				return qs.substring(qs.indexOf("=", start) + 1, end);
			}
		}
		return "";
	};

	// Shortcut to optimiz minification
	var len = function(item) {
		return item.length;
	};

	// For mixing default options with provided
	var mix = function(defaults, source) {
		var result = {};
		var k;
		for (k in defaults) {
			if (defaults.hasOwnProperty(k)) {
				result[k] = defaults[k];
			}
		}
		for (k in source) {
			if (source.hasOwnProperty(k)) {
				result[k] = source[k];
			}
		}
		return result;
	};

	



	// ## src/ready.js
	/* ------------------------------------------------------------ */

	// A basic onload wrapper
	// based on [domready](https://github.com/ded/domready)  
	// (c) Dustin Diaz 2012 - License MIT
	var ready = AdServ.ready = (function (ready) {
		var fns = [], fn, f = false 
				, testEl = document.documentElement
				, hack = testEl.doScroll
				, domContentLoaded = 'DOMContentLoaded'
				, addEventListener = 'addEventListener'
				, onreadystatechange = 'onreadystatechange'
				, readyState = 'readyState'
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



	// ## src/ajax.js
	/* ------------------------------------------------------------ */

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
	



	// ## src/dom.js
	/* ------------------------------------------------------------ */

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

	// get css property for an element
	var css = AdServ.css = function(elemOrSelector, name) {
		// Ensure element is an element and not a selector
		var elem = $(elemOrSelector);
		return getComputedStyle($(elem)).getPropertyValue(name);
	};

	// Test if an element is *visible* (searches up the tree until BODY is reached)
	var isVisible = AdServ.isVisible = function(elemOrSelector) {
		var elem = $(elemOrSelector);
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
	 
	



	// ## src/event.js
	/* ------------------------------------------------------------ */

	var eventHandlers = {};

	// Register a listener on an event
	//
	// **params:** 
	//
	//  * **event** eventname
	//  * **fn** callback
	//  * **context** *optional* scope to bind to .. defaults to window
	var on = AdServ.on = function(event, fn, context) {
		// Initialze if first listener for this event
		eventHandlers[event] = (typeof eventHandlers[event] === 'undefined') ? [] : eventHandlers[event];

		eventHandlers[event].push(function(args) {
			return fn.apply(context || window, args);
		});
	};

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



	// ## src/flash.js
	/* ------------------------------------------------------------ */

	/**
	 * SWFObject v1.4: Flash Player detection and embed - http://blog.deconcept.com/swfobject/
	 *
	 * SWFObject is (c) 2006 Geoff Stearns and is released under the MIT License:
	 * http://www.opensource.org/licenses/mit-license.php
	 *
	 * **SWFObject is the SWF embed script formarly known as FlashObject. The name was changed for
	 *   legal reasons.
	 */
	var playerVersion = "0";

	if (activeX) {
		try {
			var atx = new activeX('ShockwaveFlash.ShockwaveFlash');
			if (atx) {
				var version = atx.GetVariable('$version').substring(4);
				playerVersion = (version.replace(',', '.'));
			}
		} catch (e) {
		}
	} else {
		var plugin = window.navigator.plugins["Shockwave Flash"];
		if (plugin && plugin.description) {
			playerVersion = (plugin.description.match(/(\d+)\.(\d+)/)[0]);
		}
	}

	playerVersion = parseFloat(playerVersion);

	var isFlashSupported = AdServ.flash = playerVersion >= 6 ? playerVersion : false;

	var Flash = function(url, id, width, height) {
		this.params = {quality : 'best'};
		this.vars = {quality : 'best'};
		this.attrs = {
			swf : url,
			id : guid(),
			w : width,
			h : height
		};
	};

	Flash.prototype = {
		addParam : function(key, value) {
			this.params[key] = value;
		},
		addVariable : function(key, value) {
			this.vars[key] = value;
		},
		getVars : function() {
			var queryString = [];
			var key;
			for (key in this.vars) {
				//noinspection JSUnfilteredForInLoop
				queryString.push(key + "=" + this.vars[key]);
			}
			return queryString;
		},
		getSWFHTML : function() {
			var html;
			var params = this.params;
			var attrs = this.attrs;
			var vars = this.getVars().join("&");
			var common = ' width="' + attrs["w"] + '" height="' + attrs["h"] + '" id="' + attrs["id"] + '" name="flashfile"';

			if (activeX) {
				html = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + common
					       + '><param name="movie" value="' + attrs["swf"] + '" />';

				for (key in params) {
					//noinspection JSUnfilteredForInLoop
					html += '<param name="' + key + '" value="' + params[key] + '" />';
				}

				if (len(vars) > 0) {
					html += '<param name="flashvars" value="' + vars + '" />';
				}
				html += '</object>';
			} else {
				html = '<embed type="application/x-shockwave-flash" src="' + attrs["swf"] + '"' + common;
				for (var key in params) {
					//noinspection JSUnfilteredForInLoop
					html += key + '="' + params[key] + '" ';
				}

				html += 'flashvars="' + vars + '"/>';
			}
			return html;
		},
		write : function(target) {
			if (isFlashSupported) {
				var elem = $("#" + target);
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



	// ## src/json.js
	/* ------------------------------------------------------------ */

	// Shortcut to `JSON.parse`  
	//  
	// IE7 was the last not to have JSON.parse so we can remove the backup (look in git if you need it)
	var parseJSON = AdServ.parseJSON = JSON.parse;
	 



	// ## src/api.js
	/* ------------------------------------------------------------ */

	var prepareContexts = function(args) {
		AdServ.baseUrl = AdServ.baseUrl || '';
		var conf = { baseUrl : AdServ.baseUrl, xhrTimeout : 5000 };
		for (var index = 0; index < len(args); index++) {
			var arg = args[index];
			if (isFunction(arg)) {
				conf.ondone = arg;
			} else if (isObject(arg)) {
				conf = mix(conf, arg);
			} else if (isArray(arg)) {
				conf['adspaces'] = arg;
			} else if (isString(arg)) {
				conf['baseUrl'] = arg;
			}
		}
		if (!isArray(conf['adspaces'])) {
			var global = window['ba_adspaces'];
			if (!global || len(global) === 0 || global.loaded) {
				console.error('adspaces empty');
				return false;
			} else {
				global.loaded = true;
				conf['adspaces'] = global;
			}
		}

		var contexts = conf.contexts = {};
		var adspaces = conf.adspaces;
		for (index = 0; index < len(adspaces); index++) {
			var adspace = adspaces[index];
			if (adspace.id > 0) {
				var ctxName = adspace.context || '_GLOBAL_';
				adspace.context = contexts[ctxName] = contexts[ctxName] || {
					name : ctxName,
					ids : [],
					adspaces : {},
					keyword : adspace.keyword || '',
					searchword : adspace.searchword || '',
					adServingLoad : ''
				};
				contexts[ctxName].ids.push(adspace.id);
				contexts[ctxName].adspaces[adspace.id] = adspace;
			} else {
				console.error('no id', adspace);
			}
		}

		return conf;
	};

	var throttle = function(fn, ms) {
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
	};

	var showCampaign = function(campaign) {
		var ctx = campaign.ctx;
		var conf = ctx.conf;
		var url;
		console.log("loading adspace " + campaign.adspace + " into " + campaign.target);
		if (campaign.campaign && campaign.banner && campaign.adspace) {
			var adspace = ctx.adspaces[campaign.adspace];
			var id = 'script_' + adspace.target + "_" + adspace.id; // adspace id is just for easier debug
			var script = document.getElementById(id);
			if (!script) {
				script = document.createElement('script');
				script.id = id;
				script.type = 'text/javascript';
				script.async = false;
				script.onload = script.onreadystatechange = (function(cmp, ctx2) {
					return function() {
						// called several times
					};
				})(campaign, ctx);
				script.src = conf.baseUrl + '/api/v1/get/js_banner'
					             + '?adspaceid=' + urlencode(adspace.id)
					             + '&campaignid=' + urlencode(campaign.campaign)
					             + '&bannerid=' + urlencode(campaign.banner)
					             + '&keywords=' + urlencode(ctx.keyword)
					             + '&appendTo=' + urlencode(adspace.target);

				var elem = document.getElementById(adspace.target);
				elem.innerHTML = "";
				elem.parentNode.insertBefore(script, elem);
	//
	//			url = conf.baseUrl + '/api/v2/count/view?adspaceid=' + campaign.adspace
	//				      + '&campaignid=' + urlencode(campaign.campaign)
	//				      + '&bannerid=' + urlencode(campaign.banner)
	//				      + '&keyword=' + urlencode(ctx.keyword)
	//				      + '&searchword=' + urlencode(ctx.searchword);
	//			get(url, function(err, data) {
	//				console.log(data);
	//			})
			} else {
				console.error("already loaded " + id);
				// emit_campaign.waiting--;
			}
		} else {
			url = conf.baseUrl + '/api/v2/count/load?adspaceid=' + campaign.adspace
				      + '&keyword=' + urlencode(ctx.keyword)
				      + '&searchword=' + urlencode(ctx.searchword);
			get(url, function(err, data) {
				console.log(data);
			})
		}
	};

	var checkVisibility = throttle(function() {
		var notReady = [];
		for (var index = 0; index < len(invisibleAdspaces); index++) {
			var campaign = invisibleAdspaces[index];
			if (isVisible('#' + campaign.target)) {
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

	var loadAdspaces = AdServ.loadAdspaces = function() { 
		var conf = prepareContexts(arguments); 
		
		var anyWaiting = 0;
		// count contexts
		for (var x in conf.contexts) {
			anyWaiting++;
		}

		for (var ctxName in conf.contexts) {
			//noinspection JSUnfilteredForInLoop
			var ctx = conf.contexts[ctxName];
			var url = conf.baseUrl + '/api/v2/get/campaigns.json?adspaces=' + ctx.ids.join(',')
				          + '&adServingLoad=' + urlencode(ctx.adServingLoad)
				          + '&keyword=' + urlencode(ctx.keyword)
				          + '&searchword=' + urlencode(ctx.searchword);
			getJSON(url, (function(ctx) {

				ctx.conf = conf;
				return function(err, data) {
					if (err) {
						console.error(err);
					} else {
						var campaigns = data.campaigns;
						for (var index = 0; index < len(campaigns); index++) {
							var campaign = campaigns[index];
							campaign.ctx = ctx;
							campaign.target = ctx.adspaces[campaign.adspace].target;
							invisibleAdspaces.push(campaign);
						}
					}
					--anyWaiting;
					if (!anyWaiting) {
						ready(function() {
	////					console.timeEnd("ready");
	//						console.log("ready");
							checkVisibility();
	//						recheck = setInterval(function() {
	////							console.log("recheck");
	//							checkVisibility();
	//							if (len(invisibleAdspaces) == 0) {
	//								console.log('No more adspaces to load');
	//								clearInterval(recheck);
	//							}
	//						}, 1000);
						});
					}
				};
			})(ctx));
		}

		return conf;
	};

	// footer ----------------------------------------------------------------------
	return AdServ; 
});