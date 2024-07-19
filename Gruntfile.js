/*
 * grunt-contrib-qunit
 * https://gruntjs.com/
 *
 * Copyright (c) 2016 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

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
      allTests: ['test/*{1,2}.html'],
      individualTests: {
        files: [{
          src: 'test/*basic{1,2}.html'
        }]
      },
      urls: {
        options: {
          urls: [
            'http://localhost:9000/test/qunit_basic1.html'
          ]
        }
      },
      urlsAndFiles: {
        options: {
          urls: '<%= qunit.urls.options.urls %>'
        },
        src: 'test/*basic{1,2}.html'
      },
      noglobals: {
        options: {
          noGlobals: true,
          urls: [
            'http://localhost:9000/test/qunit_noglobals.html?foo=bar'
          ]
        }
      },
      modules: {
        options: {
          urls: [
            'http://localhost:9000/test/qunit_modules.html'
          ]
        }
      },
      seed: {
        options: {
          urls: [
            'http://localhost:9000/test/qunit_seed.html'
          ]
        }
      },
      circularObject: {
        options: {
          urls: [
            'http://localhost:9000/test/qunit_circular_object.html'
          ]
        }
      }
    },
    shell: {
      options: {
        callback: function(err, stdout, stderr, cb) {
          // qunit:modules, qunit:seed, qunit:circularObject
          if (/test\/(qunit_modules|qunit_seed|qunit_circular_object)\.html/.test(stdout) &&
              /[12] tests completed.*, with 0 failed/.test(stdout)) {
            cb(err === null);

          // qunit:failAssert
          } else if (/test\/qunit_fail_assert\.html/.test(stdout) &&
            stdout.includes(`>> example
>> Message: some message
>> Actual: false
>> Expected: true`)) {
            cb(err !== null);

          // qunit:failNoTests
          } else if (/test\/qunit_fail_notests\.html/.test(stdout) &&
            stdout.includes(`>> global failure
>> Message: No tests were run.`)) {
            cb(err !== null);

          // qunit:failPageTimeout
          } else if (/test\/qunit_page_timeout\.html/.test(stdout) &&
              /Chrome timed out/.test(stdout)) {
            cb(err !== null);

          // qunit:failPageError
          } else if (/test\/qunit_page_error\.html/.test(stdout) &&
              /ReferenceError: boom is not defined/.test(stdout) &&
              /at .*qunit_page_error.html:16/.test(stdout)) {
            cb(err !== null);

          // qunit:failCircularObject
          } else if (/test\/qunit_circular_object_fail\.html/.test(stdout) &&
              /Message: fail with circular actual\.\n>> Actual: \[object Object\]\n>> Expected: \{\}/.test(stdout) &&
              /Message: fail with circular expected\.\n>> Actual: \{\}\n>> Expected: \[object Object\]/.test(stdout)) {
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
      circularObject: {
        command: 'grunt qunit:circularObject'
      },
      failAssert: {
        command: 'grunt qunit:failAssert --with-failing'
      },
      failNoTests: {
        command: 'grunt qunit:failNoTests --with-failing'
      },
      failCircularObject: {
        command: 'grunt qunit:failCircularObject --with-failing'
      },
      failPageError: {
        command: 'grunt qunit:failPageError --with-failing'
      },
      failPageTimeout: {
        command: 'grunt qunit:failPageTimeout --with-failing'
      }
    }

  });

  // Only register these tasks for the shell task that expects the failure
  if (grunt.option('with-failing')) {
    grunt.config.set('qunit.failAssert', {
      options: {
        urls: [
          'http://localhost:9000/test/qunit_fail_assert.html'
        ]
      }
    });
    grunt.config.set('qunit.failNoTests', {
      options: {
        urls: [
          'http://localhost:9000/test/qunit_fail_notests.html'
        ]
      }
    });
    grunt.config.set('qunit.failCircularObject', {
      options: {
        urls: [
          'http://localhost:9000/test/qunit_circular_object_fail.html'
        ]
      }
    });
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
  grunt.event.on('qunit.on.runEnd', function(runEnd) {
    if (runEnd.status === 'passed') {
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
      'test/qunit_basic1.html': 3,
      'test/qunit_basic2.html': 3,
      'http://localhost:9000/test/qunit_basic1.html': 2,
      'http://localhost:9000/test/qunit_noglobals.html?foo=bar&noglobals=true': 1,
      'http://localhost:9000/test/qunit_modules.html': 1,
      'http://localhost:9000/test/qunit_seed.html': 1,
      'http://localhost:9000/test/qunit_circular_object.html': 1
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
  grunt.registerTask('default', ['test', 'contrib-core', 'contrib-ci:skipIfExists']);

};
