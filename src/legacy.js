"use strict";

var console = window.console;

if (!console) {
	console = {};
	console.log = console.error = function() {};
}
//console.log("using debug version");


window.adServingLoad = window.adServingLoad || '';