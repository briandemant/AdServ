var toString = Object.prototype.toString

var isFunction = function(fn) {
	return fn && typeof fn === "function";
};

var isObject = function(obj) {
	return obj && typeof obj === "object" && toString.call(obj) === "[object Object]";
};

var isArray = function(obj) {
	return obj && typeof obj === "object" && toString.call(obj) === "[object Array]";
};
var isString = function(str) {
	return str && typeof str === "string";
};
var isUndefined = function(obj) {
	return obj && typeof obj === "undefined";
};
var isElement = function(value) {
	return value ? value.nodeType === 1 : false;
};
var isNode = function(value) {
	return value ? value.nodeType === 9 : false;
};

var noop = function() {};

var slice = Array.prototype.slice;

var guid = AdServ.guid = function() {
	var guidPart = function() {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	};
	return  'ad_' + guidPart() + "_" + guidPart() + "_" + guidPart() + "_" + guidPart();
};

var urlencode = encodeURIComponent;

var mix = function(defaults, source) {
	var result = {};
	var k;
	for (k in defaults) {
		if (defaults.hasOwnProperty(k)) {
			result[k] = defaults[k];
		}
	}
	for (k in source) {
		if (source.hasOwnProperty(k)) {
			result[k] = source[k];
		}
	}
	return result;
};

var console = window.console;

if (!console) {
	AdServ.history = [];
	console = {};
	console.log = function() {
		var msg = slice.call(arguments);
		if (msg.length == 1) {
			msg = msg[0];
		}
		AdServ.history.push(msg);
	};

	console.error = function() {
		console.log.apply(null, arguments);
	};
}


window.adServingLoad = window.adServingLoad || '';