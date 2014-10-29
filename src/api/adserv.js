"use strict";

function getContext(adspace, contexts) {
	var ctxName = adspace.context || '_GLOBAL_';
	adspace.context = contexts[ctxName] = contexts[ctxName] || {
		name : ctxName,
		ids : [],
		adspaces : {},
		keyword :    adspace.keyword || AdServ.keyword,
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
			// console.error('no id', adspace);
		}
	}
	if (conf['floating']) {
		var adspace = conf['floating'];
		if (adspace.id > 0) {
			getContext(adspace, contexts);
			adspace.context.floating = adspace;
			adspace.context.adspaces[adspace.id] = adspace;
		} else {
			// console.error('no id', adspace);
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
	emit("debug:checkVisibility:leave", notReady.length);
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
							if (  campaign.type != 'undefined') {
								console.info("Adspace: " + campaign.adspace + " " + campaign.type + ( campaign.iframe ? "" : " in iframe"), campaign.elem);
							} else {
								console.info("Adspace: " + campaign.adspace + " is EMPTY", campaign.elem); 
							}


							emit('adspace:loaded', campaign);
							if (campaign.campaign && campaign.banner && campaign.adspace) { 
//								console.log("campaign:" + campaign.campaign);
//								console.log("banner:" + campaign.banner);
//								console.log("keyword:" + campaign.ctx.keyword); 
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
					emit('debug:contexts:loaded', invisibleAdspaces);
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