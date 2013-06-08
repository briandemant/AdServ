"use strict";

var eventHandlers = {};

/**
 *
 * @param event eventname
 * @param fn callback
 * @param context scope to bind to .. defaults to window
 */
var on = AdServ.on = function (event, fn, context) {
	// initialze if first
	eventHandlers[event] = (typeof eventHandlers[event] === 'undefined') ? [] : eventHandlers[event];

	eventHandlers[event].push(function (args) {
		return fn.apply(context || window, args);
	});
};


var once = AdServ.once = function (event, fn, context) {
	on(event, function () {
		fn();
		fn = noop;
	}, context);
};


/**
 * @param event name of event
 */
var emit = AdServ.emit = function (event) {
	if (typeof eventHandlers[event] !== 'undefined') {
		var args = slice.call(arguments, 1);
		for (var i = 0; i < len(eventHandlers[event]); i++) {
			eventHandlers[event][i](args);
		}
	}
};

// 
var originalResize = window['onresize'] || noop;
window.onresize = function () {
	try {
		originalResize();
	} catch (e) {}
	//console.log('Adserv.emit : resize'); 
	emit('resize');
};

ready(function () {
	emit('load');
}); 