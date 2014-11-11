var puer = require("puer")


var express = require('express');

var static = require('express-static');

var morgan = require('morgan');

var app = express();
app.use(morgan('dev'))

var http = require("http")
var server = http.createServer(app)

var options = {
	dir : __dirname + '/../../',
	ignored : /common/  //ignored file
}

app.use(puer.connect(app, server, options))   //use as puer connect middleware
app.use(static(__dirname + '/../../test/'));

app.get('/favicon.ico', function(req, res) {
	res.writeHead(200, {'Content-Type' : 'image/x-icon'});
	res.end();
});


server.listen(3000, function() {
	console.log("spec on http://0.0.0.0:3000")
}) 

 

 