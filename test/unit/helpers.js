var fs = require('fs');
var chai = require('chai');
var path = require('path');
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

	var fakeConsole = {
		log : function(msg) {
			var args = [].splice.apply(arguments, [0]);
			args.unshift("console.log  :".green);
			console.error.apply(console, args);
		},
		debug : function(msg) {
			var args = [].splice.apply(arguments, [0]);
			args.unshift("console.error:".yellow);
			console.error.apply(console, args);
		},
		warn : function(msg) {
			var args = [].splice.apply(arguments, [0]);
			args.unshift("console.error:".blue);
			console.error.apply(console, args);
		},
		error : function(msg) {
			var args = [].splice.apply(arguments, [0]);
			args.unshift("console.error:".red);
			console.error.apply(console, args);
		}
	};

	var defaultGlobals = {
		alert : function(msg) {
			throw "alert called: " + msg;
		},
		console : fakeConsole,
		window : {console : fakeConsole},
		document : {},
		JSON : {
			parse : function(msg) {
				throw "JSON.parse called: " + msg;
			}
		},
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
		getElementById : function(key) {
			return this.elems["#" + key];
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
	var source = fs.readFileSync(path.join(__dirname, "../../", file), "utf8");
	var before = "";
	var after = "";
	if (afterFn != void 0) {
		before += beforeFn.toString().replace(/^[^\{]*\{/, "").replace(/\}[^\}]*$/, "");
		after += ";" + afterFn.toString().replace(/^[^\{]*\{/, "").replace(/\}[^\}]*$/, "");
	} else {
		before += beforeFn.toString().replace(/^[^\{]*\{/, "").replace(/\}[^\}]*$/, "");
	}

	var prepared = prepareGlobals(globals);

	var value = (new Function(prepared.names, before + source + after)).apply({}, prepared.values);
	return value;
};
 