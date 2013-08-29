"use strict";

var eventHandlers = {};
 
// ### AdServ.on
// Register a listener on an event
//
// **params:** 
//
//  * **event** eventname
//  * **fn** callback
//  * **context** *optional* scope to bind to .. defaults to window
var on = AdServ.on = function(event, fn, context) { 
	eventHandlers[event] = (typeof eventHandlers[event] === 'undefined') ? [] : eventHandlers[event];

	eventHandlers[event].push(function(args) {
		return fn.apply(context || window, args);
	});
};
 
// ### AdServ.once
// Register a listener on an event (but only first time) 
//
// **params:** 
//
//  * **event** eventname
//  * **fn** callback
//  * **context** *optional* scope to bind to .. defaults to window
var once = AdServ.once = function(event, fn, context) {
	on(event, function() {
		fn();
		fn = noop;
	}, context);
};

// ## AdServ.emit
// Emit (trigger) an event
//
// **params:** 
//
//  * **event** eventname 
//  * **arguments** *optional* all other arguments are passed on to the callback
var emit = AdServ.emit = function(event) {
	if (typeof eventHandlers[event] !== 'undefined') {
		var args = slice.call(arguments, 1);
		for (var i = 0; i < len(eventHandlers[event]); i++) {
			eventHandlers[event][i](args);
		}
	}
};


// ----

// Save original `onresize`
var originalResize = window['onresize'] || noop;

// Register new wrapping `onresize`
window.onresize = function() {
	try {
		originalResize();
	} catch (e) {} 
	emit('resize');
};

// Emit load event when dom is loaded
ready(function() {
	emit('load');
}); 