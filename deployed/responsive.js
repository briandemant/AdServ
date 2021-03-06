"use strict";
/*!
 * AdServ 0.1.2 / 2013-07-10 20:11:10
 * @author Brian Demant <brian.demantgmail.com> (2013)
 */
(function (window, definition) { 
	window.AdServ = definition(window, window.document); 
})(window,  function (window, document) { 
	var AdServ = window.AdServ || {};
	AdServ.version = '0.1.2';
	AdServ.released = '2013-07-10 20:11:10';
	window.AdServ = AdServ; 
	var console = window.console;

	if (!console) {
		console = {};
		console.log = console.error = function() {};
	}

	window.adServingLoad = window.adServingLoad || '';
	var toString = Object.prototype.toString;
	var slice = Array.prototype.slice;
	var urlencode = encodeURIComponent; 
	var location = document.location;
	var activeX = window.ActiveXObject;
	 
	var noop = function() {};
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
	var guid = AdServ.guid = function() {
		var guidPart = function() {
			return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
		};
		return  'ad_' + guidPart() + "_" + guidPart() + "_" + guidPart() + "_" + guidPart();
	};

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

	var len = function(item) {
		return item.length;
	};

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
				clearTimeout(requestTimeout);
				cb(xhr.status != 200 ? "err : " + xhr.status : null, xhr.responseText, xhr);
			}
		};
		xhr.onload = function() {
			clearTimeout(requestTimeout);
			if (xhr.status) {
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

		var getJSON = AdServ.getJSON = function(url, cb) {
		return get(url, function(err, value, xhr) {
			var json = value;
			if (!err) {
				json = parseJSON(value);
			}
			cb(err, json, xhr);
		})
	};
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
	var eventHandlers = {};

		var on = AdServ.on = function (event, fn, context) {
		eventHandlers[event] = (typeof eventHandlers[event] === 'undefined') ? [] : eventHandlers[event];

		eventHandlers[event].push(function (args) {
			return fn.apply(context || window, args);
		});
	};

	var once = AdServ.once = function (event, fn, context) {
		on(event, function () {
			fn();
			fn = noop;
		}, context);
	};

		var emit = AdServ.emit = function (event) {
		if (typeof eventHandlers[event] !== 'undefined') {
			var args = slice.call(arguments, 1);
			for (var i = 0; i < len(eventHandlers[event]); i++) {
				eventHandlers[event][i](args);
			}
		}
	};
	var originalResize = window['onresize'] || noop;
	window.onresize = function () {
		try {
			originalResize();
		} catch (e) {}
		emit('resize');
	};

	ready(function () {
		emit('load');
	}); 
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
	window.baSWFObject = Flash;
	var parseJSON = AdServ.parseJSON = JSON.parse;
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
					};
				})(campaign, ctx);
				script.src = conf.baseUrl + '/api/v2/get/js_banner'
					             + '?adspaceid=' + urlencode(adspace.id)
					             + '&campaignid=' + urlencode(campaign.campaign)
					             + '&bannerid=' + urlencode(campaign.banner)
					             + '&keywords=' + urlencode(ctx.keyword)
					             + '&appendTo=' + urlencode(adspace.target);

				var elem = document.getElementById(adspace.target);
				elem.innerHTML = "";
				elem.parentNode.insertBefore(script, elem);
			} else {
				console.error("already loaded " + id);
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

	var loadAdspaces = AdServ.loadAdspaces  = AdServ.load = function() { 
		var conf = prepareContexts(arguments); 
		
		var anyWaiting = 0;
		for (var x in conf.contexts) {
			anyWaiting++;
		}

		for (var ctxName in conf.contexts) {
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
							checkVisibility();
						});
					}
				};
			})(ctx));
		}

		return conf;
	};
	return AdServ; 
});