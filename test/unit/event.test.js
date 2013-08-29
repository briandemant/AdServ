var helpers = require('./helpers.js');
var assert = helpers.assert;

describe('event.js', function() {
	describe('event', function() {
		it.skip('should be tested', function() {
			helpers.run("./src/event.js", assert, function() {
			}, function() {
				assert.ok(AdServ.guid);
			});
		});
	});
});