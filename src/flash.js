/**
 * SWFObject v1.4: Flash Player detection and embed - http://blog.deconcept.com/swfobject/
 *
 * SWFObject is (c) 2006 Geoff Stearns and is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * **SWFObject is the SWF embed script formarly known as FlashObject. The name was changed for
 *   legal reasons.
 */
"use strict";

var activeX = window.ActiveXObject;

var playerVersion;

if (activeX) {
	try {
		var atx = new activeX('ShockwaveFlash.ShockwaveFlash');
		if (atx) {
			var version = atx.GetVariable('$version').substring(4);
			playerVersion = (version.replace(',', '.'));
		}
	} catch (e) {
	}
} else {
	var plugin = window.navigator.plugins["Shockwave Flash"];
	if (plugin && plugin.description) {
		playerVersion = (plugin.description.match(/(\d+)\.(\d+)/)[0]);
	}
}

var isFlashSupported = AdServ.flash = playerVersion >= 6 ? playerVersion : false;

var Flash = function(url, id, width, height) {
	this.params = {quality : 'best'};
	this.vars = {quality : 'best'};
	this.attrs = {
		swf : url,
		id : guid(),
		w : width,
		h : height
	};
};

Flash.prototype = {
	addParam : function(key, value) {
		this.params[key] = value;
	},
	addVariable : function(key, value) {
		this.vars[key] = value;
	},
	getVars : function() {
		var queryString = [];
		var key;
		for (key in this.vars) {
			//noinspection JSUnfilteredForInLoop
			queryString.push(key + "=" + this.vars[key]);
		}
		return queryString;
	},
	getSWFHTML : function() {
		var html;
		var params = this.params;
		var attrs = this.attrs;
		var vars = this.getVars().join("&");
		var common = ' width="' + attrs["w"] + '" height="' + attrs["h"] + '" id="' + attrs["id"] + '" name="flashfile"';

		if (activeX) {
			html = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + common
				       + '><param name="movie" value="' + attrs["swf"] + '" />';

			for (key in params) {
				//noinspection JSUnfilteredForInLoop
				html += '<param name="' + key + '" value="' + params[key] + '" />';
			}

			if (len(vars) > 0) {
				html += '<param name="flashvars" value="' + vars + '" />';
			}
			html += '</object>';
		} else {
			html = '<embed type="application/x-shockwave-flash" src="' + attrs["swf"] + '"' + common;
			for (var key in params) {
				//noinspection JSUnfilteredForInLoop
				html += key + '="' + params[key] + '" ';
			}

			html += 'flashvars="' + vars + '"/>';
		}
		return html;
	},
	write : function(target) {
		if (isFlashSupported) {
			var elem = $("#" + target);
			if (elem) {
				elem.innerHTML = this.getSWFHTML();
				return true;
			}
		}
		return false;
	}
};

// legacy support 
window.baSWFObject = Flash;