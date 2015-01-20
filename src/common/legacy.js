"use strict"; 

// Protect against missing globals
window.adServingLoad = window.adServingLoad || '';

// TODO: test todo
if (!Date.now) {
	Date.now = function now() {
		return +new Date();
	};
}

function detectIEversion() {
	var ie = false;
	(function(ua) {
		var result;
		if (result = /msie\s*(\d+)/.exec(ua)) {
			ie = {
				version : parseInt(result[1])
			}
		} else if (result = /trident\/\s*(\d+)/.exec(ua)) {
			ie = {
				version : parseInt(result[1]) + 4
			}
		}
		// check if this is an fake/emulated ie
		if (ie) {
			var jscript = 0 /*@cc_on + @_jscript_version @*/;
			ie.supported = (jscript >= 5.8 || ie.version > 10);
			ie.emulated = (
			( ie.version == 7 && jscript != 5.7) ||
			( ie.version == 8 && jscript != 5.8) ||
			( ie.version == 9 && jscript != 5.9) ||
			( ie.version == 10 && jscript != 10)
			);
		}
	})(navigator.userAgent.toLowerCase());

	AdServ.ie = ie;
}
 