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
	res.writeHead(200, {'Content-Type' : 'application/javascript'});
	fs.createReadStream(root + '/build/adserv.js').pipe(res);
});
app.get('/api/v2/js/adserv.min.js', function(req, res) {
	res.writeHead(200, {'Content-Type' : 'application/javascript'});
	fs.createReadStream(root + '/build/adserv.min.js').pipe(res);
});

app.get('/api/v2/get/campaigns.json', function(req, res) { 
	res.writeHead(200, {'Content-Type' : 'application/json'});
	var path = root + 'test/browser/fixtures/json/campaigns.' + req.query.keyword + '.' + req.query.adspaces + '.json';
	fs.createReadStream(path).pipe(res); 
});

app.listen(9877, function() {
	console.log('Listening on port 9877');
});