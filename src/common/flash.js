// This part is based on **SWFObject v1.4** 
//
//  Flash Player detection and embed - http://blog.deconcept.com/swfobject/
// 
//  SWFObject is (c) 2006 Geoff Stearns and is released under the MIT License:
//  http://www.opensource.org/licenses/mit-license.php
// 
//  SWFObject is the SWF embed script formarly known as FlashObject. The name was changed for legal reasons.
"use strict";
var playerVersion;
// ### getPlayerVersion 
//
// **returns:** installed version of  flash
//
function getPlayerVersion() {
	if (activeX) {
		try {
			var atx = new activeX('ShockwaveFlash.ShockwaveFlash');
			if (atx) {
				var version = atx.GetVariable('$version').substring(4);
				return parseFloat(version.replace(',', '.'));
			}
		} catch (e) {
		}
	} else {
		var plugin = window.navigator.plugins["Shockwave Flash"];
		if (plugin && plugin.description) {
			return parseFloat(plugin.description.match(/(\d+)\.(\d+)/)[0]);
		}
	}
	return "0";
}

playerVersion = getPlayerVersion();

var isFlashSupported = AdServ.flash = playerVersion >= 6 ? playerVersion : false;

// ### _Constructor:_ Flash 
//
// **creates:** an Object used to embed flash
//
var Flash = function(url, id, width, height) {
	this.params = {quality : 'best'};
	this.vars = {quality : 'best'};
	this.attrs = {
		swf : url,
		id : id,
		w : width,
		h : height
	};
};

Flash.prototype = {
	// ### _flash_.addParam
	//
	// add a parameter to the embeded html 
	//
	addParam : function(key, value) {
		this.params[key] = value;
	},

	// ### _flash_.addVariable
	//
	// add a variable to the query string
	//
	addVariable : function(key, value) {
		this.vars[key] = value;
	},

	// ### _flash_.getVars
	//
	// generates a query string from provided values
	//
	// **returns:** query string
	//
	getVars : function() {
		var queryString = [];
		var key;
		for (key in this.vars) {
			queryString.push(key + "=" + this.vars[key]);
		}
		return queryString;
	},

	// ### _flash_.getSWFHTML
	//
	// generates html embed code for all browsers
	//
	// **returns:** html code
	//
	getSWFHTML : function() {
		var html;
		var params = this.params;
		var attrs = this.attrs;
		var vars = this.getVars().join("&");
		var common = ' width="' + attrs["w"] + '" height="' + attrs["h"] + '" id="' + attrs["id"] + '" name="' + attrs["id"] + '"';

		if (activeX) {
			html = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + common
			       + '><param name="movie" value="' + attrs["swf"] + '" />';

			for (key in params) {
				html += '<param name="' + key + '" value="' + params[key] + '" />';
			}

			if (len(vars) > 0) {
				html += '<param name="flashvars" value="' + vars + '" />';
			}
			html += '</object>';
		} else {
			html = '<embed type="application/x-shockwave-flash" src="' + attrs["swf"] + '"' + common;
			for (var key in params) {
				html += key + '="' + params[key] + '" ';
			}

			html += 'flashvars="' + vars + '"/>';
		}
		return html;
	},

	// ### _flash_.write
	//
	// Writes the embed html into the provided target
	//
	// **params:** 
	//
	//  * **target** id of the element to embed the flash file
	//
	// **returns:** true if flash is supported and the code was embedded
	//
	write : function(target) {
		if (isFlashSupported) {
			var elem = $ID(target);
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