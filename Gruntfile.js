module.exports = function (grunt) {
	var config = {
		pkg     : grunt.file.readJSON('package.json'),
		// -------------------------------------------------------------------------------------
		uglify  : {
			options: {
				banner: '/*! <%= pkg.name %>  <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %> */\n'
			},
			build  : {
				src : 'build/<%= pkg.name %>.js',
				dest: 'build/<%= pkg.name %>.min.js'
			}
		},

		// -------------------------------------------------------------------------------------
		concat  : {
			options: {
				banner : grunt.file.read('src/header.js.tmpl').replace('VERSION', '<%= pkg.version %>'),
				footer : grunt.file.read('src/footer.js.tmpl'),
				process: function (src, filepath) {
					return '\n\n\t// Source: ' + filepath + '\n\t// -----------------------------------------------------------------------------\n' +
					       src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1').replace(/(^|\n)/g, '$1\t').replace(/(\n\t){2,}/g, '\n\n\t') + '\n';
				}
			},
			dist   : {
//				src : ['src/{xxx}.js'],
				src : ['src/{json,event}.js'],
//				src : ['src/*.js'],
				dest: 'build/<%= pkg.name %>.js'
			}
		},


		// -------------------------------------------------------------------------------------
		watch   : {
			src     : {
				files  : ['src/*.js', 'src/*.js.tmpl'],
				tasks  : ['concat', 'uglify'],
				options: {
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
		karma   : {
			unit: {
				configFile: 'test/karma.conf.js',
				background: true
			}
		},

		// -------------------------------------------------------------------------------------
		nodeunit: ['test/server/*_test.js'],

		// -------------------------------------------------------------------------------------
		notify  : {
			watch: {
				options: {
					title  : 'Tests ran',  // optional
					message: 'no errors found' //required
				}
			}
		},

		// -------------------------------------------------------------------------------------
		bumpup  : ['package.json' ],

		// -------------------------------------------------------------------------------------
//		html2js : {
//			fixtures: {
//				src : ['test/browser/fixtures/*.html'],
//				dest: 'test/browser/fixtures.js'
//			}
//		}

	};

	// Project configuration.
	grunt.initConfig(config);

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch'); 
	grunt.loadNpmTasks('grunt-karma');
//	grunt.loadNpmTasks('grunt-notify');


	// https://github.com/Darsain/grunt-bumpup
	grunt.loadNpmTasks('grunt-bumpup');
	grunt.registerTask('updatePkg', function () {
		grunt.config.set('pkg', grunt.file.readJSON('package.json'));
	});
	grunt.registerTask('release', function (type) {
		type = type ? type : 'patch';     // Set the release type 
		grunt.task.run('bumpup:' + type); // Bump up the version 
		grunt.task.run('updatePkg');          // build
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
	grunt.registerTask('build', ['concat', 'uglify']);
	grunt.registerTask('dev', ['concat', 'uglify',   'watch']);

};
 