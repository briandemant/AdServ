var noop = function() {};
var win = {};
var doc = {};
var iframe = null;
var nextTick = function(cb) {
	setTimeout(cb, 100);
};

var waitFor = function(check, done, interval) {
	if (check()) {
		return done();
	}

	var retry = setInterval(function() {
		if (check()) {
			clearInterval(retry);
			done();
		}
	}, interval || 100); 
};

if (!__karma__.loadedLater) {
	__karma__.loadedLater = __karma__.loaded;
}
//
__karma__.loaded = function() {
	//console.log("wazzup? " + new Date());
};

mocha.setup({globals : ['navigator', 'flashfirebug_cache_xhr', 'fixture_iframe', '0']});

var loadFixture = function(options, done) {

	options = _.isString(options) ? {template : options} : options;
	options['pre'] = options['pre'] || noop;
	options['post'] = options['post'] || function() {
		__karma__.before(done);
	};

	var templateUrl = '/base/test/browser/fixtures/' + options.template + '.html';

	var body = document.getElementsByTagName("body")[0];
	if (iframe) {
		body.removeChild(iframe);
	}
	iframe = document.createElement("iframe");
	iframe.frameborder = 1;
	iframe.width = '100%';
	iframe.height = '100%';
	iframe.width = 1024;
	iframe.height = 768;
//	var ctx = window.parent.document.getElementById('context');
//	ctx.width = 1024;
//	ctx.height = 768;
//	console.log(ctx.width);


	iframe.beforeLoad = options.pre || noop;

	iframe.readyForTest = function(window, document) {
		win = window;
		doc = document;
		options.post(window, document);
//		var savedOnResize = window.onresize;  
//		window.onresize = function() {
//			savedOnResize();
//			console.log('setup:main2');
//		}
	};

//	iframe.onresize = function () {
//		console.log('setup:main');
//	};
	iframe.id = 'fixture_iframe';
	iframe.src = templateUrl;

	body.appendChild(iframe);

	win = getIframeWindow(iframe.contentWindow);

	win.onload = function() {
//	 	alert("Local iframe is now loaded.");
	};


	var link = window.parent.document.getElementById('template_link_' + options.template);

	if (!link) {

		link = window.parent.document.createElement("a");
		link.id = 'template_link_' + options.template;
		link.target = 'template_link_' + options.template;
		link.href = templateUrl;
		link.innerHTML = ' ' + options.template + ' ';

		var banner = window.parent.document.getElementById('banner');
		banner.appendChild(link);
	}
};

var manuallink = window.parent.document.getElementById('manuallink');

if (!manuallink) {

	manuallink = window.parent.document.createElement("a");
	manuallink.id = 'manuallink';
	manuallink.target = 'manuallink';
	manuallink.href = '/base/test/browser/manual/index.html';
	manuallink.innerHTML = ' Manual ';
	var banner = window.parent.document.getElementById('banner');
	banner.appendChild(manuallink);
}


__karma__.before = function(cb) {
	cb();
};

__karma__.beforeEach = function(cb) {
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

(function() {
	// http://www.quirksmode.org/js/detect.html
	var BrowserDetect = {
		init : function() {
			this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
			this.version = this.searchVersion(navigator.userAgent)
				               || this.searchVersion(navigator.appVersion)
				|| "an unknown version";
			this.OS = this.searchString(this.dataOS) || "an unknown OS";
		},
		searchString : function(data) {
			for (var i = 0; i < data.length; i++) {
				var dataString = data[i].string;
				var dataProp = data[i].prop;
				this.versionSearchString = data[i].versionSearch || data[i].identity;
				if (dataString) {
					if (dataString.indexOf(data[i].subString) != -1) {
						return data[i].identity;
					}
				}
				else if (dataProp) {
					return data[i].identity;
				}
			}
		},
		searchVersion : function(dataString) {
			var index = dataString.indexOf(this.versionSearchString);
			if (index == -1) {
				return;
			}
			return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
		},
		dataBrowser : [
			{
				string : navigator.userAgent,
				subString : "Chrome",
				identity : "Chrome"
			},
			{   string : navigator.userAgent,
				subString : "OmniWeb",
				versionSearch : "OmniWeb/",
				identity : "OmniWeb"
			},
			{
				string : navigator.vendor,
				subString : "Apple",
				identity : "Safari",
				versionSearch : "Version"
			},
			{
				prop : window.opera,
				identity : "Opera",
				versionSearch : "Version"
			},
			{
				string : navigator.vendor,
				subString : "iCab",
				identity : "iCab"
			},
			{
				string : navigator.vendor,
				subString : "KDE",
				identity : "Konqueror"
			},
			{
				string : navigator.userAgent,
				subString : "Firefox",
				identity : "Firefox"
			},
			{
				string : navigator.vendor,
				subString : "Camino",
				identity : "Camino"
			},
			{		// for newer Netscapes (6+)
				string : navigator.userAgent,
				subString : "Netscape",
				identity : "Netscape"
			},
			{
				string : navigator.userAgent,
				subString : "MSIE",
				identity : "IE",
				versionSearch : "MSIE"
			},
			{
				string : navigator.userAgent,
				subString : "Gecko",
				identity : "Mozilla",
				versionSearch : "rv"
			},
			{ 		// for older Netscapes (4-)
				string : navigator.userAgent,
				subString : "Mozilla",
				identity : "Netscape",
				versionSearch : "Mozilla"
			}
		],
		dataOS : [
			{
				string : navigator.platform,
				subString : "Win",
				identity : "Windows"
			},
			{
				string : navigator.platform,
				subString : "Mac",
				identity : "Mac"
			},
			{
				string : navigator.userAgent,
				subString : "iPhone",
				identity : "iPhone/iPod"
			},
			{
				string : navigator.platform,
				subString : "Linux",
				identity : "Linux"
			}
		]

	};
	BrowserDetect.init();
	window['browser'] = {info : BrowserDetect.browser + ' ' + BrowserDetect.version + ' (' + BrowserDetect.OS + ')', OS : BrowserDetect.OS, browser : BrowserDetect.browser, version : BrowserDetect.version};
	window.browser['is' + BrowserDetect.OS] = true;
	window.browser['is' + BrowserDetect.browser] = true;
	window.browser['is' + BrowserDetect.browser + BrowserDetect.version] = true;
})();

