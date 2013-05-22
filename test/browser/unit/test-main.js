var noop = function () {};
var win = {};
var doc = {};
var iframe = null;
var nextTick = function (cb) {
	setTimeout(cb, 100);
};

if (!__karma__.loadedLater) {
	__karma__.loadedLater = __karma__.loaded;
}
//
__karma__.loaded = function () {
	//console.log("wazzup? " + new Date());
};






var loadFixture = function (template, beforeLoad, done) {
	var templateUrl = '/base/test/browser/fixtures/' + template + '.html';
//	console.log('loading ' + templateUrl);

	var body = document.getElementsByTagName("body")[0];
	if (iframe) {
		body.removeChild(iframe);
	}
	iframe = document.createElement("iframe");
	iframe.width = 1024;
	iframe.height = 768;

	iframe.beforeLoad = beforeLoad || noop;

	iframe.readyForTest = function (window, document) {
		win = window;
		doc = document;
		done();
	};

	iframe.id = 'fixture_iframe';
	iframe.src = templateUrl;

	body.appendChild(iframe);

	win = getIframeWindow(iframe.contentWindow);

	win.onload = function () {
		//alert("Local iframe is now loaded.");
	};

	var link = window.parent.document.getElementById('template_link_' + template);
	if (!link) {

		link = document.createElement("a");
		link.id = 'template_link_' + template;
		link.target = 'template_link_' + template;
		link.href = templateUrl;
		link.innerHTML = template;
		var banner = window.parent.document.getElementById('banner');
		banner.appendChild(link);
	}
};



__karma__.before = function (cb) {
	cb();
};

__karma__.beforeEach = function (cb) {
	cb();
};


function getIframeWindow(iframe_object) {
	var doc;

	if (iframe_object.contentWindow) {
		return iframe_object.contentWindow;
	}

	if (iframe_object.window) {
		return iframe_object.window;
	}

	if (!doc && iframe_object.contentDocument) {
		doc = iframe_object.contentDocument;
	}

	if (!doc && iframe_object.document) {
		doc = iframe_object.document;
	}

	if (doc && doc.defaultView) {
		return doc.defaultView;
	}

	if (doc && doc.parentWindow) {
		return doc.parentWindow;
	}

	return undefined;
}