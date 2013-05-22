"use strict";

var eventHandlers = {};
/**
 *
 * @param elem
 * @param pseudo
 */
AdServ.getElem = function(elem) {
	return elem;
};

if (!window.getComputedStyle) {
	AdServ.getComputedStyle = function(el, pseudo) {
		this.el = AdServ.getElem(el);
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
	AdServ.getComputedStyle = window.getComputedStyle;
}
