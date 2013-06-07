"use strict";

var prepareContexts = function (args) {
	var conf = { baseUrl: '', xhrTimeout: 5000 };
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
				name         : ctxName,
				ids          : [],
				adspaces     : {},
				keyword      : adspace.keyword || '',
				searchword   : adspace.searchword || '',
				adServingLoad: ''
			};
			contexts[ctxName].ids.push(adspace.id);
			contexts[ctxName].adspaces[adspace.id] = adspace;
		} else {
			console.error('no id', adspace);
		}
	}

	return conf;
};


var throttle = function (fn, ms) {
	var disabled = false;
	return function () {
		if (!disabled) {
			disabled = true;
			fn();
			setTimeout(function () {
				fn();
				disabled = false;
			}, ms);
		}
	};
};

var showCampaignX = function (campaign) {
	if (campaign.campaign && campaign.banner && campaign.adspace) {
		console.log(campaign.target);
		var ctx = campaign.ctx;
		var conf = ctx.conf;
		var adspace = ctx.adspaces[campaign.adspace];
		var id = 'script_' + adspace.target + "_" + adspace.id; // adspace id is just for easier debug
		var script = document.getElementById(id);
		if (!script) {
			script = document.createElement('script');
			script.id = id;
			script.type = 'text/javascript';
			script.async = false;
			script.onload = script.onreadystatechange = (function (cmp, ctx2) {
				return function () {
					//emit_campaign(cmp, ctx2[cmp.adspace]);
				};
			})(campaign, ctx);
			script.src = conf.baseUrl + '/api/v1/get/js_banner'
					             + '?adspaceid=' + urlencode(adspace.id)
					             + '&campaignid=' + urlencode(campaign.campaign)
					             + '&bannerid=' + urlencode(campaign.banner)
					             + '&appendTo=' + urlencode(adspace.target);

			var elem = document.getElementById(adspace.target);
			elem.innerHTML = "";
			elem.parentNode.insertBefore(script, elem);
		} else {
			console.error("already loaded " + id);
			// emit_campaign.waiting--;
		}
	} else {
		console.log("COUNT empty view");
	}
};

var checkVisibility = throttle(function () {
	var notReady = [];
	for (var index = 0; index < len(invisibleAdspaces); index++) {
		var campaign = invisibleAdspaces[index];
		if (isVisible('#' + campaign.target)) {
			showCampaignX(campaign);
		} else {
			notReady.push(campaign);
		}
	}
	invisibleAdspaces = notReady;
}, 100);

AdServ.on('resize', checkVisibility);



var invisibleAdspaces = [];

var loadAdspaces = AdServ.loadAdspaces = function () {
	var conf = prepareContexts(arguments);

	for (var ctxName in conf.contexts) {
		//noinspection JSUnfilteredForInLoop
		var ctx = conf.contexts[ctxName];

		var url = conf.baseUrl + '/api/v1/get/campaigns.json?adspaces=' + ctx.ids.join(',')
				          + '&adServingLoad=' + urlencode(ctx.adServingLoad)
				          + '&keyword=' + urlencode(ctx.keyword)
				          + '&searchword=' + urlencode(ctx.searchword);
		getJSON(url, (function (ctx) {
			ctx.conf = conf;
			return function (err, data) { 
				if (err) {
					console.log('error', err);
				} else {
					var campaigns = data.campaigns;
					for (var index = 0; index < len(campaigns); index++) {
						var campaign = campaigns[index];  
						campaign.ctx = ctx;
						campaign.target = ctx.adspaces[campaign.adspace].target;
						invisibleAdspaces.push(campaign);
					}
				}
				ready(function () {
					console.timeEnd("ready");
					var recheck = setInterval(function () {
						checkVisibility();
						if (len(invisibleAdspaces) == 0) {
							alert('no more adspaces to check');
							clearInterval(recheck);
						}
					}, 500);
				});
			};
		})(ctx));
	}

	return conf;
};