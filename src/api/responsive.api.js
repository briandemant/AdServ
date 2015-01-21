"use strict";

//console.warn("RESPONSIVE");

AdServ.responsive = true;

var unrenderedAdspaces = [];

function countCampaign(campaign) {
	var url;
	var ctx = campaign.ctx;
	var conf = ctx.conf;
	//console.log('please count ', campaign);
	emit("debug:count", campaign);
	if (campaign.campaign && campaign.banner) {
		emit("debug:count:view", campaign);
		url = conf.baseUrl + '/api/v2/count/view?adspaceid=' + campaign.adspace
		      + '&bannerid=' + urlencode(campaign.banner)
		      + '&campaignid=' + urlencode(campaign.campaign)
		      + '&keyword=' + urlencode(ctx.keyword)
		      + '&searchword=' + urlencode(ctx.searchword);
	} else {
		emit("debug:count:load", campaign);
		url = conf.baseUrl + '/api/v2/count/load?adspaceid=' + campaign.adspace
		      + '&keyword=' + urlencode(ctx.keyword)
		      + '&searchword=' + urlencode(ctx.searchword);
	}
	get(url, function(err, data) {
		if (err) {
			console.error(err, campaign);
		} 
	})
}
var checkVisibilityNow = function() {
	if (len(unrenderedAdspaces) == 0) {
		return;
	}
	
	var notVisible = [];
	for (var index = 0; index < len(unrenderedAdspaces); index++) {
		var campaign = unrenderedAdspaces[index];
		if (isVisible(campaign.elem)) { 
			countCampaign(campaign);
			if (campaign.campaign && campaign.banner) {
				render(campaign);
			}
		} else {
			notVisible.push(campaign);
		}
	}
	emit("debug:checkVisibility:done", notVisible.length);
	unrenderedAdspaces = notVisible;
};
var throttledCheckVisibility = throttle(checkVisibilityNow, 200);

AdServ.on('debug:checkVisibility:now', function() {
	checkVisibilityNow();
});
AdServ.on('page:resize', function() {
	throttledCheckVisibility();
});

function renderAll() {
	throttledCheckVisibility();
}