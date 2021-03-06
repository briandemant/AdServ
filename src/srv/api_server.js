var express = require('express');
var static = require('express-static');
var morgan = require('morgan');
var fs = require('fs');

var app = express();
var root = express.Router();
var v2 = express.Router();

app.use(morgan('dev'))
app.all('*', function(req, res, next) {
	req.urlRoot = "http://" + req.hostname + ":1337";
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

function startCampaign(type, req, adspace, idx) {
	var group = (adspace + "" + idx) | 0;
	var campaign = (adspace + "0" + idx) | 0;
	var banner = (adspace + "00" + idx) | 0;
	return {
		"adspace" : adspace,
		"group" : group,
		"campaign" : campaign,
		"banner" : banner,
		"banner_type" : type,
		"click" : req.urlRoot + "/click.php?raw=" + campaign + "|" + banner + "|",
		"count" : req.urlRoot + "/api/v2/count/view/" + adspace + "/" + campaign + "/" + banner + "?keyword=",
		"iframe" : adspace % 2 == 0
	}
}

function imageCampaign(type, width, height, req, adspace, idx) {
	var campaign = startCampaign('image', req, adspace, idx);
	campaign.image = req.urlRoot + "/banner/" + type + "/" + ( adspace % 10 ) + ".jpg";
	campaign.width = width;
	campaign.height = height;
	return campaign;
}

var campaignMakers = {
	"0" : function(req, adspace, keyword, idx) {
		return {
			"adspace" : adspace,
			"count" : req.urlRoot + "/api/v2/count/view/" + adspace + "?keyword=" + keyword,
			"msg" : "nothing found"
		}
	},
	"1" : function(req, adspace, keyword, idx) {
		return imageCampaign('wide', 150, 100, req, adspace, idx);
	},
	"2" : function(req, adspace, keyword, idx) {
		return imageCampaign('high', 100, 150, req, adspace, idx);
	},
	"3" : function(req, adspace, keyword, idx) {
		return imageCampaign('square', 150, 150, req, adspace, idx);
	},
	"4" : function(req, adspace, keyword, idx) {
		var campaign = startCampaign('txt', req, adspace, idx);
		campaign.txt = "Banner " + adspace + "_" + campaign.group;
		campaign.width = 150;
		campaign.height = 150;
		return campaign;
	},
	"5" : function(req, adspace, keyword, idx) {
		var campaign = startCampaign('html', req, adspace, idx);
		campaign.html = "<b><center>Banner " + adspace + "_" + campaign.group + "</center></b>" +
		                "<script>//console.log('js inline for adspace ' + " + adspace + ")</script>" +
		                "<script src='" + req.urlRoot + "/jsurl?adspace=" + adspace + "&keyword=" + keyword + "'>alert('ERROR:DO NOT RUN THIS')</script>";
		campaign.width = 150;
		campaign.height = 150;
		return campaign;
	},
	"6" : function(req, adspace, keyword, idx) {
		var campaign = startCampaign('flash', req, adspace, idx);
		campaign.flash = req.urlRoot + "/banner/test.swf?bg=ddeeff&token=token:" + idx + ":" + adspace + "&text=B:" + idx + "%20/%20A:" + adspace + "&clickTAG=click:" + idx + ":" + adspace;
		campaign.width = 150;
		campaign.height = 150;
		return campaign;
	},
	"7" : function(req, adspace, keyword, idx) {
		// reject
		var campaign = startCampaign('html', req, adspace, idx);
		var next = (adspace % 10) + '' + (adspace % 10);
		campaign.html = '<iframe src="' + req.urlRoot + '/api/v2/rejected?adspace=' + adspace + '&next=' + next + '" frameborder=0 width=0 height=0></iframe>';
		campaign.width = 150;
		campaign.height = 150;
		return campaign;
	},
	"8" : function(req, adspace, keyword, idx) {
		// reject  to rejection
		var campaign = startCampaign('html', req, adspace, idx);
		var next = 70 + (adspace % 10);
		campaign.html = '<iframe src="' + req.urlRoot + '/api/v2/rejected?adspace=' + adspace + '&next=' + next + '" frameborder=0 width=0 height=0></iframe>';
		campaign.width = 150;
		campaign.height = 150;
		return campaign;
	},
	"9" : function(req, adspace, keyword, idx) {
		// reject to rejection to rejection
		var campaign = startCampaign('html', req, adspace, idx);
		var next = 80 + (adspace % 10);
		campaign.html = '<iframe src="' + req.urlRoot + '/api/v2/rejected?adspace=' + adspace + '&next=' + next + '" frameborder=0 width=0 height=0></iframe>';
		campaign.width = 150;
		campaign.height = 150;
		return campaign;
	},
	"10" : function(req, adspace, keyword, idx) {
		var campaign = startCampaign('iframe', req, adspace, idx);
		campaign.iframe_src = req.urlRoot + "/get/iframe?adspace=" + adspace +"&campaign="+campaign.campaign+"&banner="+campaign.banner+"&group="+campaign.group;
		campaign.width = 150;
		campaign.height = 150;
		return campaign;
	},
}

v2.get('/js/:name', function(req, res) {
	var fileName = req.params.name;
	res.sendFile(fileName, {root : __dirname + '/../../build/'})
});

v2.get('/get/campaigns.json', function(req, res) {
	var keyword = req.query.keyword || '';
	var count = typeof req.query.count != "undefined";
	var result = {
		"meta" : {
			"timestamp" : Date.now(),
			"timestamp_human" : new Date(),
			"keyord" : keyword,
			"sw" : null,
			"adServingLoad" : req.query.adServingLoad
		},
		"campaigns" : []
	};

	if (count) {
		result.meta.counted = true;
	}

	req.query.adspaces.split(',').forEach(function(adspace, idx) {
		adspace = adspace | 0;
		var maker = adspace / 10 | 0;
		var campaign = campaignMakers[maker](req, adspace, keyword, idx);
		if (/_v2$/.test(keyword)) {
			campaign.group += 1000;
		}
		result.campaigns.push(campaign);

	})

	if (req.query.wallpaper) {
		var wallpaper
		console.log(req.query.wallpaper);

		if (req.query.wallpaper < 10) {
			wallpaper = imageCampaign('square', 150, 100, req, req.query.wallpaper, 0);

			wallpaper.banner_type = 'wallpaper';
			wallpaper.wallpaper = wallpaper.image;
			wallpaper.wallpaper_repeat = 'repeat';
			delete wallpaper.image;
			delete wallpaper.iframe;
			delete wallpaper.width;
			delete wallpaper.height;
		} else {
			wallpaper = {adspace : req.query.wallpaper, msg : "nothing found"};
		}
		result.campaigns.push(wallpaper);
	}

	result.campaigns = result.campaigns.map(function(campaign, idx) {
		if (campaign.group) {
			result.meta.adServingLoad = result.meta.adServingLoad + "," + (['i', 'e', 'n'][idx % 3]) + campaign.group;
		}
		if (count) {
			delete campaign.count;
		}
		return campaign;
	});
	res.setHeader("Cache-Control", "public, max-age=600");
	res.send(result);
});

v2.get("/count/*", function(req, res) {
	res.setHeader("Cache-Control", "public, max-age=6000");
	res.send("ok");
});

function prettyJSON(query) {
	return JSON.stringify(query).replace(/[{}]/g, '').replace(/,/g, "<br>").replace(/"([a-z]+)":/gi, "$1 : ");
}
v2.get('/get/js_banner', function(req, res) {

	res.setHeader("Cache-Control", "public, max-age=600");
	var adspace = req.query.adspaceid;

	function sendMessage() {
		return "this.addEventListener('message', function(m) {" +
		       "\n   var payload = JSON.parse(m.data);" +
		       "\n   payload.campaignid=" + req.query.campaignid + ";" +
		       "\n   payload.bannerid=" + req.query.bannerid + ";" +
		       "\n   payload.target='" + req.query.target + "';" +
		       "\n   top.postMessage(JSON.stringify(payload), '*');" +
		       "\n   /*console.log(payload);console.debug('show_campaign', Date.now()-payload.time);*/\n" +
		       "\n});\n" +
		       "\nthis.postMessage('{\"source\":\"js_banner\",\"adspace\":" + req.query.adspaceid + ",\"time\":'+ Date.now()+'}','*')\n";
	}

	if (adspace >= 70) {
		var next = adspace - 10;
		if (next == 60) next = 1; // reject to empty
		res.send( sendMessage() +'document.write("<b>Rejected</b><iframe src=\\\"' + req.urlRoot + '/api/v2/rejected?adspace=' + adspace + '&next=' + next + '\\\">")');
	} else {
		console.log(req.rawHeaders);
		console.log(req.headers);
		
		res.send("" +
		         //"document.write('<b>js loaded..</b>');" +
		         sendMessage() +
		         "\nvar inDapIF = (typeof inDapIF == 'undefined') ? false : inDapIF;\n" + 
		         "\ntry{window.top.iframeWasHere=true} catch(e){};\n" + 
		         "\nthis.postMessage('{\"source\":\"referrer\",\"adspace\":" + req.query.adspaceid + ",\"referrer\":\""+req.headers.referer+"\",\"time\":'+ Date.now()+'}','*')\n" + 
 
				(req.headers.referer ?"\nreferer='"+req.headers.referer+"';\n" :'')+ 
		         "\nconsole.info('req.referrer','"+req.headers.referer+"');\n" + 
		         "\nconsole.info('doc.referrer',document.referrer);\n" + 
		         "");
	}
});

v2.get('/rejected', function(req, res) {
	res.setHeader("Cache-Control", "public, max-age=600");
	res.send("<script>parent.postMessage('{\"adspace\":" + req.query.adspace + ",\"next\":" + req.query.next + ",\"source\":\"rejected\",\"time\":'+Date.now()+'}',\"*\");</script>" + prettyJSON(req.query));
});

root.get('/get/iframe', function(req, res) {
	res.setHeader("Cache-Control", "public, max-age=6");
	res.send("wazzup? "+req.headers.referer +"<script>" +
			"console.error(inDapIF);this.postMessage('{\"source\":\"get_iframe\",\"adspace\":" + req.query.adspaceid + ",\"time\":'+ Date.now()+'}','*')" +
			"\nvar inDapIF = (typeof inDapIF == 'undefined') ? false : inDapIF;\n" + 
					         "\ntry{window.top.iframeWasHere=true} catch(e){};\n" + 
					         "\ntry{window.top.document.body.style.backgroundImage = 'url(//127.0.0.1:1337/banner/wide/4.jpg)';} catch(e){};\n" + 
					         "\nthis.postMessage('{\"source\":\"referrer\",\"adspace\":" + req.query.adspaceid + ",\"referrer\":\""+req.headers.referer+"\",\"time\":'+ Date.now()+'}','*')\n" + 
			"</script>");
});

root.get('/banner/:kind/:name', function(req, res) {
	var fileName = req.params.kind + '/' + req.params.name;
	res.setHeader("Cache-Control", "public, max-age=600");
	res.sendFile(fileName, {root : __dirname + '/../../test/examples/_fixtures'})
});
root.get('/banner/test.swf', function(req, res) {
	res.setHeader("Cache-Control", "public, max-age=600");
	res.sendFile('test.swf', {root : __dirname + '/../../test/examples/_fixtures'})
});

root.get('/show_campaign.php', function(req, res) {
	res.setHeader("Cache-Control", "public, max-age=600");
	var adspace = req.query.adspaceid;
	console.log(req.query);

	var html = "<style>*{ font-size: 11px;}</style>\n" +
	           "<script src='/api/v2/get/js_banner?nocount=" + req.query.nocount + "&adspaceid=" + req.query.adspaceid + "&campaignid=" + req.query.campaignid + "&bannerid=" + req.query.bannerid + "&target=" + req.query.target + "'></script><pre><h2>iframe</h2>" + JSON.stringify(req.query).replace(/([{}]|id)/g, '').replace(/,/g, "\n").replace(/"([a-z]+)":/ig, "$1: ") + '</pre>';


	if (adspace >= 70) {
		var next = adspace - 10;
		if (next == 60) next = 1; // reject to empty 
		var html = "<style>*{ font-size: 11px;}</style>\n<script>this.addEventListener('message', function(m) {\n var payload = JSON.parse(m.data);payload.campaignid=" + req.query.campaignid + ";payload.bannerid=" + req.query.bannerid + ";payload.target='" + req.query.target + "';top.postMessage(JSON.stringify(payload), '*');/*console.log(payload);console.debug('show_campaign', Date.now()-payload.time);*/}); </script><pre><h2>iframe</h2>" + JSON.stringify(req.query).replace(/([{}]|id)/g, '').replace(/,/g, "\n").replace(/"([a-z]+)":/ig, "$1: ") + '</pre>';
		res.send( html+ '<h2>Rejected</h2><iframe src="' + req.urlRoot + '/api/v2/rejected?adspace=' + adspace + '&next=' + next + '">');
	} else {
		var values = req.query;
		values.source = 'show_campaign';
		res.send(html);
	}
}); 


root.get('/jsurl', function(req, res) {
	res.setHeader("Cache-Control", "public, max-age=600");
	res.setHeader("Content-Type", "text/javascript");
	res.send("top.postMessage(JSON.stringify({source : 'jsurl', adspace:" + req.query.adspace + ", keyword:'" + req.query.keyword + "'}),'*')");
});

root.get('/tests.js', function(req, res) {
	// YEAH .. too lazy to use promises :)
	res.setHeader("Content-Type", "text/javascript");
	var all = [];
	fs.readdir(__dirname + '/../../test/examples/responsive', function(err, files) {
		if (err) {
			return res.send("console.error(" + JSON.stringify(err) + ")");
		}
		if (req.query.all || req.query.responsive) {
			var tests = files.filter(function(name) { return name.match(/test.js$/) }).map(function(filename) {
				return "/examples/responsive/" + filename;
			});
			all = all.concat(tests);
		}
		fs.readdir(__dirname + '/../../test/examples/adserv', function(err, files) {
			if (err) {
				return res.send("console.error(" + JSON.stringify(err) + ")");
			}
			if (req.query.all || req.query.adserv) {
				var tests = files.filter(function(name) { return name.match(/test.js$/) }).map(function(filename) {
					return "/examples/adserv/" + filename;
				});
				all = all.concat(tests);
			}
			fs.readdir(__dirname + '/../../test/examples/common', function(err, files) {
				if (err) {
					return res.send("console.error(" + JSON.stringify(err) + ")");
				}
				if (req.query.all || req.query.common) {
					var tests = files.filter(function(name) { return name.match(/test.js$/) }).map(function(filename) {
						return "/examples/common/" + filename;
					});
					all =tests.concat( all);
				}
				fs.readdir(__dirname + '/../../test/examples/units', function(err, files) {
					if (err) {
						return res.send("console.error(" + JSON.stringify(err) + ")");
					}
					if (req.query.all || req.query.units) {
						var tests = files.filter(function(name) { return name.match(/test.js$/) }).map(function(filename) {
							return "/examples/units/" + filename;
						});
						all = tests.concat(all);
					}
					res.send("var testFiles = " + JSON.stringify(all));
				})
			})
		})
	})
});
app.use('/', root);
app.use('/api/v2', v2);

app.listen(1337, function() {
	console.log("api on http://0.0.0.0:1337")
});

 