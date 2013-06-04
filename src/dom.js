"use strict";

var $ = AdServ.$ = function(selector, el) {
	if (isElement(selector)) {
		return selector;
	}
	if (!el) {el = document;}
	return el.querySelector(selector);
};

var $$ = AdServ.$$ = function(selector, el) {
	if (!el) {el = document;}
	return slice.call(el.querySelectorAll(selector));
};


var getComputedStyle;
if (!window.getComputedStyle) {
	getComputedStyle = function(el, pseudo) {
		this.el = $(el);
		this.getPropertyValue = function(prop) {
			var re = /(\-([a-z]){1})/g;
			if (prop == 'float') {
				prop = 'styleFloat';
			}
			if (re.test(prop)) {
				prop = prop.replace(re, function() {
					return arguments[2].toUpperCase();
				});
			}
			return el.currentStyle[prop] ? el.currentStyle[prop] : null;
		};
		return this;
	};
} else {
	getComputedStyle = window.getComputedStyle;
}

var css = AdServ.css = function(elem, name) {
	elem = $(elem);
	return getComputedStyle($(elem)).getPropertyValue(name);
};

var isVisible = AdServ.isVisible = function(elem) {
	elem = $(elem);
	if (!elem) {
		return false;
	}
	if (elem.nodeName === 'BODY') {
		return true;
	}
	if (css(elem, 'visibility') == 'hidden') {
		return false;
	}

	if (css(elem, 'display') == 'none') {
		return false;
	}
	if (css(elem, 'opacity') == '0') {
		return false;
	}
	return isVisible(elem.parentNode);
};
 
