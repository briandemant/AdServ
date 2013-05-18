module.exports = function (grunt) {
	var config = {
		pkg     : grunt.file.readJSON('package.json'),
		// -------------------------------------------------------------------------------------
		uglify  : {
			options: {
				banner: '/*! <%= pkg.name %>  <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd H:M:s") %> */\n'
			},
			build  : {
				src : 'build/<%= pkg.name %>.js',
				dest: 'build/<%= pkg.name %>.min.js'
			}
		},

		// -------------------------------------------------------------------------------------
		concat  : {
			options: {
				banner : grunt.file.read('src/banner.js.tmpl').replace('VERSION', '<%= pkg.version %>'),
				footer : grunt.file.read('src/footer.js.tmpl'),
				process: function (src, filepath) {
					return '\n\t// Source: ' + filepath + '\n' +
					       src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1').replace(/(^|\n)/g, '$1\t') + '\n';
				}
			},
			dist   : {
				src : ['src/*.js'],
				dest: 'build/<%= pkg.name %>.js'
			}
		},


		// -------------------------------------------------------------------------------------
		watch   : {
			src  : {
				files  : ['src/*.js'],
				tasks  : ['concat', 'uglify'],
				options: {
					nospawn: true
				}
			},
			tests: {
				files  : ['src/*.js*', 'test/*.js'],
				tasks  : ['concat', 'uglify', 'nodeunit', 'notify' ],
				options: {
					forever: true
				}
			}
		},

		// -------------------------------------------------------------------------------------
		nodeunit: ['test/*_test.js'],

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
		bumpup  :   ['package.json' ] 

		
	};

	// Project configuration.
	grunt.initConfig(config);

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');
	grunt.loadNpmTasks('grunt-notify'); 

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


	// Default task(s).
	grunt.registerTask('default', ['build']);
	grunt.registerTask('build', ['concat', 'uglify']);
	grunt.registerTask('dev', ['concat', 'uglify', 'watch:tests']);

};