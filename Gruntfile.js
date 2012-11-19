/*
 * grunt-contrib-qunit
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/**/*.js',
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Unit tests.
    qunit: {
      all_tests: ['test/*.html'],
      individual_tests: {
        files: [
          {src: 'test/*1.html'},
          {src: 'test/*{1,2}.html'},
          {src: 'test/*.html'},
        ]
      }
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-internal');

  // The "test" task is just an alias for the default task.
  grunt.registerTask('test', ['default']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'qunit', 'build-contrib']);

};