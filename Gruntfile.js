/*jshint node: true, camelcase: false */

module.exports = function (grunt) {
	'use strict';

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-curl');
	grunt.loadNpmTasks('grunt-if-missing');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadTasks('build/tasks');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		concat: {
			kensington: {
				src: ['lib/intro.stub',
					'bower_components/ks-common-functions/dist/ks-cf.js',
					'bower_components/rule-engine/dist/dqre.js',
					'bower_components/ks-rules/dist/rules.js',
					'lib/outro.stub'
				],
				dest: 'build/kensington.js',
				options: {
					process: true
				}
			}
		},
		uglify: {
			lib: {
				files: [{
					src: ['<%= concat.kensington.dest %>'],
					dest: 'dist/kensington.min.js'
				}],
				options: {
					banner: '/*!\n * Copyright (C) ' + new Date().getFullYear() +
						' Deque Systems Inc. All Rights Reserved\n * v<%=pkg.version %>\n */\n'
				}
			}
		},
		copy: {
			docs: {
				src: ['doc/**/*'],
				dest: 'dist/'
			},
			rspec: {
				src: ['*.gem'],
				expand: true,
				cwd: 'bower_components/ks-testdouble/dist/',
				dest: 'dist/doc/examples/rspec-a11y/'
			},
			fixture: {
				src: 'kensington.min.js',
				expand: true,
				cwd: 'dist',
				dest: 'dist/doc/examples/rspec-a11y/features/fixtures/public/'
			},
			descriptions: {
				src: ['*.html'],
				expand: true,
				cwd: 'bower_components/ks-rules/dist/',
				dest: 'dist/doc/'
			}
		},
		watch: {
			files: ['<%= concat.kensington.src %>', '<%= testconfig.test.src %>', '<%= copy.docs.src %>'],
			tasks: ['build']
		},
		mochaTest: {
			test: {
				options: {
					reporter: grunt.option('report') ? 'xunit' : 'spec',
					captureFile: grunt.option('report') ? 'dist/xunit.xml' : undefined,
					grep: grunt.option('grep')
				},
				src: ['test/integration/testrunner.js']
			}
		},
		testconfig: {
			test: {
				src: ['test/integration/rules/**/*.json'],
				dest: 'build/test.json',
				options: {
					port: '<%= connect.test.options.port %>',
					seleniumServer: grunt.option('selenium')
				}
			}
		},
		curl: {
			selenium: {
				dest: 'build/selenium-server-standalone-2.45.0.jar',
				src: 'http://selenium-release.storage.googleapis.com/2.45/selenium-server-standalone-2.45.0.jar'
			}
		},
		connect: {
			test: {
				options: {
					hostname: '0.0.0.0',
					port: grunt.option('port') || 9876,
					base: ['.']
				}
			}
		},
		jshint: {
			rules: {
				options: {
					jshintrc: true,
					reporter: grunt.option('report') ? 'checkstyle' : undefined,
					reporterOutput: grunt.option('report') ? 'lint.xml' : undefined
				},
				src: ['test/**/*.js', 'build/tasks/**/*.js', 'doc/**/*.js', 'Gruntfile.js']
			}
		}
	});

	grunt.registerTask('default', ['build']);
	grunt.registerTask('build', ['concat', 'uglify', 'copy']);
	grunt.registerTask('test', ['build', 'if-missing:curl', 'testconfig', 'connect', 'mochaTest']);
};