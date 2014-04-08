var helpers = require('./helpers.js');
var assert = helpers.assert;

describe('utils.js', function() {

	describe('shortcuts', function() {
		it('should provide', function() {
			helpers.run("./src/common/utils.js", assert, function() {
			}, function() {
				assert.ok(AdServ.isSupportedBrowser);
			});
		});
	});

	describe('guid', function() {
		it('should be added to AdServ public api', function() {
			helpers.run("./src/common/utils.js", assert, function() {
			}, function() { 
				assert.ok(guid());
			});
		});

		it('should return a random string', function() {
			helpers.run("./src/common/utils.js", assert, function () {
				// fixing random to be the predictable  
				var next = 0.98;
				var time = 1396875596000;
				var Math = {
					random : function() {
						next = next * next;
						return  next;
					}
				}
				var Date = {
					now : function() {
						return  time;
					}
				}
			}, function() {
				assert.equal(guid(), "ad_1004ebec_f5dc_ec2051da");
				assert.equal(guid(), "ad_1004ebec_d9cb_b94aceb2");
			});
			helpers.run("./src/common/utils.js", assert, function () {
				// fixing random to be the predictable  
				var next = 0.98;
				var time = 1396875597000;
				var Math = {
					random : function() {
						next = next * next;
						return  next;
					}
				}
				var Date = {
					now : function() {
						return  time;
					}
				}
			}, function() {
				assert.equal(guid(), "ad_1004ebed_f5dc_ec2051da");
				assert.equal(guid(), "ad_1004ebed_d9cb_b94aceb2");
			});
		});
	});
	
	describe('getRequestParameter', function() {
		it('location.search is searched', function() {
			helpers.run("./src/common/utils.js", assert, function() {
				var location = {search : 'a=1&b=2&b=3&c=&d'};
			}, function() {
				assert.equal(getRequestParameter("a"), 1);
				assert.equal(getRequestParameter("b"), 2);
				assert.equal(getRequestParameter("c"), "");
				assert.equal(getRequestParameter("d"), void 0);
				assert.equal(getRequestParameter("e"), void 0);
			});
		});
		it('location.hash is searched', function() {
			helpers.run("./src/common/utils.js", assert, function() {
				var location = {hash : 'a=1&b=2&b=3&c=&d'};
			}, function() {
				assert.equal(getRequestParameter("a"), 1);
				assert.equal(getRequestParameter("b"), 2);
				assert.equal(getRequestParameter("c"), "");
				assert.equal(getRequestParameter("d"), void 0);
				assert.equal(getRequestParameter("e"), void 0);
			});
		});
		it('searched is searched before hash', function() {
			helpers.run("./src/common/utils.js", assert, function() {
				var location = {hash : 'a=1&b=2&b=3&c=&d=8', search : 'a=4&b=5&c=7&d'};
			}, function() {
				assert.equal(getRequestParameter("a"), 4);
				assert.equal(getRequestParameter("b"), 5);
				assert.equal(getRequestParameter("c"), 7);
				assert.equal(getRequestParameter("d"), 8);
				assert.equal(getRequestParameter("e"), void 0);
			});
		});
	});
});
 