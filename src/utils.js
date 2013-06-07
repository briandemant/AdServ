"use strict";

// shortcuts 
var toString = Object.prototype.toString;
var slice = Array.prototype.slice;
var urlencode = encodeURIComponent; 
var location = document.location;
 
var noop = function() {};

// detectors
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

//tools
var guid = AdServ.guid = function() {
	var guidPart = function() {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	};
	return  'ad_' + guidPart() + "_" + guidPart() + "_" + guidPart() + "_" + guidPart();
};

var getRequestParameter = function(key) {

	var qs = location.search || location.hash;
	if (len(qs) > 1) {
		var start = qs.indexOf(key + "=");
		if (start > -1) {
			var end = (qs.indexOf("&", start) > -1) ? qs.indexOf("&", start) : len(qs);
			return qs.substring(qs.indexOf("=", start) + 1, end);
		}
	}
	return "";
};


var len = function(item) {
	return item.length;
};


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


