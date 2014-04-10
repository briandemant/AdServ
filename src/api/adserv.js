"use strict";

var prepareContexts = function(args) {
	AdServ.baseUrl = AdServ.baseUrl || '';
	AdServ.keyword = AdServ.keyword || '';
	AdServ.searchword = AdServ.searchword || '';
	var conf = { baseUrl : AdServ.baseUrl, xhrTimeout : 5000, guid : guid() };
	for (var index = 0; index < len(args); index++) {
		var arg = args[index];
		if (isFunction(arg)) {
			conf.ondone = arg;
		} else if (isObject(arg)) {
			conf = mix(conf, arg);
		} else if (isArray(arg)) {
			conf['adspaces'] = arg;
		} else if (isString(arg)) {
			AdServ.baseUrl = conf['baseUrl'] = arg;
		}
	}
	if (!isArray(conf['adspaces'])) {
		var global = window['ba_adspaces'];
		if (!global || len(global) === 0 || global.loaded) {
//			console.error('adspaces empty');
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
				keyword : adspace.keyword || AdServ.keyword,
				searchword : adspace.searchword || AdServ.searchword,
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

var showCampaign = function(campaign) {
	var ctx = campaign.ctx;
	var conf = ctx.conf;
	var url;
	console.log("loading adspace " + campaign.adspace + " into " + campaign.target);


	render(campaign);

//		var script = $ID(id);
//		if (!script) {
//			script = document.createElement('script');
//			script.id = id;
//			script.type = 'text/javascript';
//			script.async = false;
//			script.onload = script.onreadystatechange = (function(cmp, ctx2) {
//				return function() {
//					// called several times
//				};
//			})(campaign, ctx);
//			script.src = conf.baseUrl + '/api/v1/get/js_banner'
//			             + '?adspaceid=' + urlencode(adspace.id)
//			             + '&campaignid=' + urlencode(campaign.campaign)
//			             + '&bannerid=' + urlencode(campaign.banner)
//			             + '&keywords=' + urlencode(ctx.keyword)
//			             + '&appendTo=' + urlencode(adspace.target);
//
//			var elem = $ID(adspace.target);
//			elem.innerHTML = "";
//			elem.parentNode.insertBefore(script, elem);
//		} else {
//			console.error("already loaded " + id);
//		}
//	} else {
//		url = conf.baseUrl + '/api/v2/count/load?adspaceid=' + campaign.adspace
//		      + '&keyword=' + urlencode(ctx.keyword)
//		      + '&searchword=' + urlencode(ctx.searchword);
//		get(url, function(err, data) {
//			console.log(data);
//		}) 
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
AdServ.loadAdspaces = AdServ.load = function() {
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
		          + '&uid=' + conf.guid;
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
						if (campaign.campaign && campaign.banner && campaign.adspace) {
							var elem = $ID(ctx.adspaces[campaign.adspace].target);
							if (elem) {
								campaign.elem = elem;
								invisibleAdspaces.push(campaign);
							} else {
								console.error("target for adspace not found : " + campaign.target, campaign);
							}
						} else {
							console.log("adspace was empty: " + campaign.adspace, campaign);
							get(campaign.count + "&uid=" + conf.guid);
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