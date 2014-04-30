var helpers = require('./helpers.js');
var assert = helpers.assert;

describe('legacy.js', function() {
	describe('legacy', function() {
		it('should be tested', function() {
			helpers.run("./src/common/legacy.js", assert, function() {
			}, function() {
				assert.isDefined(window.adServingLoad); 
			});
		});
	});
});