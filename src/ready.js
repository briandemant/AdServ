"use strict";
 
/**
 * basic onload wrapper
 *
 * https://github.com/ded/domready
 * domready (c) Dustin Diaz 2012 - License MIT
 *
 * @param callback
 */ 
AdServ.ready = (function (ready) {
	var fns = [], fn, f = false 
			, testEl = document.documentElement
			, hack = testEl.doScroll
			, domContentLoaded = 'DOMContentLoaded'
			, addEventListener = 'addEventListener'
			, onreadystatechange = 'onreadystatechange'
			, readyState = 'readyState'
			, loaded = /^loade|c/.test(document[readyState]);

	function flush(f) {
		loaded = 1;
		while (f = fns.shift()) {
			f()
		}
	}

	document[addEventListener] && document[addEventListener](domContentLoaded, fn = function () {
		document.removeEventListener(domContentLoaded, fn, f)
		flush();
	}, f);
 
	hack && document.attachEvent(onreadystatechange, fn = function () {
		if (/^c/.test(document[readyState])) {
			document.detachEvent(onreadystatechange, fn);
			flush();
		}
	});

	return (ready = hack ?
	                function (fn) {
		                self != top ?
		                loaded ? fn() : fns.push(fn) :
		                function () {
			                try {
				                testEl.doScroll('left')
			                } catch (e) {
				                return setTimeout(function () { ready(fn) }, 50)
			                }
			                fn()
		                }()
	                } :
	                function (fn) {
		                loaded ? fn() : fns.push(fn)
	                })
})();