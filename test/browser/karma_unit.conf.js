// Karma configuration
// Generated on Sun May 19 2013 19:15:15 GMT+0200 (CEST)

https://github.com/spadgos/myrtle/wiki
http://developers.soundcloud.com/blog/writing-your-own-karma-adapter
module.exports = function(config) {
	config.set({
		           basePath : '../..',
		           frameworks : ['mocha'],
		           reporters : ['progress','notificationCenter','benchmark'],
		           files : [
			           'node_modules/es5-shim/es5-shim.js',
			           'node_modules/lodash/dist/lodash.min.js',
			           'node_modules/expect.js/index.js',
			           'test/browser/helpers/test-main.js',

			           'test/browser/helpers/test-test.js',
			           'test/browser/unit/scope.test.js', 
//			           'test/browser/unit/*.test.js',

			           {pattern : 'build/adserv.js', watched : true, included : false, served : false},
			           {pattern : 'build/responsive.js', watched : true, included : false, served : false},

			           // test main require module last
			           {pattern : 'test/browser/fixtures/*.html', watched : true, included : false, served : true},
			           {pattern : 'test/browser/fixtures/*.css', watched : true, included : false, served : true},
			           {pattern : 'test/browser/manual/*.html', watched : false, included : false, served : true},

			           'test/browser/helpers/test-execute-now.js'
		           ]
	           });
};
 