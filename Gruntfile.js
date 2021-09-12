/*
 * grunt-contrib-qunit
 * https://gruntjs.com/
 *
 * Copyright (c) 2016 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // If we are running in CI, we need some puppeteer arguments
  // to be set on every task.
  function getGlobalOptions() {
    if (process.env.CI) {
      return {
        puppeteer: {
          args: [
            "--no-sandbox"
          ]
        }
      };
    }
  }

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/**/*.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Create a local web server for testing http:// URIs.
    connect: {
      rootServer: {
        options: {
          port: 9000,
          base: '.'
        }
      }
    },

    // Unit tests.
    qunit: {
      options: getGlobalOptions(),
      allTests: ['test/*{1,2}.html'],
      individualTests: {
        files: [{
          src: 'test/*{1,2}.html'
        }]
      },
      urls: {
        options: {
          urls: [
            'http://localhost:9000/test/qunit1.html'
          ]
        }
      },
      urlsAndFiles: {
        options: {
          urls: '<%= qunit.urls.options.urls %>'
        },
        src: 'test/*{1,2}.html'
      },
      noglobals: {
        options: {
          noGlobals: true,
          urls: [
            'http://localhost:9000/test/qunit3.html?foo=bar'
          ]
        }
      },
      modules: {
        options: {
          urls: [
            'http://localhost:9000/test/qunit4.html'
          ]
        }
      },
      seed: {
        options: {
          urls: [
            'http://localhost:9000/test/qunit5.html'
          ]
        }
      }
    },
    shell: {
      options: {
        callback: function(err, stdout, stderr, cb) {
          if (/test\/qunit[45]\.html/.test(stdout) &&
              /passed: [12]/.test(stdout)) {
            // qunit:modules, qunit:seed
            cb(err === null);

          } else if (/test\/qunit_page_timeout\.html/.test(stdout) &&
              /Chrome timed out/.test(stdout)) {
            // qunit:failPageTimeout
            cb(err !== null);

          } else if (/test\/qunit_page_error\.html/.test(stdout) &&
              /ReferenceError: boom is not defined/.test(stdout)) {
            // qunit:failPageError
            cb(err !== null);
          } else {
            cb(false);
          }
        },
        preferLocal: true
      },
      modules: {
        command: 'grunt qunit:modules --modules="module1"'
      },
      seed: {
        command: 'grunt qunit:seed --seed="7x9"'
      },
      failPageError: {
        command: 'grunt qunit:failPageError --with-failpage'
      },
      failPageTimeout: {
        command: 'grunt qunit:failPageTimeout --with-failpage'
      }
    }

  });

  // Only register these tasks for the shell task that expects the failure
  if (grunt.option('with-failpage')) {
    grunt.config.set('qunit.failPageError', {
      options: {
        urls: [
          'http://localhost:9000/test/qunit_page_error.html'
        ]
      }
    });
    grunt.config.set('qunit.failPageTimeout', {
      options: {
        urls: [
          'http://localhost:9000/test/qunit_page_timeout.html'
        ]
      }
    });
  }

  // Build a mapping of url success counters.
  var successes = {};
  var currentUrl;
  grunt.event.on('qunit.spawn', function(url) {
    currentUrl = url;
    if (!successes[currentUrl]) {
      successes[currentUrl] = 0;
    }
  });
  grunt.event.on('qunit.done', function(failed, passed, total) {
    if (failed === 0 && passed === total) {
      successes[currentUrl]++;
    } else {
      successes[currentUrl] -= 100;
    }
  });

  grunt.registerTask('really-test', 'Test to see if qunit task actually worked.', function() {
    var assert = require('assert');
    var difflet = require('difflet')({indent: 2, comment: true});
    var actual = successes;
    var expected = {
      'test/qunit1.html': 3,
      'test/qunit2.html': 3,
      'http://localhost:9000/test/qunit1.html': 2,
      'http://localhost:9000/test/qunit3.html?foo=bar&noglobals=true': -100,
      'http://localhost:9000/test/qunit4.html': 1,
      'http://localhost:9000/test/qunit5.html': 1
    };
    try {
      assert.deepEqual(actual, expected, 'Actual should match expected.');
    } catch (err) {
      grunt.log.subhead('Actual should match expected.');
      console.log(difflet.compare(expected, actual));
      throw new Error(err.message);
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-internal');
  grunt.loadNpmTasks('grunt-shell');

  // Whenever the "test" task is run, run some basic tests.
  grunt.registerTask('test', ['jshint', 'connect', 'qunit', 'shell', 'really-test']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['test', 'contrib-ci:skipIfExists', 'contrib-core']);

};
