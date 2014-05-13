var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var notify = require('gulp-notify');
var replace = require('gulp-replace');
var livereload = require('gulp-livereload');
var size = require('gulp-size');
var express = require('express');
var logger = require('morgan');
var serveIndex = require('serve-index');
var serveStatic = require('serve-static');

var pkg = require("./package.json");
var files = {
	adserv : [ 'src/common/constants.js', 'src/common/legacy.js', 'src/common/utils.js', 'src/common/ready.js', 'src/common/{dom,json,event,ajax,flash,render}.js', 'src/api/adserv.js']

}
// uglify task
gulp.task('js', function() {
	// create 1 vendor.js file from all vendor plugin code
	var list = files.adserv;
	list.unshift('src/templates/header.js.tmpl');
	list.push('src/templates/footer.js.tmpl');

	gulp.src(list)
		.pipe(concat('adserv.js'))
		.pipe(replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1'))
		.pipe(replace(/(^|\n)/g, '$1\t'))
		.pipe(replace(/(\n\t){2,}/g, '\n\n\t'))
		.pipe(replace(/VERSION/g, pkg.version))
		.pipe(replace(/DATE/g, new Date()))
		.pipe(gulp.dest('./build'))
		.pipe(size())
		.pipe(notify({ message : "Javascript is compiled!"}))
		.pipe(uglify({
			             preserveComments : 'some',
			             compress : {
				             sequences : true,  // join consecutive statemets with the “comma operator”
				             properties : true,  // optimize property access: a["foo"] → a.foo
				             dead_code : true,  // discard unreachable code
				             drop_debugger : true,  // discard “debugger” statements
				             unsafe : true, // some unsafe optimizations (see below)
				             conditionals : true,  // optimize if-s and conditional expressions
				             comparisons : true,  // optimize comparisons
				             evaluate : true,  // evaluate constant expressions
				             booleans : true,  // optimize boolean expressions
				             loops : true,  // optimize loops
				             unused : true,  // drop unused variables/functions
				             hoist_funs : true,  // hoist function declarations
				             hoist_vars : false, // hoist variable declarations
				             if_return : true,  // optimize if-s followed by return/continue
				             join_vars : true,  // join var declarations
				             cascade : true,  // try to cascade `right` into `left` in sequences
				             side_effects : true,  // drop side-effect-free statements
				             global_defs : {
					             DEBUG : false
				             }
			             }, 
			             output : {
				             beautify : true
			             }
		             }))
		.pipe(concat('adserv.min.js'))
		.pipe(gulp.dest('./build/'))
		.pipe(size())
		.pipe(notify({ message : "Javascript is now ugly!"}));

});

gulp.task('manual_server', function() {
	var express = require('express');
	var app = express();
	app.use(logger('dev'));
	var addFolder = function(app, name, path) {
		app.use(name, serveStatic(path, { maxAge : 0}));
		app.use(name, serveIndex(path));
	};

	var manual_root = "./test/browser/manual/";
	addFolder(app, "/", manual_root);
	app.listen(8080, function() {
		console.log('Listening on port 8080');
	});

	var server = livereload();
	gulp.watch(['./build/*.min.js', manual_root + "*"]).on('change', function(file) {
		server.changed(file.path);
	});
});
gulp.task('ad_server', function() {
	require('./src/srv/server.js');
});
gulp.task('watch', function() {
	gulp.watch(['./src/api/*', './src/common/*', './src/templates/*'], function() {
		gulp.run('js');
	});
});


gulp.task('qwe', function() { 
	gulp.src(['qwe.js']) 
		.pipe(gulp.dest('./build'))
		.pipe(size())
		.pipe(notify({ message : "Javascript is compiled!"}))
		.pipe(uglify({
			             preserveComments : 'some',
			             compress : {
				             sequences : true,  // join consecutive statemets with the “comma operator”
				             properties : true,  // optimize property access: a["foo"] → a.foo
				             dead_code : true,  // discard unreachable code
				             drop_debugger : true,  // discard “debugger” statements
				             unsafe : true, // some unsafe optimizations (see below)
				             conditionals : true,  // optimize if-s and conditional expressions
				             comparisons : true,  // optimize comparisons
				             evaluate : true,  // evaluate constant expressions
				             booleans : true,  // optimize boolean expressions
				             loops : true,  // optimize loops
				             unused : true,  // drop unused variables/functions
				             hoist_funs : true,  // hoist function declarations
				             hoist_vars : false, // hoist variable declarations
				             if_return : true,  // optimize if-s followed by return/continue
				             join_vars : true,  // join var declarations
				             cascade : true,  // try to cascade `right` into `left` in sequences
				             side_effects : true,  // drop side-effect-free statements
				             global_defs : {
					             DEBUG : false
				             }
			             },
			             output : {
				             beautify : true
			             }
		             }))
		.pipe(concat('qwe.min.js'))
		.pipe(gulp.dest('./build/'))
		.pipe(size())
		.pipe(notify({ message : "Javascript is now ugly!"}));

});

gulp.task('servers', ['manual_server', 'ad_server']);
gulp.task('default', ['js', 'watch', 'servers']);