"use strict"; 
var evil = function(s) {
	return (new Function("return (" + s + ")"))();
};

/**
 * a minimal JSON parser .. based on json2 (https://github.com/douglascrockford/JSON-js)
 *
 * defaults to built in JSON.parse
 */
var parseJSON = typeof JSON === 'object' ? JSON.parse : function(source) {
	source += "";
	if (source != '') {

		// support for chinese?
		//	var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
		//	//cx.lastIndex = 0;
		//	if (cx.test(source)) {source = source.replace(cx, function (a) {return"\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)})}
		var simplified = source
			.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@")
			.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]")
			.replace(/(?:^|:|,)(?:\s*\[)+/g, "");
		if (/^[\],:{}\s]*$/.test(simplified)) {
			return evil(source);
		}
	}
	throw  "parseJSON failed";
};