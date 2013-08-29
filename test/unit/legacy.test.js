var helpers = require('./helpers.js');
var assert = helpers.assert;

describe('legacy.js', function() {
	describe('legacy', function() {
		it.skip('should be tested', function() {
			helpers.run("./src/legacy.js", assert, function() {
			}, function() {
				assert.ok(AdServ.guid);
			});
		});
	});
});