"use strict";
var engines = {};

function passbackHandlerMaker(elem, campaign) {
	return function(iframe) {

		var listener = function(m) {
			var payload;
			try {
				payload = parseJSON(m.data);

				if (payload.target && payload.next) {
					if (payload.target == campaign.target) {

						//console.error('----', payload); 
						//console.error('listener', Date.now()-payload.time);
						//console.log(payload.adspace);
						//console.log(payload.next);
						//console.log(campaign.adspace);
						if (payload.adspace == campaign.adspace && payload.target == campaign.target) {
							elem['tried'] = elem['tried'] || [];
							elem['tried'].push(payload.campaignid);
							if (elem['tried'].length == 10) {
								console.error(campaign.target, "nesting too deep .. 10 is max");
								return;
							}

							console.warn("passback from adspace " + campaign.adspace + " to " + payload.next + " in " + payload.target)
							//			iframe.contentDocument.body.innerHTML = "<b>THIS WAS REJECTED</b>";
							//console.warn("campaign rejected:", payload);
							for (var i = 0; i < elem['tried'].length - 1; i++) {
								if (elem['tried'][i] == payload.campaignid) {
									console.error("loop detected .. aborting");
									console.error("history:", elem['tried']);
									return false;
								}
							}
							//console.warn("history:", elem['tried']);

							//console.log("elem:", uid, elem);
							//console.log("err:", err);
							//console.log("m:", m);
							//console.log("payload:", campaign.nesting | 0);
							iframe.style.display = "none";
							clearTarget(campaign);  // would rather just hide iframe .. but deep tunnel make this harder

							//setTimeout(function() {
							AdServ.load({
								"guid" : campaign.guid + "_" + campaign.target,
								adspaces : [
									{
										id : payload.next,
										target : payload.target,
										adServingLoad : campaign.ctx.adServingLoad,
										context : 'Reject' + payload.adspace
									}
								]
							})
							//}, 10)

						} else {
							//console.warn('ignored message .. wrong target', payload);
						}
					}
				} else {
					//console.warn('ignored message', payload);
				}
			} catch (e) {
			}
		}
		return listener;
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

	img.style.border = "0";
	img.style.margin = "0 auto";
	img.style.display = "block";

	img.src = campaign.image;
	return img;
}


engines["image"] = function renderImage(elem, campaign) {
	var img = makeImg(campaign);
	var a = makeA(img, campaign);
	elem.appendChild(a);
}


engines["flash"] = function renderFlash(elem, campaign) {
	var url = campaign.flash + (campaign.flash.indexOf('?') > -1 ? '&' : "?") + campaign.click_tag_type + "=" + urlencode(campaign.click);
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
	document.body.setAttribute('class', (classes || '') + ' adserving_wallpaper_loaded');
	emit('wallpaper:loaded', campaign);
}

engines["html"] = function renderHtml(elem, campaign) {

	var script, original;

	function safeScriptContent(js) {
		// remove document.write to avoid accidential dom rewrite
		//		return js.replace('document.write(', 'console.log("WARNING : document.write -> "+');
		return js.replace('document.write(', 'console.error("ERROR : adspace: ' + campaign.adspace + ', campaign: ' + campaign.campaign + ', banner: ' + campaign.banner + ' uses document.write");document.write(');
		//		return js.replace('document.write(', 'console.warn("WARNING document.write");document.write(');
		//		console.log(js);
		//		
		//		return "console.log('x')";
	}

	//console.debug("using direct access"); 
	elem.innerHTML += campaign.html;
	//	elem.src = "javascript:" + campaign.html_as_js;


	var scripts = elem.getElementsByTagName("script");
	//	console.log(scripts.length);
	//	console.log(elem.innerHTML);

	// just in case the result is an inline iframe
	var iframes = elem.getElementsByTagName("iframe");
	if (iframes.length == 1) {
		bindReject(window, elem, campaign, iframes[0]);
	}

	var original;
	var length = scripts.length;
	var uid = guid("js", campaign.adspace, campaign.campaign);
	for (var i = 0; i < length; i++) {
		original = scripts[i];
		if (original.src) {
			console.warn("original.src", original);
			script = document.createElement("script");
			script.id = uid + "_" + i;
			script.src = original.src;
			elem.appendChild(script);
			// which browser  allow running of src + inline???? 
			//}   if (original.innerText) {
		} else if (original.innerText) {
			console.warn("original.txt", original);
			script = document.createElement("script");
			script.id = uid + "_" + i;
			script.innerText = safeScriptContent(original.innerText);
			elem.appendChild(script);
		} else if (original.innerHTML) {
			console.warn("original.html", original);
			setTimeout((function(src) {
				return function() {
					console.log("eval", src);
					evil(safeScriptContent(src));
				}
			})(original.innerHTML), 1000);
		}
	}

}
engines["iframe"] = function renderImage(elem, campaign) {
	var ifrm = createIframe(campaign)

	bindReject(window, elem, campaign, ifrm);

	ifrm.src = campaign.iframe_src;
	elem.appendChild(ifrm);
}

function createIframe(campaign) {
	var ifrm = document.createElement("iframe");
	ifrm.id = guid('iframe', campaign.adspace, campaign.campaign);
	ifrm.style.width = campaign.width + "px";
	ifrm.style.height = campaign.height + "px";
	ifrm.style.border = 0;
	ifrm.style.margin = "auto";
	ifrm.style.display = "block";

	ifrm.frameBorder = 0;
	ifrm.scrolling = "no";
	return ifrm;
}

function bindReject(bindTo, target, campaign, ifrm) {
	AdServ.bind(bindTo, "message", passbackHandlerMaker(target, campaign)(ifrm))

	//AdServ.bind(ifrm.contentWindow, "message", passbackHandlerMaker(target, campaign)(ifrm))

}

function wrapIframe(target, campaign) {
	var ifrm = createIframe(campaign);
	target.appendChild(ifrm);
	ifrm.contentDocument.write('<!doctype html><body style="margin:0px;padding:0px;width:100%;height:100%;"></body>');

	bindReject(window, target, campaign, ifrm);

	return ifrm;
}

function makeFloat(campaign) {

	var uid = guid('float');

	console.info("got a floating banner!", campaign);

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

	var overlayElem;
	if (campaign.floating_cover) {
		  overlayElem = document.createElement('div');
		overlayElem.id = "floating_overlay_" + uid;
		overlayElem.setAttribute('style', "display: block;position: fixed; top: 0;left: 0; height: 100%; width: 100%; z-index: 2147483640; background-color: " + campaign.floating_cover);
		campaign.elem.appendChild(overlayElem);
	}

	var floatingElem = document.createElement('div');
	floatingElem.id = "floating_" + uid;

	floatingElem.close = function() {
		clearTimeout(floatingElem.timeout);
		floatingElem.style.display = 'none';

		AdServ.emit("floating:close", campaign);
		floatingElem.close = noop;
		if (overlayElem) {
			overlayElem.style.display = 'none';
		}
	};
	floatingElem.timeout = setTimeout(floatingElem.close, 1000 * campaign.floating_time);


	var contentElem = document.createElement('div');
	contentElem.id = "content_" + uid;


	if (campaign.floating_close_position.indexOf('off') != 0) {
		var closeElem = document.createElement('div');
		bind(closeElem, 'click', floatingElem.close);
		closeElem.id = "close_" + uid;
		var closeStyle = 'position:absolute; width:29px; height:29px;z-index:2147483646;border:0px; cursor:pointer;';
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
		closeImg.src = AdServ.baseUrl + '/close.png';
		closeElem.appendChild(closeImg);
		//		if (campaign.floating_close_position.indexOf('top') > -1) {
		floatingElem.appendChild(closeElem);
	}

	floatingElem.appendChild(contentElem);
	floatingElem.setAttribute('style', style);
	floatingElem.setAttribute('class', "adserving_float adserving_float_" + campaign.adspace);
	campaign.elem.appendChild(floatingElem);
	AdServ.emit("floating:open", campaign);
	return contentElem;
}

function clearTarget(campaign) {
	if (campaign.elem == document.body) {
		//console.error("NEVER REMOVE CONTENT OF BODY");
		return;
	}
	if (campaign.isWallpaper || campaign.isFloating) {
		//console.error("NEVER REMOVE CONTENT OF wallpaper");
		return;
	}

	var childNodes = [].slice.call(campaign.elem.childNodes);
	for (var j = 0; j < childNodes.length; j++) {
		var node = childNodes[j];
		if (node.nodeType != 8) {
			campaign.elem.removeChild(node);
		}
	}
}

function addComment(elem, comment) {
	elem.appendChild(document.createComment(comment));
}


function addDebugComment(campaign) {
	if (campaign.campaign && campaign.banner && campaign.adspace) {
		addComment(campaign.elem, ' Adspace: ' + campaign.adspace
		                          + ' Group: ' + campaign.group
		                          + ' Campaign: ' + campaign.campaign
		                          + ' Banner: ' + campaign.banner + ' ');
	} else {
		var comment = ' Adspace: ' + campaign.adspace + ' (empty)';

		addComment(campaign.elem, comment);
	}
	return comment;
}

function render(campaign) {
	emit('debug:before:render', campaign);

	var ifrm;
	var targetElem;
	if (campaign.elem) {
		targetElem = campaign.elem;
		clearTarget(campaign);
		if (campaign.floating) {
			targetElem = makeFloat(campaign);
		}
		if (campaign.iframe && campaign.banner_type !== 'iframe' && campaign.banner_type !== 'wallpaper') {
			ifrm = createIframe(campaign);
			targetElem.appendChild(ifrm);
			//console.debug("append");

			ifrm.contentDocument.write('<!doctype html><body style="margin:0px;padding:0px;width:100%;height:100%;" adserv="true"></body>');
			ifrm.src = AdServ.baseUrl + "/show_campaign.php?nocount=1&adspaceid=" + campaign.adspace
			           + "&campaignid=" + campaign.campaign
			           + "&bannerid=" + campaign.banner
			           + "&target=" + campaign.target;
			//console.debug("src", ifrm.src);
			emit('debug:wrapped', campaign, ifrm, ifrm.contentDocument.body);
			ifrm.onload = function() {
				emit('debug:after:render', campaign, true);
			}
			bindReject(window, targetElem, campaign, ifrm);
		} else {
			var engine = engines[campaign.banner_type];
			if (engine) {
				engine(targetElem, campaign);
				emit('debug:after:render', campaign, false);
			} else {
				console.error('no renderer for banner type yet : ' + campaign.banner_type, campaign);
			}
		}
	} else {
		console.error('no element for banner yet : ' + campaign.banner_type, campaign);
	}
}
 
  