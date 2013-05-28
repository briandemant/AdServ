/**
 * loads ads for the adspaces configured in the global var ba_adspaces
 */
AdServ.loadAdspaces = function(baseUrl) {
	if (!baseUrl) {
		baseUrl = AdServ.conf.baseUrl;
	}
	var contexts = {};
	var contextNames = [];
	var index;
	
	AdServ.ready(function() {
		if (!AdServ.adspaces || AdServ.adspaces.length == 0) {
			return;
		}
		for (index = 0; index < AdServ.adspaces.length; index++) {
			var adspace = AdServ.adspaces[index], ctx;
			if (adspace.id > 0) {
				adspace.context = adspace.context || '_GLOBAL_';

				if (!contexts[adspace.context]) {
					ctx = contexts[adspace.context] = {name : adspace.context, adspaces : [], keyword : adspace.keyword || '', searchword : adspace.searchword || '' };
					contextNames.push(adspace.context);
				} else {
					ctx = contexts[adspace.context];
				}

				ctx[adspace.id] = adspace;
				ctx.adspaces.push(adspace.id);
			}
		}


		var emit_campaign = function(cmp, ctx) {
		 if (isFunction(ctx.onload)) {
				ctx.onload(cmp, ctx);
			}
			AdServ.emit('campaign', cmp, ctx);
		};
		emit_campaign.waiting = 0;
		emit_campaign.results = [];

		AdServ.on('campaign', function(cmp, ctx) {
			emit_campaign.results.push([cmp, ctx]);
			if (--emit_campaign.waiting < 1) {
				if (isFunction(AdServ.onload)) {
					AdServ.onload(emit_campaign.results);
				}
				AdServ.emit('done', emit_campaign.results);
			}
		});


		for (index = 0; index < contextNames.length; index++) {
			var name = contextNames[index];
			var context = contexts[name];
			if (context.adspaces && context.adspaces.length > 0) {
				var url = baseUrl + '/api/v1/get/campaigns.json?adspaces=' + context.adspaces.join(',')
					          + '&keyword=' + context.keyword
					          + '&searchword=' + context.searchword;

				AdServ.getJSON(url, (function(ctx) {
					return function(err, data) {


						if (err) {
							AdServ.emit('error', err);
							AdServ.emit('campaign', {error : err});
						} else if (data.campaigns) {
							emit_campaign.waiting += data.campaigns.length;
							for (var i = 0; i < data.campaigns.length; i++) {
								data.campaigns[i].found = false;
								var campaign = data.campaigns[i];
								if (campaign.banner > 0) {
									var adspace = ctx[campaign.adspace];
									var elem = doc.getElementById(adspace.target);
									elem.innerHTML = "";
									if (campaign.campaign && campaign.banner && campaign.adspace) {
										campaign.found = true;
										var id = 'script_' + adspace.target + "_" + campaign.adspace;

										var script = doc.getElementById(id);

										if (!script) {
											script = doc.createElement('script');
											script.id = id;
											script.type = 'text/javascript';
											script.async = false;
											script.onload = script.onreadystatechange = (function(cmp, ctx2) {
												return function() {
													emit_campaign(cmp, ctx2[cmp.adspace]);
												};
											})(campaign, ctx);
											script.src = baseUrl + '/api/v1/get/js_banner'
												             + '?adspaceid=' + campaign.adspace
												             + '&campaignid=' + campaign.campaign
												             + '&bannerid=' + campaign.banner
												             + '&appendTo=' + adspace.target;
											elem.parentNode.insertBefore(script, elem);
										} else {
											AdServ.emit('error', "already loaded " + id);
											emit_campaign.waiting--;
										}
									}
								} else {
									emit_campaign(campaign, ctx[campaign.adspace]);
								}
							}
						}
					}
				})(context));
			}
		}

	});
};
 