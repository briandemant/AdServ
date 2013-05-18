"use strict";
/*!
 * AdServ 0.0.1 - Brian Demant <brian.demantgmail.com> (2013)
 */
(function (scope, definition) {
	// export as node module for testing purposes
	if (typeof module != 'undefined') {
		module.exports = definition
	} else {
		scope['AdServ'] = definition(scope);
	}
})(this, function (scope) {
	var AdServ = scope['AdServ'] || {};
	scope['AdServ'] = AdServ;
	// Source: src/ajax.js
	AdServ.getJSON = function (url) {
		console.log(url); 
	};


	// Source: src/event.js
	AdServ.on = function (name, fn) {
	
	};
	
	AdServ.emit = function () {
	
	};

	return AdServ;
});