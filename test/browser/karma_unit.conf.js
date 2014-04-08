// Karma configuration
// Generated on Sun May 19 2013 19:15:15 GMT+0200 (CEST)


// base path, that will be used to resolve files and exclude
basePath = '../..';


// list of files / patterns to load in the browser
files = [
	MOCHA,
	MOCHA_ADAPTER,
	'node_modules/es5-shim/es5-shim.js',
	'node_modules/lodash/dist/lodash.min.js',
	'node_modules/expect.js/expect.js',
	'test/browser/helpers/test-main.js',

	'test/browser/helpers/test-test.js',
//	'test/browser/unit/scope.test.js', 
	'test/browser/unit/*.test.js',

	{pattern : 'build/adserv.js', watched : true, included : false, served : false},
	{pattern : 'build/responsive.js', watched : true, included : false, served : false},

	// test main require module last
	{pattern : 'test/browser/fixtures/*.html', watched : true, included : false, served : true},
	{pattern : 'test/browser/fixtures/*.css', watched : true, included : false, served : true},
	{pattern : 'test/browser/manual/*.html', watched : false, included : false, served : true},

	'test/browser/helpers/test-execute-now.js'
];


// list of files to exclude
exclude = [

];

preprocessors = {
//	'build/AdServ.js' : 'coverage'
};

proxies = { 
//	'/api' : 'http://test.fmadserving.dk/api'
	//'/api' : 'http://127.0.0.1:9000'
};

// test results reporter to use
// possible values: 'dots', 'progress', 'junit'
//reporters = ['progress', 'coverage'];
reporters = ['progress', 'junit'];


// web server port
port = 9876;

//Karma will report all the tests that are slower than given time limit (in ms)
reportSlowerThan = 5000;
 
// cli runner port
runnerPort = 9100;


// enable / disable colors in the output (reporters and logs)
colors = true;


// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;


// enable / disable watching file and executing tests whenever any file changes
autoWatch = true;


// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
browsers = [];


// If browser does not capture in given timeout [ms], kill it
captureTimeout = 60000;


// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = false;
