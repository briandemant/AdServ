"use strict";
// Protect against missing console.log
AdServ.log_messages = [];
function safe_log(kind) {
	return function(msg) {
		try {
			AdServ.log_messages.push(kind + ":" + JSON.stringify(msg));
		} catch (e) {
			AdServ.log_messages.push(kind + ":" + msg);
		}
	};
}

var ie = false;
(function(ua) {
	var result;
	if (result = /msie\s*(\d+)/.exec(ua)) {
		ie = {
			version : parseInt(result[1])
		}
	} else if (result = /trident\/\s*(\d+)/.exec(ua)) {
		ie = {
			version : parseInt(result[1]) + 4
		}
	}
	if (ie) {
		var jscript = 0 /*@cc_on + @_jscript_version @*/;
		ie.supported = (jscript >= 5.8 || ie.version > 10);
		ie.emulated = (
		( ie.version == 7 && jscript != 5.7) ||
		( ie.version == 8 && jscript != 5.8) ||
		( ie.version == 9 && jscript != 5.9) ||
		( ie.version == 10 && jscript != 10)
		);
	}
})(navigator.userAgent.toLowerCase());

AdServ.ie = ie;

if (typeof window.console !== 'undefined') {
	var console = window.console;
} else {
	console = {};
}
console.log = console.log || safe_log("log");
console.debug = console.debug || safe_log("debug");
console.error = console.error || safe_log("error");
console.warn = console.warn || safe_log("warn");
 
// Protect against missing globals
window.adServingLoad = window.adServingLoad || '';

// TODO: test todo
if (!Date.now) {
	Date.now = function now() {
		return +new Date();
	};
}