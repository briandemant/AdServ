"use strict";


//console.warn("ASYNC");

AdServ.responsive = false;

var unrenderedAdspaces = [];


function renderAll() {
	var campaign;
	while (campaign = unrenderedAdspaces.shift()) {
		render(campaign);
	}
}