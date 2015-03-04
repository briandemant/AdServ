var child_process = require('child_process');
function dirtyGitFiles() {
	var raw = child_process.execSync('git status --porcelain 2>/dev/null').toString();
	if (raw == '') {
		return []
	} else {
		return raw.split("\n");
	}
}

module.exports = function(grunt) {
	var config = {
		pkg : grunt.file.readJSON('package.json'),
		fn : {
			commit : function() {
				var dirty = dirtyGitFiles();
				if (dirty.length > 0) {
					return 'After ' + child_process.execSync('git rev-parse HEAD').toString().replace('\n','') + ' (' + dirty.length + ')';
				} else {
					return child_process.execSync('git rev-parse HEAD').toString();
				}
			},
			devVersion : function() {
				var dirty = dirtyGitFiles();
				if (dirty.length > 0) {
					return '.dev (' + dirty.length + ' changed)';
				} else {
					return '';
				}
			},
			logLevels : function() {
				var dirty = dirtyGitFiles();
				return dirty.length > 0 ? '{error:1,warn:1,info:1,debug:1,events:1}' : '{error:1}';
			}
		},
		// -------------------------------------------------------------------------------------
		uglify : {
			max : {
				options : {
					banner : '/*! <%= pkg.name %>  <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %> */\n',
					beautify : false,
					mangle : true,
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
					.replace(/VERSION/g, '<%= pkg.version + fn.devVersion() %>')
					.replace(/COMMIT/g, '<%=  fn.commit() %>')
					.replace(/DEVELOP/g, '<%=  fn.devVersion() !== "" %>')
					.replace(/LOGLEVELS/g, '<%=  fn.logLevels() %>')
					.replace(/DATE/g, '<%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>'),
				footer : grunt.file.read('src/templates/footer.js.tmpl'),
				process : function(src, filepath) {
					return '\n\n\t/**\n  *  **' + filepath + '**\n  */\n\n // ----\n' +
					       src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1').replace(/(^|\n)/g, '$1\t').replace(/(\n\t){2,}/g, '\n\n\t') + '\n';
				}
			},
			responsive : {
				src : ['src/common/constants.js',
				       'src/common/debug.js',
				       'src/common/legacy.js',
				       'src/common/utils.js',
				       'src/common/ready.js',
				       'src/common/dom.js',
				       'src/common/json.js',
				       'src/common/event.js',
				       'src/common/ajax.js',
				       'src/common/flash.js',
				       'src/common/render.js',
				       'src/common/context.js',
				       'src/api/responsive.api.js',
				       'src/api/common.api.js'],
				dest : 'build/responsive.js'
			},
			adserv : {
				src : ['src/common/constants.js',
				       'src/common/debug.js',
				       'src/common/legacy.js',
				       'src/common/utils.js',
				       'src/common/ready.js',
				       'src/common/dom.js',
				       'src/common/json.js',
				       'src/common/event.js',
				       'src/common/ajax.js',
				       'src/common/flash.js',
				       'src/common/render.js',
				       'src/common/context.js',

				       'src/api/adserv.api.js',
				       'src/api/common.api.js'],
				dest : 'build/adserv.js'
			}
		},


		// -------------------------------------------------------------------------------------
		watch : {
			normal : {
				files : ['src/*.js', 'src/api/*.js', 'src/common/*.js', 'src/templates/*.js.tmpl'],
				tasks : ['concat']
			},
			diff : {
				files : ['src/*.js', 'src/api/*.js', 'src/common/*.js', 'src/templates/*.js.tmpl'],
				tasks : ['concat', 'comments', 'diff']
			},
			operation : {
				files : ['src/*.js', 'src/api/*.js', 'src/common/*.js', 'src/templates/*.js.tmpl'],
				tasks : ['concat', 'comments', 'uglify:max', 'copy:to_operation']
			},
			docs : {
				files : ['src/*.js', 'src/common/*.js', 'src/templates/*.js.tmpl', 'Usage.md'],
				tasks : ['concat', 'groc']
			},
			minify : {
				files : ['build/test.js'],
				tasks : ['uglify:max', 'output']
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
		comments : {
			plain : {
				// Target-specific file lists and/or options go here.
				options : {
					singleline : true,
					multiline : true
				},
				src : ['build/*.js', 'deployed/*.js'] // files to remove comments from
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
	grunt.registerTask('commitAll', function() {
		child_process.execSync('git commit -a -m"Released ' + grunt.config.get('pkg').version + '"');
	});

	// usage:
	// grunt release         <- patch   release
	// grunt release:minor   <- feature release
	// grunt release:major   <- major   release
	grunt.registerTask('release', function(type) {
		var dirty = dirtyGitFiles();
		if (dirty.length > 0) {
			throw new Error('cant release while ' + dirty.length + ' dirty files are present!\n')
		}
		type = type ? type : 'patch';     // Set the release type
		grunt.task.run('bumpup:' + type); // Bump up the version
		grunt.task.run('updatePkg');      // update package.json
		grunt.task.run('commitAll');      // update package.json 
		grunt.task.run('build');          // build
		grunt.task.run('copy');           // copy to deployed and operation dir
	});

	// Default task(s).
	grunt.registerTask('default', ['build']);
	grunt.registerTask('build', ['concat', 'comments', 'uglify']); 

	grunt.registerTask('dev', ['concat', 'comments', 'uglify', 'watch:normal']); 
	grunt.registerTask('devop', ['concat', 'comments', 'uglify', 'copy:to_operation', 'watch:operation']);

};
