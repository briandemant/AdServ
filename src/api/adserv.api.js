"use strict";

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
		          + ( ctxName != '_GLOBAL_' ? '&context=' + ctxName : '')
		          + '&uid=' + conf.guid + '&count';
		//console.debug('load',url);

		getJSON(url, (function(ctx) {
			ctx.conf = conf;
			return function(err, data) {

				//console.debug('got', data);
				if (err) {
					console.error(err);
				} else {
					var campaigns = data.campaigns;
					ctx.adServingLoad = data.meta.adServingLoad;
					for (var index = 0; index < len(campaigns); index++) {
						var campaign = campaigns[index];

						ctx.adspaces[index].guid = campaign.guid = guid("ad");
						campaign.ctx = ctx;
						campaign.target = ctx.adspaces[index].target;
						campaign.type = (campaign.wallpaper ? "wallpaper:" : "") + (campaign.floating ? "floating:" : "") + campaign.banner_type;
						campaign.elem = $ID(campaign.target);
						if (campaign.elem) {
							clearTarget(campaign);
							
							addDebugComment(campaign);
							logCampaign(ctx, campaign);
							
							emit('adspace:loaded', campaign);
							if (campaign.campaign && campaign.banner && campaign.adspace) { 
								invisibleAdspaces.push(campaign);
							}  
						} else {
							console.error("target for adspace not found : " + campaign.target, campaign);
						}
					}
				}
				emit('debug:context:loaded', ctx);
				--anyWaiting;
				if (!anyWaiting) {
					ready(function() {
						checkVisibility();
						emit('debug:all:contexts:loaded', invisibleAdspaces);
					});
				}
			};
		})(ctx));
	}

	return conf;
};

console.debug("AdServ.released : " + AdServ.released);

