"use strict";
/*!
 * ## AdServing js library:
 * Version  : 2.2.1  
 * Released : 2014-10-23 13:16:46 
 * @author Brian Demant <brian.demantgmail.com> (2013)
 */
(function (window, definition) { 
	window.AdServ = definition(window, window.document); 
})(window,  function (window, document) { 
	var AdServ = window.AdServ || {};
	AdServ.version = '2.2.1';
	AdServ.released = '2014-10-23 13:16:46';
	window.AdServ = AdServ; 
	DEBUG = true;
	var
		domContentLoaded = 'DOMContentLoaded',
		addEventListener = 'addEventListener',
		onreadystatechange = 'onreadystatechange',
		readyState = 'readyState'
		; 
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
	console.info = console.info || safe_log("info");
	window.adServingLoad = window.adServingLoad || '';
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
	var toString = Object.prototype.toString;
	var slice = Array.prototype.slice;
	var urlencode = encodeURIComponent;
	var activeX = window.ActiveXObject;

		function noop() {}

	function randhex(length) {
		return ((1 + Math.random()) * 0x100000000).toString(16).substr(1, length);
	}

	function count() {
		return guid.count.toString(16).substr(1, 4);
	}

		function guid() {

		guid.count++;
		if (!guid.date) {
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

		function isFunction(item) {
		return item && typeof item === "function";
	}

		function isObject(item) {
		return item && typeof item === "object" && toString.call(item) === "[object Object]";
	}

		function isArray(item) {
		return item && typeof item === "object" && toString.call(item) === "[object Array]";
	}

		function isString(item) {
		return item && typeof item === "string";
	}

		function isUndefined(item) {
		return item && typeof item === "undefined";
	}

		function isElement(item) {
		return item ? item.nodeType === 1 : false;
	}

		function isNode(item) {
		return item ? item.nodeType === 9 : false;
	}

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

		function len(item) {
		return item.length;
	}

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

	var ready = AdServ.ready = (function (ready) {
		var fns = [], fn, f = false 
				, testEl = document.documentElement
				, hack = testEl.doScroll
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
	var $ = AdServ.$ = function(selector, parent) {
		if (isElement(selector)) {
			return selector;
		}
		if (!parent) {parent = document;}

		return parent.querySelector(selector);
	};
	var $$ = AdServ.$$ = function(selector, parent) {
		if (!parent) {parent = document;}

		return slice.call(parent.querySelectorAll(selector));
	}; 
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
	var css = AdServ.css = function(elemOrSelector, name) {
		var elem = $ID(elemOrSelector);
		if (!elem) {
			return null;
		}
		return getComputedStyle($(elem)).getPropertyValue(name);
	};
	var isVisible = AdServ.isVisible = function(elemOrSelector) {
		var elem = $ID(elemOrSelector);
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
	var evil = function(s) {
		return (new Function("return (" + s + ")"))();
	};

		var parseJSON = typeof JSON === 'object' ? JSON.parse : function(source) {
		source += "";
		if (source != '') {
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
	var on = AdServ.on = function(event, fn, context) {
		if (event && fn) {
			eventHandlers[event] = (typeof eventHandlers[event] === 'undefined') ? [] : eventHandlers[event];

			eventHandlers[event].push(function(args) {

				return  fn.apply(context || window, args);
			});
		}
	};
	var once = AdServ.once = function(event, fn, context) {
		on(event, function() {
			fn();
			fn = noop;
		}, context);
	};
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
	var originalResize = window['onresize'] || noop;
	window.onresize = function() {
		try {
			originalResize();
		} catch (e) {}
		emit('page:resize');
	};

	ready(function() {
		emit('page:loaded');
	}); 
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
	function getJSON(url, cb) {
		return get(url, function(err, value, xhr) {
			var json = value;
			if (!err) {
				try {
					json = parseJSON(value);
				} catch (e) {
					return cb("malformed json : " + e.message);
				}
			}
			cb(err, json, xhr);
		})
	};
	AdServ.getJSON = getJSON;

		function loadScript(url, onload) {
		onload = onload || noop;
		var script = document.createElement("script");
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
	var playerVersion;
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
				queryString.push(key + "=" + this.vars[key]);
			}
			return queryString;
		},
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
					console.warn("passback from adspace " + campaign.adspace + " to " + payload.next)
					console.warn("campaign rejected:", campaign);
					elem.innerHTML = ""; // would rather just hide iframe .. but deep tunnel make this harder
					campaign.nesting = (campaign.nesting | 0) + 1;
					if (campaign.nesting < 10) {
							AdServ.load({ adspaces : [
								{id : payload.next, target : elem, adServingLoad : campaign.ctx.adServingLoad}
							]})
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
		var url = campaign.flash + "?" + campaign.click_tag_type + "=" + urlencode(campaign.click); 
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
		emit('wallpaper:loaded', campaign);
	}

	engines["html"] = function renderHtml(elem, campaign) {
		
		var script, original;

		function safeScriptContent(js) { 
			return js.replace('document.write(', 'console.warn("WARNING : banner: ' + campaign.banner + ' uses document.write");document.write(');
		}
		elem.innerHTML = campaign.html;
	 
			
		var scripts = elem.getElementsByTagName("script");
		var iframes = elem.getElementsByTagName("iframe");
		if (iframes.length == 1) {
			AdServ.bind(window, "message", passbackHandlerMaker(elem, campaign)(iframes[0]));
		}

		var original; 
		var length = scripts.length;
		var uid = guid("js", campaign.adspace, campaign.campaign);
		for (var i = 0; i < length; i++) {
			original = scripts[i];
			console.log("original", original);
			if (original.src) {
				console.log("original.src");
				script = document.createElement("script");
				script.id = uid + "_" + i;
				script.src = original.src; 
						elem.appendChild(script);
			}

			if (original.innerText) {
				console.log("original.txt");
				script = document.createElement("script");
				script.id = uid + "_" + i;
				script.innerText = safeScriptContent(original.innerText);
						elem.appendChild(script);
			} else if (original.innerHTML) {
				console.log("original.html", original);
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
		console.info("got a floating banner!", uid);
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

		var floatingElem = document.createElement('div');
		floatingElem.id = "floating_" + uid;

		floatingElem.close = function() {
			clearTimeout(floatingElem.timeout);
			floatingElem.style.display = 'none';

			AdServ.emit("floating:close", campaign);
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
			floatingElem.appendChild(closeElem);
		}

		floatingElem.appendChild(contentElem);
		floatingElem.setAttribute('style', style);
		floatingElem.setAttribute('class', "adserving_float adserving_float_" + campaign.adspace);
		campaign.elem.appendChild(floatingElem);
		AdServ.emit("floating:open", campaign);
		return contentElem;
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
					ifrm.src = AdServ.baseUrl + "/show_campaign.php?nocount=1&adspaceid=" + campaign.adspace + "&campaignid=" + campaign.campaign + "&bannerid=" + campaign.banner
					AdServ.bind(window, "message", passbackHandlerMaker(targetElem, campaign)(ifrm));
					targetElem.appendChild(ifrm);
					return;
				}
			}
			var engine = engines[campaign.banner_type];
			if (engine) {
				engine(targetElem, campaign); 
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

	function set(name, def, args) {
		AdServ[name] = (isObject(args[0]) && args[0][name]) || AdServ[name] || def;
	}
	var prepareContexts = function(args) {
		set('baseUrl', '', args);
		set('keyword', '', args);
		set('searchword', '', args);

		var conf = {baseUrl : AdServ.baseUrl, xhrTimeout : 5000, guid : guid("ad")};

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
			} else {
				global.added = true;
				conf['adspaces'] = global;
			}
		}

		if (!conf['wallpaper']) {
			var global = window['ba_wallpaper'];
			if (!global || len(global) === 0 || global.added) {
			} else {
				global.added = true;
				conf['wallpaper'] = global;
			}
		}
		if (!conf['floating']) {
			var global = window['ba_floating'];
			if (!global || len(global) === 0 || global.added) {
			} else {
				global.added = true;
				conf['floating'] = global;
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
			}
		}
		if (conf['floating']) {
			var adspace = conf['floating'];
			if (adspace.id > 0) {
				getContext(adspace, contexts);
				adspace.context.floating = adspace;
				adspace.context.adspaces[adspace.id] = adspace;
			} else {
			}
		}
		if (conf['wallpaper']) {
			var adspace = conf['wallpaper'];
			if (adspace.id > 0) {
				getContext(adspace, contexts);
				adspace.context.wallpaper = adspace;
				adspace.context.adspaces[adspace.id] = adspace;
			} else {
			}
		}

		if (conf['adspaces'].length == 0 && !conf['wallpaper'] && !conf['floating']) {
			console.error('no adspaces or wallpaper provided');
		} else {

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

	AdServ.on('page:resize', function() {
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
		for (var x in conf.contexts) {
			anyWaiting++;
		}

		for (var ctxName in conf.contexts) {
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
						console.error(err);
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
								if ($ID(ctx.adspaces[campaign.adspace].target)) {
									if (campaign.campaign && campaign.banner && campaign.adspace) {
										campaign.elem.innerHTML = '<!-- Adspace: ' + campaign.adspace
										                          + ' Group:  ' + campaign.group
										                          + ' Campaign:  ' + campaign.campaign
										                          + ' Banner:  ' + campaign.banner
										                          + ' here -->';
									} else {
										campaign.elem.innerHTML = '<!-- Adspace ' + campaign.adspace + ' (empty) here -->';
									}
								}

								console.info("Adspace: " + campaign.adspace, campaign.elem);
								emit('adspace:loaded', campaign);
								if (campaign.campaign && campaign.banner && campaign.adspace) {
									console.log("group:" + campaign.group);
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