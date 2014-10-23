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
					'build/responsive.min.js' : ['build/responsive.js'],
					'build/adserv.min.js' : ['build/adserv.js']
				}
			}
		},

		// -------------------------------------------------------------------------------------
		concat : {
			options : {
				banner : grunt.file.read('src/templates/header.js.tmpl')
					.replace(/VERSION/g, '<%= pkg.version %>')
					.replace(/DATE/g, '<%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>'),
				footer : grunt.file.read('src/templates/footer.js.tmpl'),
				process : function(src, filepath) {
					return '\n\n\t/**\n  *  **' + filepath + '**\n  */\n\n // ----\n' +
					       src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1').replace(/(^|\n)/g, '$1\t').replace(/(\n\t){2,}/g, '\n\n\t') + '\n';
				}
			},
			responsive : {
//				src : ['src/flash.js'],
//				src : ['src/{legacy}.js'],
				src : ['src/common/constants.js', 'src/common/legacy.js', 'src/common/utils.js', 'src/common/ready.js', 'src/common/{dom,json,event,ajax,flash,render}.js', 'src/api/responsive.js'],
//				src : ['src/*.js'],
				dest : 'build/responsive.js'
			},
			adserv : {
//				src : ['src/flash.js'],
//				src : ['src/{legacy}.js'],
				src : ['src/common/constants.js', 'src/common/legacy.js', 'src/common/utils.js', 'src/common/ready.js', 'src/common/{dom,json,event,ajax,flash,render}.js', 'src/api/adserv.js'],
//				src : ['src/*.js'],
				dest : 'build/adserv.js'
			}
		},


		// -------------------------------------------------------------------------------------
		watch : {
			normal : {
				files : ['src/*.js', 'src/api/*.js', 'src/common/*.js', 'src/templates/*.js.tmpl'],
				tasks : ['concat', 'uglify:max'],
				options : {
//					nospawn: true,
//					forever: true
				}
			},
			operation : {
				files : ['src/*.js', 'src/api/*.js', 'src/common/*.js', 'src/templates/*.js.tmpl'],
				tasks : ['concat', 'uglify:max', 'copy:to_operation'],
				options : {
//					nospawn: true,
//					forever: true
				}
			},
			docs : {
				files : ['src/*.js', 'src/common/*.js', 'src/templates/*.js.tmpl', 'Usage.md'],
				tasks : ['concat', 'groc'],
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
		bumpup : ['package.json'],

		// -------------------------------------------------------------------------------------
//		html2js : {
//			fixtures: {
//				src : ['test/browser/fixtures/*.html'],
//				dest: 'test/browser/fixtures.js'
//			}
//		}
		// -------------------------------------------------------------------------------------
		groc : {
			javascript : ['Usage.md', 'src/*.js', 'build/adserv.js', 'build/responsive.js'],
			options : {
				out : 'build/docs/'
			}
		},

		// -------------------------------------------------------------------------------------
		comments : {
			plain : {
				// Target-specific file lists and/or options go here.
				options : {
					singleline : true,
					multiline : true
				},
				src : ['build/*.js'] // files to remove comments from
			}
		},
		// -------------------------------------------------------------------------------------
		copy : {
			to_operation : {
				files : [
					{expand : true, cwd : 'build/', src : ['*.js'], dest : '../operation/api/v2/js/', filter : 'isFile'}
				]
			},
			to_deployed : {
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
	grunt.loadNpmTasks('grunt-stripcomments');
	//grunt.loadNpmTasks('grunt-karma');


	// https://github.com/Darsain/grunt-bumpup
	grunt.loadNpmTasks('grunt-bumpup');
	grunt.registerTask('updatePkg', function() {
		grunt.config.set('pkg', grunt.file.readJSON('package.json'));
	});

	// usage:
	// grunt release         <- patch release
	// grunt release:minor   <- minor release
	// grunt release:mmajor  <- major release
	grunt.registerTask('release', function(type) {
		type = type ? type : 'patch';     // Set the release type 
		grunt.task.run('bumpup:' + type); // Bump up the version 
		grunt.task.run('updatePkg');      // update package.json
		grunt.task.run('build');          // build
		grunt.task.run('copy');           // copy to deployed and operation dir
	});


	grunt.registerTask('groc', 'Generate documentation', function() {
		var done = this.async();
		grunt.log.write('Generating Documentation...');
		var args = ['-o', 'docs',
		            '-i', 'Usage.md',
		            '-t', 'build',
		            'Usage.md',
		            'src/api/*.js',
		            'src/common/*.js',
		            'build/responsive.js',
		            'build/adserv.js'
		];
		require('child_process').spawn('./node_modules/groc/bin/groc',
		                               args).on('exit', function(err) {
			                                        if (err) {
				                                        throw "Could not generate docs\n ./node_modules/groc/bin/groc " + args.join(" ");
			                                        }

			                                        grunt.log.writeln('...done!');
			                                        done();
		                                        })
	});


	// Default task(s).
	grunt.registerTask('default', ['build']);
	grunt.registerTask('build', ['concat', 'comments', 'uglify']);
	grunt.registerTask('docs', ['concat', 'groc']);

	grunt.registerTask('dev', ['concat', 'comments', 'uglify', 'watch:normal']);
	grunt.registerTask('devdocs', ['docs', 'watch:docs']);
	grunt.registerTask('devop', ['concat', 'uglify', 'copy:to_operation', 'watch:operation']);

};
 