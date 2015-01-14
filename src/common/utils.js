"use strict";


// Shortcuts to maximize minification 
var toString = Object.prototype.toString;
var slice = Array.prototype.slice;
var urlencode = encodeURIComponent;
var activeX = window.ActiveXObject;

/**
 * empty function which does nothing .. it is used for placeholding
 *
 * @method    noop
 * @private
 */
function noop() {}

function randhex(length) {
	return ((1 + Math.random()) * 0x100000000).toString(16).substr(1, length);
}

function count() {
	return guid.count.toString(16).substr(1, 4);
}

/**
 * Create a `GUID` to use when an unique id is needed
 *
 *
 * @method    guid
 * @private
 *
 * @return    {String}                     something like `ad_FF40_47A1_0102_F034`
 */
function guid() {


	guid.count++;
	if (!guid.date) {
		// 1128117600000 == +new Date("2005-10-01 00:00")
		guid.date = ((Date.now() - 1128117600000) / 1000 | 0).toString(16);
		guid.count = 0x10001;
		setTimeout(function() {
			guid.date = false;
		}, 1000);
	}
	var result = toArray(arguments);
	result.push(guid.date);
	result.push(count());
	result.push(randhex(8));
	return result.join("_");
}
AdServ.guid = guid;

function toArray(list) {
	return slice.call(list, 0);
}

/**
 * detects if item is a function
 *
 * @method    isFunction
 * @private
 *
 * @param     {mixed}  item
 *
 * @return    {Boolean}
 */
function isFunction(item) {
	return item && typeof item === "function";
}

/**
 * Detects if item is an object
 *
 * @method    isObject
 * @private
 *
 * @param     {mixed}  item
 *
 * @return    {Boolean}
 */
function isObject(item) {
	return item && typeof item === "object" && toString.call(item) === "[object Object]";
}

/**
 * Detects if item is an array
 *
 * @method    isArray
 * @private
 *
 * @param     {mixed}  item
 *
 * @return    {Boolean}
 */
function isArray(item) {
	return item && typeof item === "object" && toString.call(item) === "[object Array]";
}


/**
 * Detects if item is a string
 *
 * @method    isString
 * @private
 *
 * @param     {mixed}  item    the item to test
 *
 * @return    {Boolean}
 */
function isString(item) {
	return item && typeof item === "string";
}


/**
 * Detects if item is a string
 *
 * @method    isString
 * @private
 *
 * @param     {mixed}  item    the item to test
 *
 * @return    {Boolean}
 */
function isUndefined(item) {
	return item && typeof item === "undefined";
}


/**
 * Detects if item is a dom element
 *
 * @method    isElement
 * @private
 *
 * @param     {mixed}  item    the item to test
 *
 * @return    {Boolean}
 */
function isElement(item) {
	return item ? item.nodeType === 1 : false;
}


/**
 * Detects if item is a dom node
 *
 * @method    isNode
 * @private
 *
 * @param     {mixed}  item    the item to test
 *
 * @return    {Boolean}
 */
function isNode(item) {
	return item ? item.nodeType === 9 : false;
}

/**
 * Wrap a function and throttle the frequency, so that a given heavy
 * function will not destroy performance
 *
 * @method    throttle
 * @private
 *
 * @param     {Function}  fn    function to wrap
 * @param     {Function}  ms    minimum ms between calls to the fn
 */
function throttle(fn, ms) {
	var disabled = false;
	return function() {
		if (!disabled) {
			disabled = true;
			fn();
			setTimeout(function() {
				fn();
				disabled = false;
			}, ms);
		}
	};
}

/**
 * Shortcut to optimize minification
 *
 * @private
 * @method    len
 **/
function len(item) {
	return item.length;
}


/**
 * Mixing objects to a new combined object, **does not clone**
 *
 * @private
 * @method    mix
 *
 * @param     {Object}  defaults          default options
 * @param     {Object}  overrides         Overrides
 *
 * @return    {Object}                    a mix of the default and overrides
 *
 * @example
 *   mix({ fun : true },{});
 *   => { fun : true }
 *
 *
 *   mix({ fun : true },{ fun : false });
 *   => { fun : false }
 *
 *
 *   mix({ fun : true },{ dead : false });
 *   => { fun : true, dead : false }
 */
function mix(defaults, overrides) {
	var result = {};
	var k;
	for (k in defaults) {
		if (defaults.hasOwnProperty(k)) {
			result[k] = defaults[k];
		}
	}
	for (k in overrides) {
		if (overrides.hasOwnProperty(k)) {
			result[k] = overrides[k];
		}
	}
	return result;
}

/**
 * a version of eval which does not trip up minifying
 */
var evil = function(s) {
	return (new Function("return (" + s + ")"))();
};


/**
 * Parse query string or hash and get the value for the key, prefers search over hash
 *
 *
 * Note : **UNTESTET!**
 *
 * @private
 * @method    getRequestParameter
 *
 * @param     {String}   key                key in query or hash
 *
 * @return    {String}                     Value for the key (if any)
 *
 * @example
 *   getRequestParameter('foo');
 */
function getRequestParameter(key) {
	var qs = location.search + "&" + location.hash;
	if (len(qs) > 1) {
		var start = qs.indexOf(key + "=");
		if (start > -1) {
			var end = (qs.indexOf("&", start) > -1) ? qs.indexOf("&", start) : len(qs);
			return qs.substring(qs.indexOf("=", start) + 1, end);
		}
	}
}

function isSupportedBrowser() {
	return   ( ('addEventListener' in window || 'attachEvent' in window)
	           && ('querySelector' in document && 'querySelectorAll' in document)
	           && ('JSON' in window && 'stringify' in JSON && 'parse' in JSON)
	           && ('postMessage' in window)
	);
}
AdServ.isSupportedBrowser = isSupportedBrowser;

function set(name, def, args) {
	AdServ[name] = (isObject(args[0]) && args[0][name]) || AdServ[name] || def;
}


function exclude(adspace, conf) {
	//console.debug('ex', adspace.id, adspace.excludeOnWallpaper);
	if (adspace.excludeOnWallpaper || adspace.isWallpaper) {  
		if (AdServ.hasWallpaperChanged(conf['wallpaperTarget'], conf.originalWallpaper)) {
			//console.debug('wallpaper excluded', adspace);
			return true;
		}
	}
}


function logCampaign(ctx, campaign) {
	var info = 'Adspace';
	if (ctx.name == '_GLOBAL_') {
		info += ': ';
	} else {
		info += '(' + ctx.name + '): ';
	}

	if (campaign.type != 'undefined') {
		console.info(info + campaign.adspace + " " + campaign.type + ( campaign.iframe ? "" : " in iframe"), campaign.elem);
	} else {
		console.info(info + campaign.adspace + " is EMPTY", campaign.elem);
	}
	return info;
}