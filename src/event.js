"use strict";

var eventHandlers = {};

/**
*
* @param event eventname
* @param fn callback
* @param context scope to bind to .. defaults to window
*/
var on = function (event, fn, context) { 
	// initialze if first
	eventHandlers[event] = (eventHandlers[event] === undefined) ? [] : eventHandlers[event];

	eventHandlers[event].push(function (args) {
		return fn.apply(context || window, args);
	}); 
};

AdServ.on = on;
  

/**
* @param event name of event
*/
var emit = function (event) {
	if (eventHandlers[event] !== undefined) {
		var args = Array.prototype.slice.call(arguments, 1);
		for (var i = 0; i < eventHandlers[event].length; i++) {
			eventHandlers[event][i](args);
		}
	} 
};

AdServ.emit = emit;
// 
var originalResize = window.onresize || noop;
window.onresize = function() {
	//console.log('Adserv.emit : resize'); 
	emit('resize');
	originalResize();
} ;