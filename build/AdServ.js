"use strict";
/*!
 * AdServ 0.0.8 / 2013-06-04 15:21:45
 * @author Brian Demant <brian.demantgmail.com> (2013)
 */
(function (window, definition) { 
	window.AdServ = definition(window, window.document); 
})(window,  function (window, document) { 
	var AdServ = window.AdServ || {};
	AdServ.version = '0.0.8';
	AdServ.released = '2013-06-04 15:21:45';
	window.AdServ = AdServ; 
	// header ----------------------------------------------------------------------

	// Source: src/legacy.js
	// -----------------------------------------------------------------------------
	var toString = Object.prototype.toString

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

	var noop = function() {};

	var slice = Array.prototype.slice;

	var guid = AdServ.guid = function() {
		var guidPart = function() {
			return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
		};
		return  'ad_' + guidPart() + "_" + guidPart() + "_" + guidPart() + "_" + guidPart();
	};

	var urlencode = encodeURIComponent;

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

	var console = window.console;

	if (!console) {
		AdServ.history = [];
		console = {};
		console.log = function() {
			var msg = slice.call(arguments);
			if (msg.length == 1) {
				msg = msg[0];
			}
			AdServ.history.push(msg);
		};

		console.error = function() {
			console.log.apply(null, arguments);
		};
	}

	window.adServingLoad = window.adServingLoad || '';



	// Source: src/ajax.js
	// -----------------------------------------------------------------------------
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
	



	// Source: src/dom.js
	// -----------------------------------------------------------------------------
	var $ = AdServ.$ = function(selector, el) {
		if (isElement(selector)) {
			return selector;
		}
		if (!el) {el = document;}
		return el.querySelector(selector);
	};

	var $$ = AdServ.$$ = function(selector, el) {
		if (!el) {el = document;}
		return slice.call(el.querySelectorAll(selector));
	};

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

	var css = AdServ.css = function(elem, name) {
		elem = $(elem);
		return getComputedStyle($(elem)).getPropertyValue(name);
	};

	var isVisible = AdServ.isVisible = function(elem) {
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
	 
	



	// Source: src/event.js
	// -----------------------------------------------------------------------------
	var eventHandlers = {};

	/**
	 *
	 * @param event eventname
	 * @param fn callback
	 * @param context scope to bind to .. defaults to window
	 */
	var on = AdServ.on = function(event, fn, context) {
		// initialze if first
		eventHandlers[event] = (typeof eventHandlers[event] === 'undefined') ? [] : eventHandlers[event];

		eventHandlers[event].push(function(args) {
			return fn.apply(context || window, args);
		});
	};

	var once = AdServ.once = function(event, fn, context) {
		on(event, function() {
			fn();
			fn = noop;
		}, context);
	};

	/**
	 * @param event name of event
	 */
	var emit = AdServ.emit = function(event) {
		if (typeof eventHandlers[event] !== 'undefined') {
			var args = slice.call(arguments, 1);
			for (var i = 0; i < eventHandlers[event].length; i++) {
				eventHandlers[event][i](args);
			}
		}
	};

	// 
	var originalResize = window['onresize'] || noop;
	window.onresize = function() {
		try {
			originalResize();
		} catch (e) {}
		//console.log('Adserv.emit : resize'); 
		emit('resize');
	};

	var loaded = false;

	var originalLoad = window.onload || noop;

	window.onload = function() {
		loaded = true;
		try {
			originalLoad();
		} catch (e) {}

		//console.log('Adserv.emit : resize'); 
		emit('load');
	};

	var ready = function(fn) {
		if (loaded) {
			fn()
		} else {
			once('load', fn);
		}
	};

	AdServ.ready = ready;



	// Source: src/flash.js
	// -----------------------------------------------------------------------------
	/**
	 * SWFObject v1.4: Flash Player detection and embed - http://blog.deconcept.com/swfobject/
	 *
	 * SWFObject is (c) 2006 Geoff Stearns and is released under the MIT License:
	 * http://www.opensource.org/licenses/mit-license.php
	 *
	 * **SWFObject is the SWF embed script formarly known as FlashObject. The name was changed for
	 *   legal reasons.
	 */
	var deconcept = {
		util : {},
		SWFObjectUtil : {},

		baSWFObject : function(_1, id, w, h, _5, c, _7, _8, _9, _a, _b) { 
			this.DETECT_KEY = _b ? _b : "detectflash";
			this.skipDetect = deconcept.util.getRequestParameter(this.DETECT_KEY);
			this.params = {};
			this.variables = {};
			this.attributes = [];
			if (_1) {
				this.setAttribute("swf", _1);
			}
			if (id) {
				this.setAttribute("id", id);
			}
			if (w) {
				this.setAttribute("width", w);
			}
			if (h) {
				this.setAttribute("height", h);
			}
			if (_5) {
				this.setAttribute("version", new deconcept.PlayerVersion(_5.toString().split(".")));
			}
			this.installedVer = deconcept.SWFObjectUtil.getPlayerVersion(this.getAttribute("version"), _7);
			if (c) {
				this.addParam("bgcolor", c);
			}
			var q = _8 ? _8 : "high";
			this.addParam("quality", q);
			this.setAttribute("useExpressInstall", _7);
			this.setAttribute("doExpressInstall", false);
			var _d = (_9) ? _9 : window.location;
			this.setAttribute("xiRedirectUrl", _d);
			this.setAttribute("redirectUrl", "");
			if (_a) {
				this.setAttribute("redirectUrl", _a);
			}
		}
	};

	deconcept.baSWFObject.prototype = {
		setAttribute : function(_e, _f) {
			this.attributes[_e] = _f;
		},
		getAttribute : function(_10) {
			return this.attributes[_10];
		},
		addParam : function(_11, _12) {
			this.params[_11] = _12;
		},
		getParams : function() {
			return this.params;
		},
		addVariable : function(_13, _14) {
			this.variables[_13] = _14;
		},
		getVariable : function(_15) {
			return this.variables[_15];
		},
		getVariables : function() {
			return this.variables;
		},
		getVariablePairs : function() {
			var _16 = [];
			var key;
			var _18 = this.getVariables();
			for (key in _18) {
				//noinspection JSUnfilteredForInLoop
				_16.push(key + "=" + _18[key]);
			}
			return _16;
		},
		getSWFHTML : function() {
			var _19 = "";
			if (navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length) {
				if (this.getAttribute("doExpressInstall")) {
					this.addVariable("MMplayerType", "PlugIn");
				}
				_19 = "<embed type=\"application/x-shockwave-flash\" src=\"" + this.getAttribute("swf") + "\" width=\"" + this.getAttribute("width") + "\" height=\"" + this.getAttribute("height") + "\"";
				_19 += " id=\"" + this.getAttribute("id") + "\" name=\"" + this.getAttribute("id") + "\" ";
				var _1a = this.getParams();
				for (var key in _1a) {
					//noinspection JSUnfilteredForInLoop
					_19 += [key] + "=\"" + _1a[key] + "\" ";
				}
				var _1c = this.getVariablePairs().join("&");
				if (_1c.length > 0) {
					_19 += "flashvars=\"" + _1c + "\"";
				}
				_19 += "/>";
			} else {
				if (this.getAttribute("doExpressInstall")) {
					this.addVariable("MMplayerType", "ActiveX");
				}
				_19 = "<object id=\"" + this.getAttribute("id") + "\" classid=\"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000\" width=\"" + this.getAttribute("width") + "\" height=\"" + this.getAttribute("height") + "\">";
				_19 += "<param name=\"movie\" value=\"" + this.getAttribute("swf") + "\" />";
				var _1d = this.getParams();
				for (key in _1d) {
					//noinspection JSUnfilteredForInLoop
					_19 += "<param name=\"" + key + "\" value=\"" + _1d[key] + "\" />";
				}
				var _1f = this.getVariablePairs().join("&");
				if (_1f.length > 0) {
					_19 += "<param name=\"flashvars\" value=\"" + _1f + "\" />";
				}
				_19 += "</object>";
			}
			return _19;
		},
		write : function(_20) {
			if (this.getAttribute("useExpressInstall")) {
				var _21 = new deconcept.PlayerVersion([6, 0, 65]);
				if (this.installedVer.versionIsValid(_21) && !this.installedVer.versionIsValid(this.getAttribute("version"))) {
					this.setAttribute("doExpressInstall", true);
					this.addVariable("MMredirectURL", escape(this.getAttribute("xiRedirectUrl")));
					document.title = document.title.slice(0, 47) + " - Flash Player Installation";
					this.addVariable("MMdoctitle", document.title);
				}
			}
			if (this.skipDetect || this.getAttribute("doExpressInstall") || this.installedVer.versionIsValid(this.getAttribute("version"))) {
				var n = (typeof _20 == "string") ? document.getElementById(_20) : _20;
				n.innerHTML = this.getSWFHTML();
				return true;
			} else {
				if (this.getAttribute("redirectUrl") != "") {
					document.location.replace(this.getAttribute("redirectUrl"));
				}
			}
			return false;
		}
	};
	deconcept.SWFObjectUtil.getPlayerVersion = function(_23, _24) {
		var _25 = new deconcept.PlayerVersion([0, 0, 0]);
		if (navigator.plugins && navigator.mimeTypes.length) {
			var x = navigator.plugins["Shockwave Flash"];
			if (x && x.description) {
				_25 = new deconcept.PlayerVersion(x.description.replace(/([a-z]|[A-Z]|\s)+/, "").replace(/(\s+r|\s+b[0-9]+)/, ".").split("."));
			}
		} else {
			try {
				var axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
				for (var i = 3; axo != null; i++) {
					axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash." + i);
					_25 = new deconcept.PlayerVersion([i, 0, 0]);
				}
			}
			catch (e) {}
			if (_23 && _25.major > _23.major) {
				return _25;
			}
			if (!_23 || ((_23.minor != 0 || _23.rev != 0) && _25.major == _23.major) || _25.major != 6 || _24) {
				try {
					_25 = new deconcept.PlayerVersion(axo.GetVariable("$version").split(" ")[1].split(","));
				}
				catch (e) {}
			}
		}
		return _25;
	};
	deconcept.PlayerVersion = function(_29) {
		this.major = parseInt(_29[0]) != null ? parseInt(_29[0]) : 0;
		this.minor = parseInt(_29[1]) || 0;
		this.rev = parseInt(_29[2]) || 0;
	};
	deconcept.PlayerVersion.prototype.versionIsValid = function(fv) {
		if (this.major < fv.major) {
			return false;
		}
		if (this.major > fv.major) {
			return true;
		}
		if (this.minor < fv.minor) {
			return false;
		}
		if (this.minor > fv.minor) {
			return true;
		}
		return this.rev >= fv.rev;
	};

	deconcept.util = {
		getRequestParameter : function(_2b) {
			var q = document.location.search || document.location.hash;
			if (q) {
				var _2d = q.indexOf(_2b + "=");
				var _2e = (q.indexOf("&", _2d) > -1) ? q.indexOf("&", _2d) : q.length;
				if (q.length > 1 && _2d > -1) {
					return q.substring(q.indexOf("=", _2d) + 1, _2e);
				}
			}
			return "";
		}
	};
	window.baSWFObject = deconcept.baSWFObject;



	// Source: src/json.js
	// -----------------------------------------------------------------------------
	// IE7 was the last not to have JSON.parse so we can remove the backup (loog in git if you need it)
	var parseJSON = AdServ.parseJSON = JSON.parse;
	 



	// Source: src/api.js
	// -----------------------------------------------------------------------------
	var prepareContexts = function(args) {
		var conf = { baseUrl : '', xhrTimeout : 5000 };
		for (var index = 0; index < args.length; index++) {
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
			if (!global || global.length === 0 || global.loaded) {
				console.error('adspaces empty');
				return false;
			} else {
				global.loaded = true;
				conf['adspaces'] = global;
			}
		}

		var contexts = conf.contexts = {};
		var adspaces = conf.adspaces;
		for (index = 0; index < adspaces.length; index++) {
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
				contexts[ctxName].adspaces[adspace.id]=adspace;
			} else {
				console.error('no id', adspace);
			}
		}

		return conf;
	};

	var load = AdServ.load = function() {
		var conf = prepareContexts(arguments);

		for (var ctxName in conf.contexts) {
			//noinspection JSUnfilteredForInLoop
			var ctx = conf.contexts[ctxName];

			var url = conf.baseUrl + '/api/v1/get/campaigns.json?adspaces=' + ctx.ids.join(',')
				          + '&adServingLoad=' + urlencode(ctx.adServingLoad)
				          + '&keyword=' + urlencode(ctx.keyword)
				          + '&searchword=' + urlencode(ctx.searchword);
			getJSON(url, (function(ctx) {
				return function(err, data) {
					console.log(data, ctx);

					if (err) {
						console.log('error', err);
					} else {
						var campaigns = data.campaigns;
						for (var index = 0; index < campaigns.length; index++) {
							var campaign = campaigns[index];
							var adspace = ctx.adspaces[campaign.adspace];
							adspace.campaign = campaign;
							console.log(campaign);
							var elem = document.getElementById(adspace.target);
							elem.innerHTML = "";
							if (campaign.campaign && campaign.banner && campaign.adspace) {
								var id = 'script_' + adspace.target + "_" + adspace.id; // adspace id is just for easier debug
								var script = document.getElementById(id);
								if (!script) {
									script = document.createElement('script');
									script.id = id;
									script.type = 'text/javascript';
									script.async = false;
									script.onload = script.onreadystatechange = (function(cmp, ctx2) {
										return function() {
											//emit_campaign(cmp, ctx2[cmp.adspace]);
										};
									})(campaign, ctx);
									script.src = conf.baseUrl + '/api/v1/get/js_banner'
										             + '?adspaceid=' + urlencode(adspace.id)
										             + '&campaignid=' + urlencode(campaign.campaign)
										             + '&bannerid=' + urlencode(campaign.banner)
										             + '&appendTo=' + urlencode(adspace.target);
									elem.parentNode.insertBefore(script, elem);
								} else {
									console.error("already loaded " + id);
									// emit_campaign.waiting--;
								}
							} 
						}
					}

				};
			})(ctx));
		}

		ready(function() {
		});
		return conf;
	}; 

	// footer ----------------------------------------------------------------------
	return AdServ; 
});