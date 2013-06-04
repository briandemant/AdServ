"use strict";

var prepareContexts = function(args) {
	var conf = { baseUrl : '', xhrTimeout : 5000 };
	for (var index = 0; index < args.length; index++) {
		var arg = args[index];
		if (isFunction(arg)) {
			conf.ondone = arg;
		} else if (isObject(arg)) {
			conf = mix(conf, arg);
		} else if (isArray(arg)) {
			conf['adspaces'] = arg;
		} else if (isString(arg)) {
			conf['baseUrl'] = arg;
		}
	}
	if (!isArray(conf['adspaces'])) {
		var global = window['ba_adspaces'];
		if (!global || global.length === 0 || global.loaded) {
			console.error('adspaces empty');
			return false;
		} else {
			global.loaded = true;
			conf['adspaces'] = global;
		}
	}

	var contexts = conf.contexts = {};
	var adspaces = conf.adspaces;
	for (index = 0; index < adspaces.length; index++) {
		var adspace = adspaces[index];
		if (adspace.id > 0) {
			var ctxName = adspace.context || '_GLOBAL_';
			adspace.context = contexts[ctxName] = contexts[ctxName] || {
				name : ctxName,
				ids : [],
				adspaces : {},
				keyword : adspace.keyword || '',
				searchword : adspace.searchword || '',
				adServingLoad : ''
			};
			contexts[ctxName].ids.push(adspace.id);
			contexts[ctxName].adspaces[adspace.id]=adspace;
		} else {
			console.error('no id', adspace);
		}
	}

	return conf;
};

var load = AdServ.load = function() {
	var conf = prepareContexts(arguments);

	for (var ctxName in conf.contexts) {
		//noinspection JSUnfilteredForInLoop
		var ctx = conf.contexts[ctxName];

		var url = conf.baseUrl + '/api/v1/get/campaigns.json?adspaces=' + ctx.ids.join(',')
			          + '&adServingLoad=' + urlencode(ctx.adServingLoad)
			          + '&keyword=' + urlencode(ctx.keyword)
			          + '&searchword=' + urlencode(ctx.searchword);
		getJSON(url, (function(ctx) {
			return function(err, data) {
				console.log(data, ctx);

				if (err) {
					console.log('error', err);
				} else {
					var campaigns = data.campaigns;
					for (var index = 0; index < campaigns.length; index++) {
						var campaign = campaigns[index];
						var adspace = ctx.adspaces[campaign.adspace];
						adspace.campaign = campaign;
						console.log(campaign);
						var elem = document.getElementById(adspace.target);
						elem.innerHTML = "";
						if (campaign.campaign && campaign.banner && campaign.adspace) {
							var id = 'script_' + adspace.target + "_" + adspace.id; // adspace id is just for easier debug
							var script = document.getElementById(id);
							if (!script) {
								script = document.createElement('script');
								script.id = id;
								script.type = 'text/javascript';
								script.async = false;
								script.onload = script.onreadystatechange = (function(cmp, ctx2) {
									return function() {
										//emit_campaign(cmp, ctx2[cmp.adspace]);
									};
								})(campaign, ctx);
								script.src = conf.baseUrl + '/api/v1/get/js_banner'
									             + '?adspaceid=' + urlencode(adspace.id)
									             + '&campaignid=' + urlencode(campaign.campaign)
									             + '&bannerid=' + urlencode(campaign.banner)
									             + '&appendTo=' + urlencode(adspace.target);
								elem.parentNode.insertBefore(script, elem);
							} else {
								console.error("already loaded " + id);
								// emit_campaign.waiting--;
							}
						} 
					}
				}

			};
		})(ctx));
	}

	ready(function() {
	});
	return conf;
}; 