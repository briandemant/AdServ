var helpers = require('./helpers.js');
var assert = helpers.assert;

describe('json.js', function() {
	describe('json', function() {
		it('should expose AdServ.parseJSON', function() {
			helpers.run("./src/common/json.js", assert, function() {
			}, function() {
				assert.ok(parseJSON);
			});
		});
		it('should create JSON.parse shorcut', function() {
			helpers.run("./src/common/json.js", assert, function() {
			}, function() {
				assert.ok(parseJSON === JSON.parse); 
			});
		});
	});
});