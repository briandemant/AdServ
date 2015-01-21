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


AdServ.hasWallpaperChanged = function(target, original) {
	if (typeof AdServ.hasWallpaperChanged.changed == undefined) {
		var wallpaper = AdServ.css(target, 'background-image');
		if (typeof original == undefined && wallpaper == 'none') {
			AdServ.hasWallpaperChanged.changed = false;
		} else {
			var regExp = new RegExp(original + '\\)$');
			AdServ.hasWallpaperChanged.changed = !regExp.test(wallpaper);
		}

		//console.debug('target', target);
		//console.debug('original', original);
		//console.debug('wallpaper', wallpaper);

		if (!AdServ.hasWallpaperChanged.changed) {
			// hardcode support for providers
			var htmlEl = document.body.parentNode;
			if (htmlEl) {
				if (htmlEl.className.match('adform-wallpaper')) {
					console.debug('html.adform-wallpaper-xxxx DETECTED');
					AdServ.hasWallpaperChanged.changed = true;
				}
			}
			// could maybe also be used
			//console.debug(document.getElementById('adform-wallpaper-left'));
			//console.debug(document.getElementById('adform-wallpaper-right'));

		}
		if (AdServ.hasWallpaperChanged.changed) {
			var classes = document.body.getAttribute('class');
			document.body.setAttribute('class', (classes || '') + ' adserving_wallpaper_loaded');
			emit('wallpaper:loaded', {skin : true});
		}
	}
	//console.debug('changed', AdServ.hasWallpaperChanged.changed);
	return AdServ.hasWallpaperChanged.changed;
};

function viewport() {
	var e = window;
	var a = 'inner';
	if (!('innerWidth' in window)) {
		a = 'client';
		e = document.documentElement || document.body;
	}
	return {width : e[a + 'Width'], height : e[a + 'Height']}
}
 
