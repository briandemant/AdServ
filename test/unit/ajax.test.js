var helpers = require('./helpers.js');
var assert = helpers.assert;

describe('ajax.js', function() {
	describe('ajax', function() {
		it.skip('should be tested', function() {
			helpers.run("./src/ajax.js", assert, function() {
			}, function() {
				assert.ok(AdServ.guid);
			});
		});
	});
});