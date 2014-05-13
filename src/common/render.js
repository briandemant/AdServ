"use strict";
var engines = {};

function passbackHandlerMaker(elem, campaign) {
	var uid = guid("handler", campaign.adspace);
	return function(iframe) {
		return function(m) {
			var payload, err;
			try {
				payload = parseJSON(m.data);
			} catch (e) {
				err = e;
			}
			if (!err && payload.adspace == campaign.adspace) {
//				console.log("payload:", payload);
				console.warn("passback from adspace " + campaign.adspace + " to " + payload.next)
				//			iframe.contentDocument.body.innerHTML = "<b>THIS WAS REJECTED</b>";
				console.log("campaign rejected:", campaign);
//				console.log("elem:", uid, elem);
				//			console.log("err:", err);
//				console.log("m:", m);
				//			console.log("payload:", campaign.nesting | 0);
//				iframe.style.display = "none";
				elem.innerHTML = ""; // would rather just hide iframe .. but deep tunnel make this harder
				campaign.nesting = (campaign.nesting | 0) + 1;
				if (campaign.nesting < 10) {
					//setTimeout(function() {
						AdServ.load({ adspaces : [
							{id : payload.next, target : elem, adServingLoad : campaign.ctx.adServingLoad}
						]})
					//},0)
				} else {
					console.error("too deep")
				}
			}
		}
	};
};


function makeA(elem, campaign) {
	var a = document.createElement('a');
	a.id = guid("a", campaign.adspace, campaign.campaign)
	a.setAttribute('href', campaign.click);
	a.setAttribute('target', "_blank");
	a.appendChild(elem);
	return a;
}

function makeImg(campaign) {
	var img = document.createElement('img');
	img.id = guid("img", campaign.adspace, campaign.campaign); 
	img.border = 0;
	img.src = campaign.image;
	return img;
}


engines["image"] = function renderImage(elem, campaign) {
	var img = makeImg(campaign);
	var a = makeA(img, campaign);
	elem.appendChild(a);
}

engines["iframe"] = function renderImage(elem, campaign) {
	var ifrm = document.createElement("iframe");
	ifrm.id = guid('iframe', campaign.adspace, campaign.campaign);
	ifrm.style.width = campaign.width + "px";
	ifrm.style.height = campaign.height + "px";
	ifrm.style.border = 0;
	ifrm.style.borderStyle = "none";
	ifrm.frameBorder = 0;
	ifrm.scrolling = "no";


	AdServ.bind(window, "message", passbackHandlerMaker(elem, campaign)(ifrm))

	ifrm.src = campaign.iframe_src;
	elem.appendChild(ifrm);
}

engines["flash"] = function renderFlash(elem, campaign) {
//	console.debug("qwe");

	var url = campaign.flash + "?" + campaign.click_tag_type + "=" + urlencode(campaign.click);
	console.log(url,campaign);
	var flash = new Flash(url, guid('flash', campaign.adspace, campaign.campaign), campaign.width, campaign.height);
	if (!flash.write(elem)) {
		var img = makeImg(campaign);
		var a = makeA(img, campaign);
		elem.appendChild(a);
	}
}

engines["txt"] = function renderImage(elem, campaign) {
	var text = document.createTextNode(campaign.txt);
	var a = makeA(text, campaign);
	elem.appendChild(a);
}


engines["wallpaper"] = function renderwallpaper(elem, campaign) {
	function adserving_bgclick(a) {
		if (!a) {
			a = window.event;
		}
		var tg = (window.event) ? a.srcElement : a.target;
		if (tg == elem) {
			window.open(campaign.click);
		}
	}

	elem.style.backgroundImage = 'url(' + campaign.wallpaper + ')';
	elem.style.backgroundRepeat = campaign.wallpaper_repeat || 'no-repeat';
	elem.onclick = adserving_bgclick;

	var classes = document.body.getAttribute('class');
	document.body.setAttribute('class', (classes || '') + 'adserving_wallpaper_loaded');
	emit('wallpaper_loaded', campaign);
}

