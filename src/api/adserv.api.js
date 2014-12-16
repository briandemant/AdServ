"use strict";


var showCampaign = function(campaign) {
	//console.debug('show',campaign);
	
	render(campaign);
};

var checkVisibility = throttle(function() {
	if (len(invisibleAdspaces) == 0) {
		return;
	}

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
						campaign.target = ctx.adspaces[index].target || ctx.adspaces[index].wallpaperTarget || document.body;
						campaign.type = (campaign.wallpaper ? "wallpaper:" : "") + (campaign.floating ? "floating:" : "") + campaign.banner_type;
						campaign.elem = $ID(campaign.target);
						if (campaign.elem) {
							if ($ID(ctx.adspaces[index].target)) {
								clearTarget(campaign);
								if (campaign.campaign && campaign.banner && campaign.adspace) {
									addComment(campaign.elem, ' Adspace: ' + campaign.adspace
									                          + ' Group: ' + campaign.group
									                          + ' Campaign: ' + campaign.campaign
									                          + ' Banner: ' + campaign.banner + ' ');
								} else {
									var comment = ' Adspace: ' + campaign.adspace + ' (empty)';

									addComment(campaign.elem, comment);
								}
							}

							var info = 'Adspace';
							if (ctx.name == '_GLOBAL_') {
								info += ': ';
							} else {
								info += '(' + ctx.name + '): ';
							}
							
							if (campaign.type != 'undefined') {
								console.info(info + campaign.adspace + " " + campaign.type + ( campaign.iframe ? "" : " in iframe"), campaign.elem);
							} else {
								console.info(info + campaign.adspace + " is EMPTY", campaign.elem);
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