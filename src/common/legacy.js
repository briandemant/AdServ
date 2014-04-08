"use strict";

// Protect against missing console.log
var console = window.console;

if (!console) {
	console = {};
	console.log = console.error = function() {};
}

// Protect against missing globals
window.adServingLoad = window.adServingLoad || '';

if (!Date.now) {
	Date.now = function now() {
		return +new Date();
	};
}