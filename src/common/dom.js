"use strict";

var $ID = AdServ.$ID = function(target) {
	if (isElement(target)) {
		return target;
	}
	return document.getElementById(target);
}
 
// Shortcut for querySelector  
var $ = AdServ.$ = function(selector, parent) {
	// Returns elem directly if selector is an element 
	if (isElement(selector)) {
		return selector;
	}

	// Defaults to search from document if parent is not provided
	if (!parent) {parent = document;}

	return parent.querySelector(selector);
};

// Shortcut for querySelectorAll
var $$ = AdServ.$$ = function(selector, parent) {
	// Defaults to search from document if parent is not provided
	if (!parent) {parent = document;}

	return slice.call(parent.querySelectorAll(selector));
}; 

// Shim for getComputedStyle used by `AdServ.css`
var getComputedStyle;
if (!window.getComputedStyle) {
	getComputedStyle = function getComputedStyleShim(el, pseudo) {
		var style = {};
		style.el = el;
		style.getPropertyValue = function getPropertyValueShim(prop) {
			var re = /(\-([a-z]){1})/g;
			if (prop == 'float') {
				prop = 'styleFloat';
			}
			if (re.test(prop)) {
				prop = prop.replace(re, function() {
					return arguments[2].toUpperCase();
				});
			} 
			return style.el.currentStyle[prop] ? style.el.currentStyle[prop] : null;
		};
		return style;
	};
} else {
	getComputedStyle = window.getComputedStyle;
}

// get css property for an element
var css = AdServ.css = function(elemOrSelector, name) {
	// Ensure element is an element and not a selector
	var elem = $ID(elemOrSelector);
	if (!elem) {
		return null;
	}
	return getComputedStyle($(elem)).getPropertyValue(name);
};

// Test if an element is *visible* (searches up the tree until BODY is reached)
var isVisible = AdServ.isVisible = function(elemOrSelector) {
	var elem = $ID(elemOrSelector);
	if (!elem) {
		return false;
	}
	// Body must be visible (anything else would be silly)
	if (elem.nodeName === 'BODY') {
		return true;
	}

	// Is it hidden from sight?
	if (css(elem, 'visibility') == 'hidden') {
		return false;
	}

	// Is it displayed?
	if (css(elem, 'display') == 'none') {
		return false;
	}

	// Is it transparent?
	if (css(elem, 'opacity') == '0') {
		return false;
	}

	// Look up the tree
	return isVisible(elem.parentNode);
};
 
