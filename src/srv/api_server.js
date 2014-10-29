var express = require('express');
var static = require('express-static');
var morgan = require('morgan');

var app = express();
var root = express.Router();
var v2 = express.Router();

app.use(morgan('dev'))
app.all('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

function startCampaign(type, req, adspace, idx) {
	req.baseUrl = "http://" + req.hostname + ":1337";
	var group = (adspace + "" + idx) | 0;
	var campaign = (adspace + "0" + idx) | 0;
	var banner = (adspace + "00" + idx) | 0;
	return {
		"adspace" : adspace,
		"group" : group,
		"campaign" : campaign,
		"banner" : banner,
		"banner_type" : type,
		"click" :  req.baseUrl + "/click.php?raw=" + campaign + "|" + banner + "|",
		"count" :  req.baseUrl + "/api/v2/count/view/" + adspace + "/" + campaign + "/" + banner + "?keyword=",
		"iframe" : adspace % 2 == 0
	}
}

function imageCampaign(type, width, height, req, adspace, idx) {
	var campaign = startCampaign('image', req, adspace, idx);
	campaign.image = req.baseUrl + "/banner/" + type + "/" + ( adspace % 10 ) + ".jpg";
	campaign.width = width;
	campaign.height = height;
	return campaign;
}

var campaignMakers = {
	"0" : function(req, adspace, keyword, idx) {
		var baseUrl = "//" + req.host + ":1337";
		return {
			"adspace" : adspace,
			"count" : baseUrl + "/api/v2/count/view/" + adspace + "?keyword=" + keyword,
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
		campaign.html = "Banner " + adspace + "_" + campaign.group;
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

	var keyword = req.query.keyword;
	var result = {
		"meta" : {
			"timestamp" : Date.now(),
			"timestamp_human" : new Date(),
			"keyword" : keyword,
			"sw" : null,
			"adServingLoad" : ""
		},
		"campaigns" : []
	};

	req.query.adspaces.split(',').forEach(function(adspace, idx) {
		adspace = adspace | 0;
		var maker = adspace / 10 | 0;
		var campaign = campaignMakers[maker](req, adspace, keyword, idx);
		result.campaigns.push(campaign);
		if (campaign.group) {
			result.meta.adServingLoad = result.meta.adServingLoad + "," + (['i', 'e', 'n'][idx % 3]) + campaign.group;
		}
	})

	res.send(result);
});

v2.get("/count/*", function(req, res) {
	res.send("ok");
});

v2.get('/get/js_banner', function(req, res) {
	res.send("document.getElementById('" + req.query.appendTo + "').innerHTML='" + JSON.stringify(req.query).replace(/[{}]/g, '').replace(/,/g, "<br>").replace(/"([a-z]+)":/gi, "$1 : ") + "'");
});

root.get('/banner/:kind/:name', function(req, res) {
	var fileName = req.params.kind + '/' + req.params.name;
	res.sendFile(fileName, {root : __dirname + '/../../test/examples/banners'})
});
root.get('/show_campaign.php', function(req, res) {
	res.send("<pre>" + JSON.stringify(req.query).replace(/[{}]/g, '').replace(/,/g, "\n").replace(/"([a-z]+)":/ig, "$1 : "));
});


app.use('/', root);
app.use('/api/v2', v2);

app.listen(1337, function() {
	console.log("api on http://0.0.0.0:1337")
});

 