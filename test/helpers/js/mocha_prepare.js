assert = chai.assert;
mocha.setup('bdd');

var currentIframe, win, doc;

function loadPage(page, width, height, cb) {
	console.debug("loading : " + page);

	var testarea = document.getElementById("testarea");
	testarea.innerHTML = '';
	var ifrm = document.createElement("iframe");

	ifrm.style.width = width + "px";
	ifrm.style.height = height + "px";
	ifrm.style.border = 0;
	ifrm.style.borderStyle = "none";
	ifrm.frameBorder = 0;
	ifrm.scrolling = "no";

	ifrm.onload = function() {
		console.debug('ifrm.onload ')
		win = currentIframe.contentWindow;
		doc = win.document;
		cb(win, doc);
	};


	ifrm.src = page;
	currentIframe = ifrm;

	testarea.appendChild(ifrm);
}

function getBannerElem(idx) {
	if (+idx === idx) {
		return doc.getElementById('banner' + idx);
	} else if (/banner\d+/.test(idx)) {
		return doc.getElementById(idx);
	}
	else {
		return idx;
	}
}
function getBannerInfo(div) {
	div = getBannerElem(div);
	var result = {id : div.id, prev : []};
	var i = div.childNodes.length;
	var node;
	var pattern = new RegExp('([A-Za-z]+): (\\d+)', 'g');
	var match = null;
	var first = true;
	while (--i >= 0) {
		node = div.childNodes[i];
		var comment = node.textContent;
		result.empty = /empty/.test(comment);
		if (node.nodeType == 8 && /^ Adspace:/.test(comment)) {
			var data = {};
			while (match = pattern.exec(comment)) {
				if (first) {
					result[match[1].toLowerCase()] = match[2] | 0;
				}
				data[match[1].toLowerCase()] = match[2] | 0;
			}
			first = false;
			result.prev.push(data)
		}
	}
	return result;
}

function getBannerIframeDoc(idx) {
	var elem = getBannerElem(idx);
	return elem.children[0].contentDocument;
}

var messages = [];
window.addEventListener("message", function(event) {
	var payload;
	try {
		payload = JSON.parse(event.data);
		if (payload.next && payload.target) {
			console.debug("got rejected", event.data);
			win.postMessage(event.data, '*')
		} else if (!payload.source) {
			console.debug("got top message", event.data);
		} else {
			console.warn("got debug message", event.data);
		}
	} catch (e) {
		console.error("got message", event.data);
	}
	messages.push(payload);
}, false);
 
 

function waitForMessages(source, count, timeout) {
	console.debug("wait for " + count + ' messages from ' + source); 
	var start = Date.now();
	return new Q.Promise(function(resolve, reject) {
		var checkMessages = function() {
			var result = [];
			messages.forEach(function(message) {
				if (message.source == source) {
					result.push(message);
				}
			});
			if (result.length >= count){
				resolve(result);
			} else  {
				if (timeout < Date.now() - start) {
					console.error("wait for " + count + ' messages from ' + source +" >> timeout exceeded (" + timeout + ")"); 
								reject(new Error("waitForMessages:timeout exceeded (" + timeout + ")"));
				} else {
					setTimeout(checkMessages, 250);
				}
			}
		};
		setTimeout(checkMessages, 10);
	});
}

function makeTestPromise(adspace, tunnel, target) {
	var start = Date.now();
	return new Q.Promise(function(resolve, reject) {
		var checkMessages = function() {
			var resolved = false;
			messages.forEach(function(message) {
				if (message.target == target) {
					console.debug("msg", message, target);
					console.debug(tunnel);
					if (message.next == tunnel[0]) {
						tunnel.shift();
						var info = getBannerInfo(target);
						console.debug("info", info);
						if (tunnel.length == 0) {
							console.debug("final", info, message);
							resolve();
							resolved = true;
						}
					}
				}
			});
			if (!resolved) {
				if (5000 < Date.now() - start) {
					reject(new Error('Adspace ' + adspace + ' .. timeout after ' + ( Date.now() - start) / 1000 + ' seconds'));
				} else {
					setTimeout(checkMessages, 250);
				}
			}
		};
		setTimeout(checkMessages, 10);
	});
}