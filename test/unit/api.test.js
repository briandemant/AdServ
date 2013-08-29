var helpers = require('./helpers.js');
var assert = helpers.assert;

describe('api.js', function() {
	describe('api', function() {
		it.skip('should be tested', function() {
			helpers.run("./src/api.js", assert, function() {
			}, function() {
				assert.ok(AdServ.guid);
			});
		});
	});
});