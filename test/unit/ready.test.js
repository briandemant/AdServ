var helpers = require('./helpers.js');
var assert = helpers.assert;

describe('ready.js', function() {
	describe('ready', function() {
		it.skip('should be tested', function() {
			helpers.run("./src/ready.js", assert, function() {
			}, function() {
				assert.ok(AdServ.guid);
			});
		});
	});
});