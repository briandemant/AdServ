"use strict";
var engines = {};

function passbackHandlerMaker(elem, campaign) {
	return function(iframe) {
		return function(m) {
			var payload, err;
			try {
				payload = parseJSON(m.data);
			} catch (e) {
				err = e;
			}
			iframe.style.display = "none";
//			iframe.contentDocument.body.innerHTML = "<b>THIS WAS REJECTED</b>";
			console.log("campaign rejected:", campaign);
			console.log("elem:", elem);
			console.log("err:", err);
			console.log("payload:", payload);
			console.log("payload:", campaign.nesting | 0);
			campaign.nesting = (campaign.nesting | 0) + 1;
			if (campaign.nesting < 10) {
//				console.warn("passback from adspace "+ campaign.adspace +" to " + payload.adspaceid)
				AdServ.load({ adspaces : [
					{id : payload.adspaceid, target : elem}
				]})
			} else {
				console.error("too deep")
			}
		}
	};
};

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
	img.id = "img_" + guid;
	img.border = 0;
	img.src = campaign.image;
	return img;
}

//
//function addIframe(elem, width, height, content, guid, cb) {
//	var ifrm = createIframe(guid, width, height);
//	elem.appendChild(ifrm);
//	ifrm.contentDocument.write(content);
//	if (cb) {
//		window.addEventListener("message", function(m) {
////		ifrm.contentWindow.addEventListener("message", function(m) {
//			var json, err;
//			try {
//				json = parseJSON(m.data);
//			} catch (e) {
//				err = e;
//			}
//			console.error(err, json);
//			// cp(err, json);
//		})
//	}
//	return ifrm;
//}

engines["image"] = function renderImage(elem, campaign, guid) {
	var img = makeImg(campaign, guid);
	var a = makeA(img, campaign, guid);
	elem.appendChild(a);
}

engines["iframe"] = function renderImage(elem, campaign, guid) {
	var ifrm = document.createElement("iframe");
	ifrm.id = "ifrm_" + guid;
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

engines["flash"] = function renderFlash(elem, campaign, guid) {
//	console.debug("qwe");
	var flash = new Flash(campaign.flash, "flash_" + guid, campaign.width, campaign.height);
	if (!flash.write(elem)) {
		var img = makeImg(campaign, guid);
		var a = makeA(img, campaign, guid);
		elem.appendChild(a);
	}
}

engines["txt"] = function renderImage(elem, campaign, guid) {
	var text = document.createTextNode(campaign.txt);
	var a = makeA(text, campaign, guid);
	elem.appendChild(a);
}


engines["wallpaper"] = function renderwallpaper(elem, campaign, guid) {
	function adserving_bgclick(a) {
		if (!a) {
			a = window.event;
		}
		var tg = (window.event) ? a.srcElement : a.target;
		if (tg == elem) {
			window.open(campaign.click);
		}
	}

	elem.style.backgroundImage = 'url(' + campaign.image + ')';
	elem.style.backgroundRepeat = campaign.wallpaper_repeat || 'no-repeat';
	elem.onclick = adserving_bgclick;

	var classes = document.body.getAttribute('class');
	document.body.setAttribute('class', (classes || '') + 'adserving_wallpaper_loaded');
	emit('wallpaper_loaded', campaign);
}

engines["html"] = function renderHtml(elem, campaign, guid) {
	var script, original;

	function safeScriptContent(js) {
		// remove document.write to avoid accidential dom rewrite
//		return js.replace('document.write(', 'console.log("WARNING : document.write -> "+');
//		return js.replace('document.write(', 'console.warn("WARNING : banner: ' + campaign.banner + ' uses document.write");document.write(');
		return js.replace('document.write(', 'console.warn("WARNING document.write");document.write(');
//		console.log(js);
//		
//		return "console.log('x')";
	}

	//console.debug("using direct access"); 
	elem.innerHTML = campaign.html;
//	elem.src = "javascript:" + campaign.html_as_js;
	var scripts = elem.getElementsByTagName("script");
	console.log(scripts.length);
	console.log(elem.innerHTML);

	var original;

	var length = scripts.length;
	for (var i = 0; i < length; i++) {
		alert("script " + i);
		original = scripts[i];
		console.log("original", original);
		if (original.src) {
			console.log("original.src");
			script = document.createElement("script");
			script.id = "js_" + guid + "_" + i;
			script.src = original.src;
//			elem.appendChild(script);
		}

		if (original.innerText) {
			console.log("original.txt");
			script = document.createElement("script");
			script.id = "js_" + guid + "_" + i;
//			console.log(original.innerHTML); 
			script.innerText = safeScriptContent(original.innerText);
//			setTimeout((function (script,elem) {
//				return function() {
			elem.appendChild(script);
//				}
//			})(script,elem),0)
////			break;
		} else if (original.innerHTML) {
			alert("using script.innerHTML");
			console.log("original.html", original);
			eval(safeScriptContent(original.innerHTML));
		}
	}
}

function createIframe(guid, width, height) {
	var ifrm = document.createElement("iframe");
	ifrm.id = "iframe_" + guid;
	ifrm.style.width = width + "px";
	ifrm.style.height = height + "px";
	ifrm.style.border = 0;
	ifrm.style.borderStyle = "none";
	ifrm.frameBorder = 0;
	ifrm.scrolling = "no";
	return ifrm;
}
function wrapIframe(target, width, height, guid, handleMaker) {
	var ifrm = createIframe("wrap_" + guid, width, height);
	target.appendChild(ifrm);
	ifrm.contentDocument.write('<!doctype html><body style="margin:0px;padding:0px;width:100%;height:100%;"></body>');

	AdServ.bind(window, "message", handleMaker(ifrm))

	return ifrm;
}

function render(campaign) {
	//console.log(campaign); 
	if (campaign.elem) {
		var targetElem = campaign.elem;
		if (campaign.iframe && campaign.banner_type !== 'iframe' && campaign.banner_type !== 'wallpaper') {
			if (campaign.banner_type !== 'html') {

				var ifrm = wrapIframe(targetElem, campaign.width, campaign.height, campaign.adspace + "_" + campaign.ctx.conf.guid, passbackHandlerMaker(targetElem, campaign));
				targetElem = ifrm.contentDocument.body;
			} else {
				var ifrm = createIframe("wrap_" + campaign.ctx.conf.guid, campaign.width, campaign.height);
				console.log(campaign);
				
				ifrm.src = "http://education.adservinginternational.com/api/v2/get/html/" + campaign.banner;
				AdServ.bind(window, "message", passbackHandlerMaker(targetElem, campaign)(ifrm));
				targetElem.appendChild(ifrm);
				return;
			}
		}
		var engine = engines[campaign.banner_type];
		console.debug(campaign.banner_type);
		if (engine) {
			engine(targetElem, campaign, campaign.adspace + "_" + campaign.ctx.conf.guid);
			emit('adspace_loaded', campaign);
		} else {
			console.error('no renderer for banner type yet : ' + campaign.banner_type, campaign);
		}
	} else {
		console.error('no element for banner yet : ' + campaign.banner_type, campaign);
	}
};
AdServ.render = render; 