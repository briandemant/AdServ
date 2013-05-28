"use strict";


var getElem = function(query) {
	if (isElement(query)) {
		return query;
	}
	var kind = query.charAt(0);
	return (kind === '#') ? document.getElementById(query.substr(1)) : null;
};
AdServ.$ = getElem;

var getComputedStyle;
if (!window.getComputedStyle) {
	getComputedStyle = function(el, pseudo) {
		this.el = getElem(el);
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

var css = function(elem, name) {
	elem = getElem(elem);
	return getComputedStyle(getElem(elem)).getPropertyValue(name);
};

AdServ.css = css;

var isVisible = function(elem) {
	elem = getElem(elem);
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

AdServ.isVisible = isVisible;
