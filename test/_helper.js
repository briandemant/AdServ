var makeAdServ = require('../build/AdServ.js');

module.exports = {
	makeAdServ: makeAdServ,
	makeGlobal: function (obj) {
		obj = obj || {};
		obj.document = {
			documentElement : function () {
			
		}
		}
		return obj;
	}
};

 