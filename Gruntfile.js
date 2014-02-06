/*
 * grunt-contrib-qunit
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  var path = require("path");
  // Get an asset file, local to the root of the project.
  var asset = path.join.bind(null, __dirname, '');

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

    // Create a local web server for testing http:// URIs.
    connect: {
      root_server: {
        options: {
          port: 9000,
          base: '.',
        },
      },
      test_server: {
        options: {
          port: 9001,
          base: 'test',
        },
      }
    },

    // Unit tests.
    qunit: {
      all_tests: ['test/*{1,2}.html'],
      individual_tests: {
        files: [
          {src: 'test/*1.html'},
          {src: 'test/*{1,2}.html'},
        ]
      },
      urls: {
        options: {
          urls: [
            'http://localhost:9000/test/qunit1.html',
            'http://localhost:9001/qunit2.html',
          ]
        },
      },
      urls_and_files: {
        options: {
          urls: '<%= qunit.urls.options.urls %>',
        },
        src: 'test/*{1,2}.html',
      },
      junit_report: {
        options: {
          outputDir:'tmp/junit_tests',
          inject:asset('phantomjs/junit-bridge.js'),
          urls: '<%= qunit.urls.options.urls %>',
          type: 'junit',
        },
        src: 'test/*{1,2}.html',
      },
      tap_report: {
        options: {
          outputDir:'tmp/tap_tests',
          inject:asset('phantomjs/tap-bridge.js'),
          urls: '<%= qunit.urls.options.urls %>',
          type: 'tap',
        },
        src: 'test/*{1,2}.html',
      },
    }

  });

  // Build a mapping of url success counters.
  var successes = {};
  var currentUrl;
  grunt.event.on('qunit.spawn', function(url) {
    currentUrl = url;
    if (!successes[currentUrl]) { successes[currentUrl] = 0; }
  });
  grunt.event.on('qunit.done', function(failed, passed) {
    if (failed === 0 && passed === 2) { successes[currentUrl]++; }
  });

  grunt.registerTask('really-test', 'Test to see if qunit task actually worked.', function() {
    var assert = require('assert');
    var difflet = require('difflet')({indent: 2, comment: true});
    var actual = successes;
    var expected = {
      'test/qunit1.html': 5,
      'test/qunit2.html': 5,
      'http://localhost:9000/test/qunit1.html': 4,
      'http://localhost:9001/qunit2.html': 4
    };
    try {
      assert.deepEqual(actual, expected, 'Actual should match expected.');
    } catch (err) {
      grunt.log.subhead('Actual should match expected.');
      console.log(difflet.compare(expected, actual));
      throw new Error(err.message);
    }
  });

  grunt.registerTask('junit-test', 'Test junit report generation.', function() {
    var assert = require('assert');
    var reports = [
      "tmp/junit_tests/test/qunit1.xml",
      "tmp/junit_tests/qunit2.xml"
    ];
    try {
      for( var n in reports ){
        assert.deepEqual(grunt.file.exists(reports[n]), true, 'jUnit reports must exist '+reports[n]+'.');
        assert.deepEqual(grunt.file.read(reports[n]).length>0, true, 'jUnit reports must not be empty '+reports[n]+'.');
      }
    } catch (err) {
      grunt.log.subhead('Actual should match expected.');
      throw new Error(err.message);
    }
  });

  grunt.registerTask('tap-test', 'Test tap report generation.', function() {
    var assert = require('assert');
    var reports = [
      "tmp/tap_tests/test/qunit1.tap",
      "tmp/tap_tests/qunit2.tap"
    ];
    try {
      for( var n in reports ){
        assert.deepEqual(grunt.file.exists(reports[n]), true, 'tap reports must exist '+reports[n]+'.');
        assert.deepEqual(grunt.file.read(reports[n]).length>0, true, 'tap reports must not be empty '+reports[n]+'.');
      }
    } catch (err) {
      grunt.log.subhead('Actual should match expected.');
      throw new Error(err.message);
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-internal');

  // Whenever the "test" task is run, run some basic tests.
  grunt.registerTask('test', ['connect', 'qunit', 'really-test','junit-test', 'tap-test']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test', 'build-contrib']);

};