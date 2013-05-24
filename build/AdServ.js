"use strict";
/*!
 * AdServ 0.0.7 2013-05-24 16:10:55
 * @author Brian Demant <brian.demantgmail.com> (2013)
 */
(function (window, definition) { 
	window.AdServ = definition(window, window.document); 
})(window,  function (window, document) { 
	var AdServ = window.AdServ || {};
	window.AdServ = AdServ; 
	// header ----------------------------------------------------------------------

	// Source: src/legacy.js
	// -----------------------------------------------------------------------------
	AdServ.adspaces = AdServ.adspaces || window.ba_adspaces || [];
	window.adServingLoad = window.adServingLoad || '';

	 



	// Source: src/event.js
	// -----------------------------------------------------------------------------
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



	// Source: src/json.js
	// -----------------------------------------------------------------------------
	var evil = function (s) {
		return (new Function("return (" + s + ")"))();
	};

	/**
	 * a minimal JSON parser .. based on json2 (https://github.com/douglascrockford/JSON-js)
	 *
	 * defaults to built in JSON.parse
	 */
	AdServ.parseJSON = (typeof JSON === 'object') ? JSON.parse : function (source) {
		source += "";
		if (source == '') {
			throw  "parseJSON failed";
		}
		// support for chinese?
	//	var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
	//	//cx.lastIndex = 0;
	//	if (cx.test(source)) {source = source.replace(cx, function (a) {return"\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)})}
		var simplified = source.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, "");
	 	if (/^[\],:{}\s]*$/.test(simplified)) {
			return evil(source);
		} 
		throw  "parseJSON failed";
	};

	// footer ----------------------------------------------------------------------
	return AdServ; 
});