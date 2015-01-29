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
	if (event && fn) { 
		eventHandlers[event] = eventHandlers[event] || [];

		if (event !== '*') {
			eventHandlers[event].push(function(args) {
				return fn.apply(context || window, args);
			});
		} else {
			eventHandlers[event].push(function(event, args) {
				args.unshift(event);
				return fn.apply(context || window, args);
			});
		}
	}
};

// ### AdServ.once
// Register a listener on an event (but only first time) 
//`
// **params:** 
//
//  * **event** eventname
//  * **fn** callback
//  * **context** *optional* scope to bind to .. defaults to window
var once = AdServ.once = function(event, fn, context) {
	on(event, function() {
		fn.apply(context, arguments);
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
	//console.log(event, slice.call(arguments, 1));

	if (typeof eventHandlers[event] !== undefined) {
		var args = slice.call(arguments, 1);
		for (var i = 0; i < len(eventHandlers[event]); i++) {
			eventHandlers[event][i](args);
		}
	}
	if (typeof eventHandlers['*'] !== undefined) {
		var args = slice.call(arguments, 1);
		for (var i = 0; i < len(eventHandlers['*']); i++) {
			eventHandlers['*'][i](event, args);
		}
	}
};


var bind = AdServ.bind = function(elem, type, handler) {
	if (elem[addEventListener]) {
		elem[addEventListener](type, handler, false);
	} else {
		// can't use elem[attachEvent]("on" + type, handler);
		elem.attachEvent("on" + type, handler);
	}
};
var unbind = AdServ.unbind = function(elem, type, handler) {
	if (elem[addEventListener]) {
		elem.removeEventListener(type, handler, false);
	} else {
		elem.detachEvent(type, handler);
	}
};

// Save original `onresize`
var originalResize = window['onresize'] || noop;

var emitResize = throttle(function() { 
	emit('page:resize', viewport());
}, 200);

// Register new wrapping `onresize`
window.onresize = function() {
	try {
		originalResize();
	} catch (e) {}
	emitResize();
};

// Emit load event when dom is loaded 

ready(function() { 
	emit('page:loaded');
}); 