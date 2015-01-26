"use strict";

//console.warn("RESPONSIVE");

AdServ.responsive = true;

var unrenderedAdspaces = [];

function countCampaign(campaign) {
	emit("debug:count", campaign);
	get(campaign.count, function(err, data) {
		if (err) {
			console.error(err, campaign, data);
		}
	})
}
var checkVisibilityNow = function() {
	console.debug('checkVisibilityNow'); 
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
	console.debug('renderAll 1');
	throttledCheckVisibility();
	console.debug('renderAll 2');
	checkVisibilityNow();
}