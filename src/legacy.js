"use strict";

var console = window.console;

if (!console) {
	AdServ.history = [];
	console = {};
	console.log = function() {
		var msg = slice.call(arguments);
		if (len(msg) == 1) {
			msg = msg[0];
		}
		AdServ.history.push(msg);
	};

	console.error = function() {
		console.log.apply(null, arguments);
	};
}


window.adServingLoad = window.adServingLoad || '';