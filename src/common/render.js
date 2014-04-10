"use strict";
var engines = {};

function makeA(elem, campaign, guid) {
	var a = document.createElement('a');
	a.id = "a_" + guid
	a.setAttribute('href', campaign.click);
	a.setAttribute('target', guid);
	a.appendChild(elem);
	return a;
}

function makeImg(campaign, guid) {
	var img = document.createElement('img');
	img.id = "img_" + guid
	img.src = campaign.image;
	return img;
}


engines["image"] = function renderImage(elem, campaign, guid) {
	var img = makeImg(campaign, guid);
	var a = makeA(img, campaign, guid);
	elem.appendChild(a);
}

engines["txt"] = function renderImage(elem, campaign) { 
	var text = document.createTextNode(campaign.txt);
	var a = makeA(text, campaign, guid);
	elem.appendChild(a);
}

function render(campaign) {
	console.log(campaign);
	if (campaign.elem) {
		campaign.elem.innerHTML = "";
		var engine = engines[campaign.banner_type];
		if (engine) {
			engine(campaign.elem, campaign, campaign.adspace + "_" + campaign.ctx.conf.guid);
		} else {
			console.error('no renderer for banner type yet : ' + campaign.banner_type, campaign);
		}
	} else {
		console.error('no renderer for banner type yet : ' + campaign.banner_type, campaign);
	}
};
AdServ.render = render; 