//chai.Assertion.includeStack = true;

var assert = chai.assert;

if (!__karma__.loadedLater) {
	__karma__.loadedLater = __karma__.loaded;
}
//
__karma__.loaded = function () {
	//console.log("wazzup? " + new Date());
};

var nextTick = function (cb) {
	setTimeout(cb, 100);
}

var reload = function (newAdServ, after) {
//	delete this['AdServ'];
//	AdServ = newAdServ;
//	var script = document.createElement("script");
//	script.type = "text/javascript";
//	script.onload = after;
//	script.src = "/base/build/AdServ.js";
//	var first = document.getElementsByTagName("script")[0];
//	first.parentNode.insertBefore(script, first); 
};
var loadFixture = function (template, done) {
	var templateUrl = '/base/test/browser/fixtures/' + template + '.html';
//	console.log('loading ' + templateUrl);

	var body = document.getElementsByTagName("body")[0];
	if (iframe) {
		body.removeChild(iframe);
	}
	  iframe = document.createElement("iframe");
	iframe.width = 1024;
	iframe.height = 768;
	iframe.border = 0;
	iframe.readyForTest = function (window, document) {
		win = window;
		doc = document;
		done();
	};
	
	iframe.id = 'fixture_iframe';
	iframe.src = templateUrl;

	body.appendChild(iframe);
 
	win = getIframeWindow(iframe.contentWindow );
 
	win.onload = function () {
		//alert("Local iframe is now loaded.");
	}; 
};

var win = doc = {};
var iframe = null;
 

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