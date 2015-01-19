"use strict";

var unrenderedAdspaces = [];

 
var checkVisibility = throttle(function() {
	if (len(unrenderedAdspaces) == 0) {
		return;
	}

	var notVisible= [];
	for (var index = 0; index < len(unrenderedAdspaces); index++) {
		var campaign = unrenderedAdspaces[index];
		if (isVisible(campaign.elem)) { 
			render(campaign);
		} else {
			notVisible.push(campaign);
		}
	}
	emit("debug:checkVisibility:leave", notVisible.length);
	unrenderedAdspaces = notVisible;
}, 200);

AdServ.on('page:resize', function() { 
	checkVisibility();
});

function renderAll() {
	if (AdServ.responsive) {
		checkVisibility();
	} else {
		var campaign;
		while (campaign = unrenderedAdspaces.shift()) {
			render(campaign);
		}
	}
}

AdServ.loadAdspaces = AdServ.load = function load() {

	var conf = prepareContexts(arguments);
	var anyWaitingContexts = 0;
	// count contexts
	for (var x in conf.contexts) {
		anyWaitingContexts++;
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
		          + '&guid=' + conf.guid + '&count';

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

						ctx.adspaces[index].guid = campaign.guid = conf.guid;
						campaign.ctx = ctx;
						campaign.target = ctx.adspaces[index].target;
						if (ctx.adspaces[index].isWallpaper) {
							campaign.isWallpaper = true;
						}
						campaign.type = (campaign.wallpaper ? "wallpaper:" : "") + (campaign.floating ? "floating:" : "") + campaign.banner_type;
						campaign.elem = $ID(campaign.target);
						if (campaign.elem) {
							clearTarget(campaign);

							addDebugComment(campaign);
							logCampaign(ctx, campaign);

							emit('adspace:loaded', campaign);
							if (campaign.campaign && campaign.banner && campaign.adspace) {
								unrenderedAdspaces.push(campaign);
							}
						} else {
							console.error("target for adspace not found : " + campaign.target, campaign);
						}
					}
				}
				emit('debug:context:loaded', ctx);
				--anyWaitingContexts;
				if (!anyWaitingContexts) {
					ready(function() {
						renderAll();
						emit('debug:all:contexts:loaded', unrenderedAdspaces);
					});
				}
			};
		})(ctx));
	}

	return conf;
};
 
if (AdServ.responsive) { 
	console.debug("AdServ(responsive) : v." + AdServ.version+" " + AdServ.released);
} else  { 
	console.debug("AdServ : v." + AdServ.version+" " + AdServ.released);
}
