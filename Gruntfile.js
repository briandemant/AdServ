module.exports = function(grunt) {
	var config = {
		pkg : grunt.file.readJSON('package.json'),
		// -------------------------------------------------------------------------------------
		uglify : {
			max : {
				options : {
					banner : '/*! <%= pkg.name %>  <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %> */\n',
//				beautify : true, 
//				mangle : false,
					report : 'gzip',
					// https://github.com/mishoo/UglifyJS2#readme
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
						side_effects : true  // drop side-effect-free statements
					}
//				preserveComments : 'some',
//				sourceMap : 'AdServ.map.js',
//				sourceMappingURL : 'http://adserving.com/src/AdServ.map.json',
				},
				files : {
					'build/AdServ.min.js' : [ 'build/AdServ.js']
				}
			},
//			docs : {
//				options : {
// 					beautify : true,
//					mangle : false,
//					// https://github.com/mishoo/UglifyJS2#readme
//					compress : {
//						sequences : false,  // join consecutive statemets with the “comma operator”
//						properties : false,  // optimize property access: a["foo"] → a.foo
//						dead_code : true,  // discard unreachable code
//						drop_debugger : false,  // discard “debugger” statements
//						unsafe : true, // some unsafe optimizations (see below)
//						conditionals : false,  // optimize if-s and conditional expressions
//						comparisons : false,  // optimize comparisons
//						evaluate : false,  // evaluate constant expressions
//						booleans : false,  // optimize boolean expressions
//						loops : false,  // optimize loops
//						unused : true,  // drop unused variables/functions
//						hoist_funs : false,  // hoist function declarations
//						hoist_vars : false, // hoist variable declarations
//						if_return : false,  // optimize if-s followed by return/continue
//						join_vars : false,  // join var declarations
//						cascade : false,  // try to cascade `right` into `left` in sequences
//						side_effects : true  // drop side-effect-free statements
//					},
//					preserveComments : 'all'
//				},
//				files : {
//					'build/<%= pkg.name %>.js' : [ 'build/<%= pkg.name %>.js']
//				}
//			}
		},

		// -------------------------------------------------------------------------------------
		concat : {
			options : {
				banner : grunt.file.read('src/header.js.tmpl')
					.replace(/VERSION/g, '<%= pkg.version %>')
					.replace(/DATE/g, '<%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>'),
				footer : grunt.file.read('src/footer.js.tmpl'),
				process : function(src, filepath) {
					return '\n\n\t// ## ' + filepath + '\n\t/* ------------------------------------------------------------ */\n\n' +
					       src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1').replace(/(^|\n)/g, '$1\t').replace(/(\n\t){2,}/g, '\n\n\t') + '\n';
				}
			},
			dist : {
//				src : ['src/flash.js'],
//				src : ['src/{legacy}.js'],
				src : [ 'src/legacy.js', 'src/utils.js', 'src/ready.js', 'src/{dom,json,event,ajax,flash}.js', 'src/api.js'],
//				src : ['src/*.js'],
				dest : 'build/<%= pkg.name %>.js'
			}
		},


		// -------------------------------------------------------------------------------------
		watch : {
			normal : {
				files : ['src/*.js', 'src/*.js.tmpl'],
				tasks : ['concat', 'uglify:max'],
				options : {
//					nospawn: true,
//					forever: true
				}
			},
			operation : {
				files : ['src/*.js', 'src/*.js.tmpl'],
				tasks : ['concat', 'uglify:max', 'copy:to_operation'],
				options : {
//					nospawn: true,
//					forever: true
				}
			},
			docs : {
				files : ['src/*.js', 'src/*.js.tmpl'],
//				tasks : ['concat', 'uglify:docs', 'docco'],
				tasks : ['concat', 'docco'],
				options : {
//					nospawn: true,
//					forever: true
				}
			},
//			fixtures: {
//				files  : [ 'test/browser/fixtures/*.html'],
//				tasks  : [ 'html2js:fixtures' ],
//				options: {
//					forever: true
//				}
//			}
		},

		// -------------------------------------------------------------------------------------
		karma : {
			unit : {
				configFile : 'test/karma.conf.js',
				background : true
			}
		},

		// -------------------------------------------------------------------------------------
		nodeunit : ['test/server/*_test.js'],

		// -------------------------------------------------------------------------------------
		notify : {
			watch : {
				options : {
					title : 'Tests ran',  // optional
					message : 'no errors found' //required
				}
			}
		},

		// -------------------------------------------------------------------------------------
		bumpup : ['package.json' ],

		// -------------------------------------------------------------------------------------
//		html2js : {
//			fixtures: {
//				src : ['test/browser/fixtures/*.html'],
//				dest: 'test/browser/fixtures.js'
//			}
//		}
		// -------------------------------------------------------------------------------------
		docco : {
			docs : {
				src : ['src/*.js', 'build/AdServ.js'],
				options : {
					output : 'build/docs/'
				}
			}
		},

		copy : {
			to_operation : {
				files : [
					{expand : true, cwd : 'build/', src : ['*.js'], dest : '../operation/api/v2/js/', filter : 'isFile'}
				]
			}
		}
	};

	// Project configuration.
	grunt.initConfig(config);

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-docco');
//	grunt.loadNpmTasks('grunt-notify');


	// https://github.com/Darsain/grunt-bumpup
	grunt.loadNpmTasks('grunt-bumpup');
	grunt.registerTask('updatePkg', function() {
		grunt.config.set('pkg', grunt.file.readJSON('package.json'));
	});
	grunt.registerTask('release', function(type) {
		type = type ? type : 'patch';     // Set the release type 
		grunt.task.run('bumpup:' + type); // Bump up the version 
		grunt.task.run('updatePkg');      // update package.json
		grunt.task.run('build');          // build
	});


//	grunt.registerMultiTask('html2js', function () {
//		function filenameToKey(filename) {
//			return (filename.split('/').pop()).split('.').shift();
//		}
//
//		// Merge task-specific and/or target-specific options with these defaults.
//		var options = this.options({ name: this.target, header: '/* generated <%= grunt.template.today("yyyy-mm-dd H:M:s") %> */\n' });
//
//
//		// Process header  
//		var header = grunt.template.process(options.header);
//
//		// Iterate over all src-dest file pairs.
//		this.files.forEach(function (f) {
//			// Concat banner + specified files + footer.
//			var map = {};
//
//			f.src.filter(function (filepath) {
//				// Warn on and remove invalid source files (if nonull was set).
//				if (!grunt.file.exists(filepath)) {
//					grunt.log.warn('Source file "' + filepath + '" not found.');
//					return false;
//				} else {
//					return true;
//				}
//			}).forEach(function (filepath) {
//				           // Read file source. 
//				           map[filenameToKey(filepath)] = grunt.file.read(filepath);
//			           });
//
//			// Write the destination file.
//			grunt.file.write(f.dest, header + '\nvar ' + options.name + ' = ' + JSON.stringify(map, null, true) + ';');
//
//			// Print a success message.
//			grunt.log.writeln('File "' + f.dest + '" created.');
//		});
//	});

	// Default task(s).
	grunt.registerTask('default', ['build']);
	grunt.registerTask('build', ['concat', 'uglify', 'docco']);
	grunt.registerTask('dev', ['concat', 'uglify', 'watch:normal']);
//	grunt.registerTask('doc', ['concat', 'uglify:docs', 'docco', 'watch:docs']);
	grunt.registerTask('doc', ['concat', 'docco', 'watch:docs']);
	grunt.registerTask('devop', ['concat', 'uglify', 'copy:to_operation', 'watch:operation']);

};
 