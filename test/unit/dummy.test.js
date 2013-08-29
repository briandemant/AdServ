var helpers = require('./helpers.js');
var assert = helpers.assert;

var asd = "hello from test";

describe('helpers.js', function() {
	describe('helpers.run', function() {
		it('should isolate and use the provided globals', function() {
			assert.assertCounts = 0;
			helpers.run("./test/unit/dummy.js", {
				assert : assert,
				console : {log : function() {
					assert.assertCounts++;
				}},
				alert : function() {
					assert.assertCounts++;
				},
				Math : {
					random : function() {
						assert.assertCounts++;
						return  42;
					}
				},
				JSON : {
					parse : function() {
						assert.assertCounts++;
					}
				}
			}, function() {
				var qwe = "before";
				assert.equal(asd, void 0, "must not be inherrited from test scope");
				assert.equal(Math.random(), 42);
			}, function() {
				assert.equal(Math.random(), 42);
				assert.equal(qwe, 'before');
				assert.equal(asd, 'hello from dummy');
				assert.equal(assert.assertCounts, 6);
			});
		});

		it('should add default globals', function() {
			helpers.run("./src/utils.js", assert, function() {
				assert.deepEqual(Object.keys(AdServ), []);
			}, function() {
				assert.ok(Object.keys(AdServ).length > 0);
			});
		});
	});
});
 