engines["html"] = function renderHtml(elem, campaign) {
	
	var script, original;

	function safeScriptContent(js) { 
		// remove document.write to avoid accidential dom rewrite
//		return js.replace('document.write(', 'console.log("WARNING : document.write -> "+');
		return js.replace('document.write(', 'console.warn("WARNING : banner: ' + campaign.banner + ' uses document.write");document.write(');
//		return js.replace('document.write(', 'console.warn("WARNING document.write");document.write(');
//		console.log(js);
//		
//		return "console.log('x')";
	}

	//console.debug("using direct access"); 
	elem.innerHTML = campaign.html;
//	elem.src = "javascript:" + campaign.html_as_js;
 
		
	var scripts = elem.getElementsByTagName("script");
//	console.log(scripts.length);
//	console.log(elem.innerHTML);

	// just in case the result is an inline iframe
	var iframes = elem.getElementsByTagName("iframe");
	if (iframes.length == 1) {
		AdServ.bind(window, "message", passbackHandlerMaker(elem, campaign)(iframes[0]));
	}

	var original; 
	var length = scripts.length;
	var uid = guid("js", campaign.adspace, campaign.campaign);
	for (var i = 0; i < length; i++) {
//		alert("script " + i);
		original = scripts[i];
		console.log("original", original);
		if (original.src) {
			console.log("original.src");
			script = document.createElement("script");
			script.id = uid + "_" + i;
			script.src = original.src; 
//			setTimeout((function(script, elem) {
//				return function() {
					elem.appendChild(script);
//				}
//			})(script, elem), 0);
		}

		if (original.innerText) {
			console.log("original.txt");
			script = document.createElement("script");
			script.id = uid + "_" + i;
//			console.log(original.innerHTML); 
			script.innerText = safeScriptContent(original.innerText);
//			setTimeout((function (script,elem) {
//				return function() {
					elem.appendChild(script);
//				}
//			})(script,elem),0);
////			break;
		} else if (original.innerHTML) {
//			alert("using script.innerHTML");
			console.log("original.html", original);
//			eval(safeScriptContent(original.innerHTML));
			setTimeout((function(src) {
				return function() {
					console.log("eval", src); 
					eval(safeScriptContent(src));
				}
			})(original.innerHTML), 1000);
		}
	}
 
}

function createIframe(campaign) {
	var ifrm = document.createElement("iframe");
	ifrm.id = guid('iframe', campaign.adspace, campaign.campaign);
	ifrm.style.width = campaign.width + "px";
	ifrm.style.height = campaign.height + "px";
	ifrm.style.border = 0;
	ifrm.style.borderStyle = "none";
	ifrm.frameBorder = 0;
	ifrm.scrolling = "no";
	return ifrm;
}
function wrapIframe(target, campaign) {
	var ifrm = createIframe(campaign);
	target.appendChild(ifrm);
	ifrm.contentDocument.write('<!doctype html><body style="margin:0px;padding:0px;width:100%;height:100%;"></body>');

	AdServ.bind(window, "message", passbackHandlerMaker(target, campaign)(ifrm))

	return ifrm;
}

