"use strict";

var adspaces = [];
var wallpaper = false;
var keyword = '';
var searchword = '';


var target = "target";
var adServingLoad = "adServingLoad";
var searchwordName = "searchword";
var keywordName = "keyword";
var readyState = "readyState";
window[adServingLoad] = window[adServingLoad] || '';

function getNextAdspace() {
	getNextAdspace.count = getNextAdspace.count || 0;
	if (adspaces.length == getNextAdspace.count) {
		return false;
	}
	var currentAdspace = adspaces[getNextAdspace.count];
	getNextAdspace.count++;
	return currentAdspace;
}

function loadWallpaper() {
	if (wallpaper) {
		var url = AdServ.baseUrl + 'wallpaper.php?adspaceid=' + wallpaper.id +
		          '&adServingLoad=' + window[adServingLoad] +
		          '&keywords=' + wallpaper.keyword +
		          (wallpaper[ searchwordName] ? '&sw=' + wallpaper[searchwordName] : '') +
		          (wallpaper[target] ? '&wallpaper[target]=' + wallpaper[target] : '');

		var body = $("body");
		var current_background = css(body, "background-image");
		loadScript(url, function() {
			if (current_background != css(body, "background-image")) {
				body.setAttribute('class', (body.getAttribute('class') || '') + ' adserving_wallpaper_loaded');
			} else {
//				body.setAttribute('class', (body.getAttribute('class') || '') + ' adserving_wallpaper_missing');
			}
		});
	}
}

function loadNext() {
	var currentAdspace = getNextAdspace();
	if (currentAdspace) {
		// clear target
		var elem = $("#" + currentAdspace[target]);
		elem.innerHTML = '';

		var url = AdServ.baseUrl + "append.php?adspaceid=" + currentAdspace.id +
		          "&keywords=" + currentAdspace.keyword +
		          "&appendTo=" + currentAdspace[target] +
		          "&adServingLoad=" + window[adServingLoad];

		loadScript(url, loadNext);
	}
}

function addAdspaces(list) {
	if (list) {
		for (var idx in list) {
			var adspace = list[idx];
			if (document.getElementById(adspace[target]) != null) {
				keyword = keyword || adspace[keywordName] || '';
				searchword = searchword || adspace[searchwordName] || '';
				adspaces.push(adspace);
			}
		}
	}
}

AdServ.load = function(listOrObj) {
	addAdspaces(window['ba_adspaces']);
	if (isObject(listOrObj)) {
		if (listOrObj.adspaces) {
			addAdspaces(listOrObj.adspaces);
		}
		if (listOrObj.wallpaper) {
			wallpaper = listOrObj.wallpaper;
		} else if (window['ba_wallpaper']) {
			wallpaper = window['ba_wallpaper'];
		}

		// listOrObj wins
		searchword = listOrObj[searchwordName] || searchword;
		keyword = listOrObj[keywordName] || keyword;
	}
	console.log("searchword", searchword);
	console.log("keyword", keyword);

	loadWallpaper();
	loadNext();
};