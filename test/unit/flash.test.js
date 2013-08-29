var helpers = require('./helpers.js');
var assert = helpers.assert;

describe('flash.js', function() {
	describe('flash', function() {
		it.skip('should be tested', function() {
			helpers.run("./src/flash.js", assert, function() {
			}, function() {
				assert.ok(AdServ.guid);
			});
		});
	});
});