function makeFloat(campaign) {
	console.log(campaign);

	var uid = guid('float');
	console.log("got a floating banner!", uid);
//	console.log(" floating_close_position : " + campaign.floating_close_position);
//	console.log(" floating_position : " + campaign.floating_position);
//	console.log(" floating_time : " + campaign.floating_time);
	var style = 'position:fixed; width:' + campaign.width + 'px; height:' + (campaign.height) + 'px; z-index:2147483646;';

	if (campaign.floating_position == 'centre') {
		style += 'left:50%; top:50%;' +
		         'margin-left:-' + (campaign.width / 2) + 'px;' +
		         'margin-top:-' + ((campaign.height + 16) / 2) + 'px;';
	} else if (campaign.floating_position == 'top_centre') {
		style += 'left:50%; top:0;' +
		         'margin-left:-' + (campaign.width / 2) + 'px;';
	} else if (campaign.floating_position == 'top_left') {
		style += 'left:0; top:0;';
	} else if (campaign.floating_position == 'top_right') {
		style += 'right:0; top:0;';
	} else if (campaign.floating_position == 'bottom_left') {
		style += 'left:0; bottom:0;';
	} else if (campaign.floating_position == 'bottom_right') {
		style += 'right:0; bottom:0;';
	} else if (campaign.floating_position == 'bottom_centre') {
		style += 'left:50%; bottom:0;' +
		         'margin-left:-' + (campaign.width / 2) + 'px;' +
		         'margin-top:-' + (campaign.height / 2) + 'px;' +
		         ';position:fixed !important;';
	} else if (campaign.floating_position.indexOf(".") > 0) {
		var coords = campaign.floating_position.split(".");
		style += 'left:' + coords[0] + '; top:' + coords[1] + ';';
	}
//	console.error('TODO: REMOVE YELLOW'); 

	var floatingElem = document.createElement('div');
	floatingElem.id = "floating_" + uid;

	floatingElem.close = function() {
		clearTimeout(floatingElem.timeout);
		floatingElem.style.display = 'none';


		floatingElem.close = noop;
	};
	floatingElem.timeout = setTimeout(floatingElem.close, 1000 * campaign.floating_time);


	var contentElem = document.createElement('div');
	contentElem.id = "content_" + uid;
	


	if (campaign.floating_close_position.indexOf('off') != 0) {
		var closeElem = document.createElement('div');
		bind(closeElem, 'click', floatingElem.close);
		closeElem.id = "close_" + uid;
		var closeStyle = 'position:absolute; width:16px; height:16px;z-index:2147483646;border:0px; cursor:pointer;';
		style += "background:#fff;";
		if (campaign.floating_close_position == 'top_left') {
			closeStyle += 'left:0; top:0;';
		} else if (campaign.floating_close_position == 'top_right') {
			closeStyle += 'right:0; top:0;';
		} else if (campaign.floating_close_position == 'bottom_left') {
			closeStyle += 'left:0; bottom:0;';
		} else if (campaign.floating_close_position == 'bottom_right') {
			closeStyle += 'right:0; bottom:0;';
		}
		closeElem.setAttribute('style', closeStyle);
		var closeImg = document.createElement('img');
		closeImg.src = AdServ.baseUrl + '/close.gif';
		closeElem.appendChild(closeImg);
//		if (campaign.floating_close_position.indexOf('top') > -1) {
		floatingElem.appendChild(closeElem);
	}

	floatingElem.appendChild(contentElem);
	floatingElem.setAttribute('style', style);
	floatingElem.setAttribute('class', "adserving_float adserving_float_" + campaign.adspace);
	document.body.appendChild(floatingElem);
	return campaign.elem = contentElem;
}
function render(campaign) {
	var ifrm;
	var targetElem;
	if (campaign.elem) { 
		targetElem = campaign.elem;
		if (campaign.floating) {
			targetElem = makeFloat(campaign);
		}
		if (campaign.iframe && campaign.banner_type !== 'iframe' && campaign.banner_type !== 'wallpaper') {
			if (campaign.banner_type !== 'html') {
				ifrm = wrapIframe(targetElem, campaign);
				targetElem = ifrm.contentDocument.body;
			} else {
				ifrm = createIframe(campaign);
//				ifrm.src = AdServ.baseUrl+"/api/v2/get/html/" + campaign.banner;
				ifrm.src = AdServ.baseUrl + "/show_campaign.php?nocount=1&adspaceid=" + campaign.adspace + "&campaignid=" + campaign.campaign + "&bannerid=" + campaign.banner
//				console.log(ifrm.src);
				AdServ.bind(window, "message", passbackHandlerMaker(targetElem, campaign)(ifrm));
				targetElem.appendChild(ifrm);
				return;
			}
		}
		var engine = engines[campaign.banner_type];
		if (engine) {
			engine(targetElem, campaign);
			emit('adspace_loaded', campaign);
		} else {
			console.error('no renderer for banner type yet : ' + campaign.banner_type, campaign);
		}
	} else {
		console.error('no element for banner yet : ' + campaign.banner_type, campaign);
	}
};
AdServ.render = render;
  