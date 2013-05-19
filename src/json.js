"use strict";

var e = function (s) { return eval("(" + s + ")"); };

/**
 * a minimal JSON parser .. based on json2 (https://github.com/douglascrockford/JSON-js)
 *
 * defaults to built in JSON.parse
 */
AdServ.parseJSON = (typeof JSON === 'object') ? JSON.parse : function (source) {
	source += "";
	var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
	//cx.lastIndex = 0;
	if (cx.test(source)) {source = source.replace(cx, function (a) {return"\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)})}
	if (/^[\],:{}\s]*$/.test(source.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
		return e(source);
	}
	throw  "JSON.parse";
};