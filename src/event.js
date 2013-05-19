"use strict";

var eventHandlers = {};
/**
 *
 * @param event eventname
 * @param fn callback
 * @param scope scope to bind to .. defaults to window
 */
AdServ.on = function (event, fn, scope) {
	var bound = function () {};
	// initialze if first
	eventHandlers[event] = (eventHandlers[event] === undefined) ? [] : eventHandlers[event];
	// bind if obj provided
	scope = (typeof scope === "object") ? scope : window;

	bound = function (args) {
		return fn.apply(scope, Array.prototype.slice.call(args, 1));
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