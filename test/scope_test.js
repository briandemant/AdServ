var helper = require('./_helper.js');

module.exports = {
	setUp   : function (callback) {
		this.foo = 'bar';
		callback();
	},
	tearDown: function (callback) {
		// clean up
		callback();
	},
 
	AdServAddedScope : function (test) {
		var global = {};
		helper.makeAdServ(global);
		test.ok(typeof global.AdServ !== 'undefined', 'Expect AdServ to be defined in scope');
		test.done();
	},
	AdServSameAsScope: function (test) {
		var global = {};
		var AdServ = helper.makeAdServ(global);
		test.ok(global.AdServ === AdServ, 'Expect AdServ to be the same as in scope');
		test.done();
	},
	AdServIsPreserved: function (test) {
		var global = {AdServ: {banners: 'the same'}};
		var AdServ = helper.makeAdServ(global);
		test.equal(global.AdServ.banners, 'the same', 'Expect AdServ to be preserved in global scope');
		test.done();
	}
};

 