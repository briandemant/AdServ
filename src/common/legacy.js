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


if (typeof window.console !== 'undefined') {
	var console = window.console;
} else {
	console = {};
}
console.log = console.log || safe_log("log");
console.debug = console.debug || safe_log("debug");;
console.error = console.error || safe_log("error");;
console.warn = console.warn || safe_log("warn");;

// Protect against missing globals
window.adServingLoad = window.adServingLoad || '';

// TODO: test todo
if (!Date.now) {
	Date.now = function now() {
		return +new Date();
	};
}