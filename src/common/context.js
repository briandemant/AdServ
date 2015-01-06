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

function set(name, def, args) {
	AdServ[name] = (isObject(args[0]) && args[0][name]) || AdServ[name] || def;
}
var prepareContexts = function(args) {
	set('baseUrl', '', args);
	set('keyword', '', args);
	set('searchword', '', args);

	var conf = {baseUrl : AdServ.baseUrl, xhrTimeout : 5000, guid : guid("ad")};

	for (var index = 0; index < len(args); index++) {
		var arg = args[index];
		if (isFunction(arg)) {
			conf.ondone = arg;
		} else if (isObject(arg) && (!arg.adspaces || arg.id || arg.wallpaper || arg.floating )) {
			conf = mix(conf, arg);
		} else if (isObject(arg)) {
			conf = mix(conf, arg);
		} else if (isArray(arg)) {
			conf['adspaces'] = arg;
		}
	}

	if (!isArray(conf['adspaces'])) {
		var global = window['ba_adspaces'];
		if (!global || len(global) === 0 || global.added) {
			conf['adspaces'] = []
//			console.warn('adspaces empty');
		} else {
			global.added = true;
			conf['adspaces'] = global;
		}
	}

	if (!conf['wallpaper']) {
		var global = window['ba_wallpaper'];
		if (!global || len(global) === 0 || global.added) {
//			console.warn('no wallpaper');
		} else {
			global.added = true;
			conf['wallpaper'] = global;
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


	var contexts = conf.contexts = {};
	var adspaces = conf.adspaces;
	for (index = 0; index < len(adspaces); index++) {
		var adspace = adspaces[index];
		if (adspace.id > 0) {
			console.debug('--', adspace.excludeOnWallpaper);
			if (adspace.excludeOnWallpaper) {
				var target = conf['originalWallpaperTarget'] || conf['wallpaper'] && (conf['wallpaper'].target || conf['wallpaper'].wallpaperTarget) || document.body;
				console.debug('--',target);
				if (AdServ.hasWallpaperChanged(target, conf.originalWallpaper)) {
					console.debug('wallpaper excluded', adspace);
					continue;
				}
			}

			getContext(adspace, contexts);
			adspace.context.ids.push(adspace.id);
			adspace.context.adspaces.push(adspace);

		} else {
			// console.error('no id', adspace);
		}
	}
	if (conf['floating']) {
		var adspace = conf['floating'];
		if (adspace.id > 0) {
			getContext(adspace, contexts);
			adspace.context.floating = adspace;
			adspace.context.adspaces.push(adspace);
		} else {
			// console.error('no id', adspace);
		}
	}
	if (conf['wallpaper']) {
		var adspace = conf['wallpaper'];
		if (adspace.id > 0) {
			getContext(adspace, contexts);
			adspace.context.wallpaper = adspace;
			adspace.context.adspaces.push(adspace);
		} else {
			// console.error('no id', adspace);
		}
	}

	if (conf['adspaces'].length == 0 && !conf['wallpaper'] && !conf['floating']) {
		console.error('no adspaces or wallpaper provided');
	}

	return conf;
};