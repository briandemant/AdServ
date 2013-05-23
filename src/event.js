"use strict";

var eventHandlers = {};

/**
*
* @param event eventname
* @param fn callback
* @param context scope to bind to .. defaults to window
*/
AdServ.on = function (event, fn, context) { 
	// initialze if first
	eventHandlers[event] = (eventHandlers[event] === undefined) ? [] : eventHandlers[event];

	eventHandlers[event].push(function (args) {
		return fn.apply(context || window, args);
	}); 
};
  

/**
* @param event name of event
*/
AdServ.emit = function (event) {
	if (eventHandlers[event] !== undefined) {
		var args = Array.prototype.slice.call(arguments, 1);
		for (var i = 0; i < eventHandlers[event].length; i++) {
			eventHandlers[event][i](args);
		}
	} 
};