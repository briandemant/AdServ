var fs = require('fs');
var chai = require('chai');
require('colors');
var helpers = exports;
var toString = Object.prototype.toString;
var slice = Array.prototype.slice;
helpers.assert = chai.assert;


var prepareGlobals = function(globals) {
	if (typeof globals.notStrictEqual === 'function') {
		// only assert was given
		globals = {assert : globals};
	}

	var defaultGlobals = {
		alert : function(msg) {
			throw "alert called: " + msg;
		},
		console : {
			log : function(msg) {
				console.error("console.log  :".yellow, msg);
			}, error : function(msg) {
				console.error("console.error:".red, msg);
			}},
		window : {},
		JSON : {parse : function(msg) {
			throw "JSON.parse called: " + msg;
		}},
		AdServ : {},
		helpers : helpers,
		slice : slice,
		assert : helpers.assert
	};

	var name;
	var currentGlobals = {};


	for (name in defaultGlobals) {
		currentGlobals[name] = defaultGlobals[name];
	}
	for (name in globals) {
		currentGlobals[name] = globals[name];
	}


	var names = [];
	var values = [];

	for (name in currentGlobals) {
		names.push(name);
		values.push(currentGlobals[name]);
	}

	return {names : names, values : values};
};

helpers.noop = function() {};

helpers.createElement = function(name, parent, style) {
	parent = parent || {};
	style = style || {};
	parent["elems"] = parent["elems"] || {};
	return parent.elems[name] = {
		nodeName : name == "document" ? "BODY" : name,
		parentNode : parent,
		elems : {},
		currentStyle : style,
		querySelector : function(key) {
			return this.elems[key];
		},
		querySelectorAll : function(key) {
			var result = [];
			var rx = new RegExp(key);
			// id's doubles as classes .. we don't really care about selectors 
			for (name in this.elems) {
				if (name.match(rx)) {
					result.push(this.elems[name]);
				}
				// we could get recursive here .. but we really don't need it
			}
			return result;
		},
		createElement : function(key, style) {
			return helpers.createElement(key, this, style);
		},
		createElements : function() {
			for (var i = 0; i < arguments.length; i++) {
				var key = arguments[i];
				helpers.createElement(key, this);
			}
			return this;
		}
	}
};

helpers.run = function(file, globals, beforeFn, afterFn) {

	var source = fs.readFileSync(file, "utf8");
	var before = "";
	var after = "";
	if (afterFn != void 0) {
		before += beforeFn.toString().replace(/^[^\{]*\{/, "").replace(/\}[^\}]*$/, "");
		after += ";" + afterFn.toString().replace(/^[^\{]*\{/, "").replace(/\}[^\}]*$/, "");
	} else {
		before += beforeFn.toString().replace(/^[^\{]*\{/, "").replace(/\}[^\}]*$/, "");
	}

	var prepared = prepareGlobals(globals);
	return (new Function(prepared.names, before + source + after)).apply({}, prepared.values);
};
 