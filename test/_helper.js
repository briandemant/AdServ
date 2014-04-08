var makeAdServ = require('../build/adserv.js'); 

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

 