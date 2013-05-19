"use strict";

var eventHandlers = {};
/**
 *
 * @param event eventname
 * @param fn callback
 * @param context scope to bind to .. defaults to window
 */
AdServ.on = function (event, fn, context) {
	var bound = function () {};
	// initialze if first
	eventHandlers[event] = (eventHandlers[event] === undefined) ? [] : eventHandlers[event];
	// bind if obj provided
	context = (typeof context === "object") ? context : scope;

	bound = function (args) {
		return fn.apply(context, Array.prototype.slice.call(args, 1));
	};

	eventHandlers[event].push(bound);
};


/**
 * @param event eventname
 */
AdServ.emit = function (event) {
	if (eventHandlers[event] !== undefined) {
		for (var i = 0; i < eventHandlers[event].length; i++) {
			eventHandlers[event][i](arguments);
		}
	}
};