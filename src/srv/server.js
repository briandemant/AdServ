var express = require('express');
var logger = require('morgan');
var serveIndex = require('serve-index');
var serveStatic = require('serve-static');
var fs = require('fs');
var app = express();
var cors = require('cors');

var root = __dirname + '/../../';

var addFolder = function(app, name, path) {
	app.use(name, serveStatic(root + path, { maxAge : 0}));
	app.use(name, serveIndex(root + path, {icons : false}));
};

//addFolder(app, '/fixture', '/test/browser/fixture/');
//addFolder(app, '/manual', '/test/browser/manual/'); 
app.use(cors());
app.use(logger('dev'));
addFolder(app, '/coverage', '/coverage');
addFolder(app, '/docs', '/docs');

app.get('/favicon.ico', function(req, res) {
	res.writeHead(200, {'Content-Type' : 'image/x-icon'});
	res.end();
});

app.get('/api/v2/js/adserv.js', function(req, res) {
	res.writeHead(200, {
		'Cache-Control' : 'private, no-cache, no-store, must-revalidate',
		'Pragma' : 'applicatiavascript',
		'ContentType' : 'no-cache',
		'ContentType' : 'Thu, 1 Jan 1970 00:00:00 GMT',
		'Expires' : 'application/javascript'
	});
	fs.createReadStream(root + '/build/adserv.js').pipe(res);
});
app.get('/api/v2/js/adserv.min.js', function(req, res) {
	res.writeHead(200, {'Content-Type' : 'application/javascript'});
	fs.createReadStream(root + '/build/adserv.min.js').pipe(res);
});


app.get(/\/api\/v2\/count\/.*/, function(req, res) {
	res.send("ok");
});

app.get('/api/v2/get/campaigns.json', function(req, res) {
	var path = root + 'test/browser/fixtures/json/campaigns.' + req.query.keyword + '.' + req.query.adspaces + '.json';
	if (fs.existsSync(path)) {
		res.writeHead(200, {'Content-Type' : 'application/json'});
		fs.createReadStream(path).pipe(res);
	} else {
		res.send("error " + path + " not found");
	}
});

app.listen(9877, function() {
	console.log('Listening on port 9877');
});