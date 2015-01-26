"use strict";


function getContext(adspace, contexts) {
	var ctxName = adspace.context || '_GLOBAL_';
	adspace.context = contexts[ctxName] = contexts[ctxName] || {
		name : ctxName,
		ids : [],
		exceptExcludedIds : [],
		adspaces : [],
		keyword :    adspace.keyword || AdServ.keyword,
		searchword : adspace.searchword || AdServ.searchword,
		adServingLoad : adspace.context ? '' : adServingLoad
	};

	if (adspace.adServingLoad) {
		adspace.context.adServingLoad += adspace.adServingLoad;
	}

	if (!AdServ.keyword) {
		AdServ.keyword = adspace.keyword;
	}
}


function addLegacyGlobals(conf) {
	if (!isArray(conf['adspaces'])) {
		var global = window['ba_adspaces'];
		if (!global || len(global) === 0 || global.added) {
			conf['adspaces'] = []
		} else {
			global.added = true;
			conf['adspaces'] = global;
		}
	}

	if (!conf['wallpaper']) {
		var global = window['ba_wallpaper'];
		console.debug("global wallpaper", global);

		if (!global || len(global) === 0 || global.added) {
//			console.warn('no wallpaper');
		} else {
			global.added = true;
			conf['wallpaper'] = global;
			conf['wallpaper'].target = conf['wallpaper'].target
			                           || conf['wallpaper'].wallpaperTarget
			                           || conf['wallpaperTarget'] || document.body;
			delete conf['wallpaper'].wallpaperTarget;
		}
	}
	if (!conf['floating']) {
		var global = window['ba_floating'];
		if (!global || len(global) === 0 || global.added) {
//			console.warn('no wallpaper');
		} else {
			global.added = true;
			conf['floating'] = global;
		}
	}
}
var prepareContexts = function(args) {
	set('baseUrl', '', args);
	set('keyword', '', args);
	set('searchword', '', args);
	set('responsive', AdServ.responsive, args);

	var conf = {
		baseUrl : AdServ.baseUrl,
		responsive : AdServ.responsive,
		xhrTimeout : 5000,
		guid : guid("guid")
	};

	for (var index = 0; index < len(args); index++) {
		var arg = args[index];
		if (isFunction(arg)) {
			conf.ondone = arg;
		} else if (isObject(arg) && arg.id && !(arg.adspaces || arg.wallpaper || arg.floating )) {
			// single adspace expected
			conf.adspaces = (conf.adspaces || []).concat(arg);
		} else if (isObject(arg)) {
			// full conf expected
			conf = mix(conf, arg);
		} else if (isArray(arg)) {
			conf['adspaces'] = arg;
		}
	}

	addLegacyGlobals(conf);

	// support legacy and use document.body as default target  
	conf['wallpaperTarget'] = conf['wallpaperTarget'] || (conf['wallpaper'] && conf['wallpaper'].target) || document.body;


	var contexts = conf.contexts = {};
	var adspaces = conf.adspaces;


	for (index = 0; index < len(adspaces); index++) {

		var adspace = adspaces[index];
		console.log("adspace", adspace);
		if (adspace.id > 0) {
			if (exclude(adspace, conf)) {
				console.warn("SKIP", adspace);
				continue;
			}
			getContext(adspace, contexts);
			adspace.context.ids.push(adspace.id);
			adspace.context.adspaces.push(adspace);

		} else {
			// console.error('no id', adspace);
		}
	}

	if (conf['wallpaper']) {
		var adspace = conf['wallpaper'];
		adspace.isWallpaper = true;

		conf['wallpaper'].target = conf['wallpaper'].target || conf['wallpaperTarget'];

		if (adspace.id > 0) {
			if (!exclude(adspace, conf)) {
				getContext(adspace, contexts);
				adspace.context.wallpaper = adspace;
				adspace.context.adspaces.push(adspace);
			} else {
				console.warn("SKIP WALLPAPER", adspace);
				delete conf['wallpaper'];
			}
		} else {
			// console.error('no id', adspace);
		}
	}

	if (conf['floating']) {
		var adspace = conf['floating'];
		if (adspace.id > 0) {
			if (!exclude(adspace, conf)) {
				getContext(adspace, contexts);
				adspace.context.floating = adspace;
				adspace.context.adspaces.push(adspace);
			} else {
				console.warn("SKIP FLOATING", adspace);
				delete conf['floating'];
			}
		} else {
			// console.error('no id', adspace);
		}
	}


	if (conf['adspaces'].length == 0 && !conf['wallpaper'] && !conf['floating']) {
		console.error('no adspaces or wallpaper provided');
	}

	return conf;
};