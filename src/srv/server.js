var express = require('express');
var fs = require('fs');
var app = express();
var cors = require('cors');

var root = __dirname + '/../../';

var addFolder = function(app, name, path) {
	app.use(name, express.static(root + path, { maxAge : 0}));
	app.use(name, express.directory(root + path));
};

//addFolder(app, '/fixture', '/test/browser/fixture/');
//addFolder(app, '/manual', '/test/browser/manual/'); 
app.use(cors());
app.use(express.logger('dev'));
addFolder(app, '/coverage', '/coverage');
addFolder(app, '/docs', '/docs');

app.get('/favicon.ico', function(req, res) {
	res.writeHead(200, {'Content-Type' : 'image/x-icon'});
	res.end();
});


app.get('/api/v2/js/adserv.js', function(req, res) {
	fs.createReadStream(root + '/build/AdServ.js').pipe(res);
});

app.get('/api/v2/get/campaigns.json', function(req, res) { res
	res.send({
		         "meta" : {
			         "timestamp" : 1372081828,
			         "timestamp_human" : "Mon, 24 Jun 2013 15:50:28 +0200",
			         "keyword" : "",
			         "path" : "\/\/test.fmadserving.dk\/",
			         "geo" : {
				         "country_code" : null, "city" : null, "source" : "no info available"
			         },
			         "ua" : "Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_8_4) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/27.0.1453.116 Safari\/537.36",
			         "adServingLoad" : ",n141"
		         },
		         "campaigns" : [
			         {
				         "adspace" : 9, "campaign" : 490, "banner" : 171, "banner_type" : "html",
				         "click" : "\/\/test.fmadserving.dk\/api\/v2\/count\/click\/490\/171",
				         "html" : "<code id='ba_adspaceid'>[ba_adspaceid]<\/code><br>\n<code id='ba_bannerid'>[ba_bannerid]<\/code><br>\n<code id='ba_flashurl'>[ba_flashurl]<\/code><br>\n<code id='ba_clicktag_type'>[ba_clicktag_type]<\/code><br>\n<code id='ba_width'>[ba_width]<\/code><br>\n<code id='ba_height'>[ba_height]<\/code><br>\n<code id='ba_campaign'>[ba_campaign]<\/code><br>\n<code id='ba_clickpath'>[ba_clickpath]<\/code><br>\n<code id='timestamp'>[timestamp]<\/code><br>\n<code id='random'>[random]<\/code><br>\n<code id='ba_destination'>[ba_destination]<\/code><br>\n<code id='ba_search'>[ba_search]<\/code><br>\n<code id='ba_keyword'>[ba_keyword]<\/code><br>\n<code id='ba_referer'>[ba_referer]<\/code><br> ",
				         "width" : 300,
				         "height" : 250
			         },
			         {
				         "adspace" : 1
			         }
		         ]
	         });
});

app.listen(9877, function() {
	console.log('Listening on port 9877');
});