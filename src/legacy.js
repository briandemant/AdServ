AdServ.adspaces = AdServ.adspaces || window.ba_adspaces || [];
window.adServingLoad = window.adServingLoad || '';

var isFunction = function(fn) {
	return fn && typeof fn === "function";
};
var isObject = function(obj) {
	return obj && typeof obj === "object";
};
var isArray= function(obj) {
	return obj && obj.toString() === "[object Array]";
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
 