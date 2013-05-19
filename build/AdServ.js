"use strict";
/*!
 * AdServ 0.0.2 - Brian Demant <brian.demantgmail.com> (2013)
 */
(function (scope, definition) {
	// export as node module for testing purposes
	if (typeof module != 'undefined') {
		module.exports = definition
	} else {
		scope['AdServ'] = definition(scope);
	}
})(this, function (scope) {
	var AdServ = scope['AdServ'] || {};
	scope['AdServ'] = AdServ;
	// Source: src/ajax.js
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
			cb(xhr.status != 200 ? "err : " + xhr.status : false, xhr.responseText, xhr);
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
	


	// Source: src/event.js
	var eventHandlers = {};
	/**
	 *
	 * @param event eventname
	 * @param fn callback
	 * @param scope scope to bind to .. defaults to window
	 */
	AdServ.on = function (event, fn, scope) {
		var bound = function () {};
		// initialze if first
		eventHandlers[event] = (eventHandlers[event] === undefined) ? [] : eventHandlers[event];
		// bind if obj provided
		scope = (typeof scope === "object") ? scope : window;
	
		bound = function (args) {
			return fn.apply(scope, Array.prototype.slice.call(args, 1));
		};
	
		eventHandlers[event].push(bound);
	};
	
	
	/**
	 * @param event eventname
	 */
	AdServ.emit = function (event) {
		if (eventHandlers[event] !== undefined) {
			for (var i = 0; i < eventHandlers[event].length; i++) {
				eventHandlers[event][i](arguments);
			}
		}
	};


	// Source: src/generel.js
	scope.AdServ = scope.AdServ || {};
	scope.AdServ.adspaces = scope.AdServ.adspaces || scope.ba_adspaces || [];
	scope.adServingLoad = scope.adServingLoad || '';
	
	
	/**
	 * loads ads for the adspaces configured in the global var ba_adspaces
	 */
	AdServ.loadAdspaces = function (baseUrl) {
		if (!baseUrl) {
			baseUrl = AdServ.conf.baseUrl;
		}
		var contexts = {}, contextNames = [], index;
		AdServ.ready(function () {
			if (!AdServ.adspaces || AdServ.adspaces.length == 0) {
				return;
			}
			for (index = 0; index < AdServ.adspaces.length; index++) {
				var adspace = AdServ.adspaces[index], ctx;
				if (adspace.id > 0) {
					adspace.context = adspace.context || '_GLOBAL_';
	
					if (!contexts[adspace.context]) {
						ctx = contexts[adspace.context] = {name: adspace.context, adspaces: [], keyword: adspace.keyword || '', searchword: adspace.searchword || '' };
						contextNames.push(adspace.context);
					} else {
						ctx = contexts[adspace.context];
					}
	
					ctx[adspace.id] = adspace;
					ctx.adspaces.push(adspace.id);
				}
			}
	
	
			var emit_campaign = function (cmp, ctx) {
				if (ctx.onload && typeof ctx.onload === 'function') {
					ctx.onload(cmp, ctx);
				}
				AdServ.emit('campaign', cmp, ctx);
			};
			emit_campaign.waiting = 0;
			emit_campaign.results = [];
	
			AdServ.on('campaign', function (cmp, ctx) {
				emit_campaign.results.push([cmp, ctx]);
				if (--emit_campaign.waiting < 1) {
					if (AdServ.onload && typeof AdServ.onload === 'function') {
						AdServ.onload(emit_campaign.results);
					}
					AdServ.emit('done', emit_campaign.results);
				}
			});
	
	
			for (index = 0; index < contextNames.length; index++) {
				var name = contextNames[index];
				var context = contexts[name];
				if (context.adspaces && context.adspaces.length > 0) {
					var url = baseUrl + '/api/v1/get/campaigns.json?adspaces=' + context.adspaces.join(',')
							          + '&keyword=' + context.keyword
							          + '&searchword=' + context.searchword;
	
					AdServ.getJSON(url, (function (ctx) {
						return function (err, data) {
	
	
							if (err) {
								AdServ.emit('error', err);
								AdServ.emit('campaign', {error: err});
							} else if (data.campaigns) {
								emit_campaign.waiting += data.campaigns.length;
								for (var i = 0; i < data.campaigns.length; i++) {
									data.campaigns[i].found = false;
									var campaign = data.campaigns[i];
									if (campaign.banner > 0) {
										var adspace = ctx[campaign.adspace];
										var elem = doc.getElementById(adspace.target);
										elem.innerHTML = "";
										if (campaign.campaign && campaign.banner && campaign.adspace) {
											campaign.found = true;
											var id = 'script_' + adspace.target + "_" + campaign.adspace;
											var script = scope.document.getElementById(id);
	
											if (!script) {
												script = scope.document.createElement('script');
												script.id = id;
												script.type = 'text/javascript';
												script.async = false;
												script.onload = script.onreadystatechange = (function (cmp, ctx2) {
													return function () {
														emit_campaign(cmp, ctx2[cmp.adspace]);
													};
												})(campaign, ctx);
												script.src = baseUrl + '/api/v1/get/js_banner'
														             + '?adspaceid=' + campaign.adspace
														             + '&campaignid=' + campaign.campaign
														             + '&bannerid=' + campaign.banner
														             + '&appendTo=' + adspace.target;
												elem.parentNode.insertBefore(script, elem);
											} else {
												AdServ.emit('error', "already loaded " + id);
												emit_campaign.waiting--;
											}
										}
									} else {
										emit_campaign(campaign, ctx[campaign.adspace]);
									}
								}
							}
						}
					})(context));
				}
			}
	
		});
	};
	 


	// Source: src/json.js
	var e = function (s) { return eval("(" + s + ")"); };
	
	/**
	 * a minimal JSON parser .. based on json2 (https://github.com/douglascrockford/JSON-js)
	 *
	 * defaults to built in JSON.parse
	 */
	AdServ.parseJSON = (typeof JSON === 'object') ? JSON.parse : function (source) {
		source += "";
		var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
		//cx.lastIndex = 0;
		if (cx.test(source)) {source = source.replace(cx, function (a) {return"\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)})}
		if (/^[\],:{}\s]*$/.test(source.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
			return e(source);
		}
		throw  "JSON.parse";
	};


	// Source: src/ready.js
	/**
	 * basic onload wrapper
	 *
	 * https://github.com/ded/domready
	 * domready (c) Dustin Diaz 2012 - License MIT
	 *
	 * @param callback
	 */ 
	AdServ.ready = (function (ready) {
		var fns = [], fn, f = false
				, doc = scope.document 
				, testEl = doc.documentElement
				, hack = testEl.doScroll
				, domContentLoaded = 'DOMContentLoaded'
				, addEventListener = 'addEventListener'
				, onreadystatechange = 'onreadystatechange'
				, readyState = 'readyState'
				, loaded = /^loade|c/.test(doc[readyState])
	
		function flush(f) {
			loaded = 1;
			while (f = fns.shift()) {
				f()
			}
		}
	
		doc[addEventListener] && doc[addEventListener](domContentLoaded, fn = function () {
			doc.removeEventListener(domContentLoaded, fn, f)
			flush()
		}, f)
	
	
		hack && doc.attachEvent(onreadystatechange, fn = function () {
			if (/^c/.test(doc[readyState])) {
				doc.detachEvent(onreadystatechange, fn)
				flush()
			}
		})
	
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

	return AdServ;
});