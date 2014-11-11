assert = chai.assert;
mocha.setup('bdd');

var currentIframe, win, doc, asd;

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
		return doc.getElementById( idx);
	}
	else {
		return idx;
	}
}
function getBannerInfo(div) {
	var comment = div.childNodes[0].textContent;
	//var result = {idx : idx, id : 'banner' + idx, empty : /empty/.test(comment)};
	var result = {id : div.id, empty : /empty/.test(comment)};
	var pattern = new RegExp('([A-Za-z]+): (\\d+)', 'g');
	var match = null;
	while (match = pattern.exec(comment)) {
		result[match[1].toLowerCase()] = match[2] | 0;
	}
	return result;
}

function getBannerIframeDoc(idx) {
	var elem = getBannerElem(idx);
	return elem.children[0].contentDocument;
}

window.addEventListener("message", function() {
	//console.log("got message"); 
}, false); 