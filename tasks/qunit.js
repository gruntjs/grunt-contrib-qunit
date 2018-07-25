/*
 * grunt-contrib-qunit
 * http://gruntjs.com/
 *
 * Copyright (c) 2016 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

'use strict';

// Nodejs libs.
var fs = require('fs');
var path = require('path');
var url = require('url');
var EventEmitter2 = require('eventemitter2');
// NPM libs.
var Promise = require('bluebird');
var puppeteer = require('puppeteer');

// Shared functions

// Allow an error message to retain its color when split across multiple lines.
function formatMessage (str) {
  return String(str).split('\n')
    .map(function(s) {
      return s.magenta;
    })
    .join('\n');
}


function createStatus () {
  return {
    passed: 0,
    failed: 0,
    skipped: 0,
    todo: 0,
    runtime: 0,
    assertions: {
      passed: 0,
      failed: 0
    }
  };
}

function mergeStatus(statusA, statusB) {
  statusA.passed += statusB.passed;
  statusA.failed += statusB.failed;
  statusA.skipped += statusB.skipped;
  statusA.todo += statusB.todo;
  statusA.runtime += statusB.runtime;
  statusA.assertions.passed += statusB.assertions.passed;
  statusA.assertions.failed += statusB.assertions.failed;
}

function generateMessage(status) {
  var totalTests = status.passed + status.failed + status.skipped + status.todo;
  var totalAssertions = status.assertions.passed + status.assertions.failed;

  return [
    totalTests,
    ' tests completed with ',
    status.failed,
    ' failed, ' +
    status.skipped,
    ' skipped, and ',
    status.todo,
    ' todo. \n' +
    totalAssertions,
    ' assertions (in ',
    status.runtime,
    'ms), passed: ' +
    status.assertions.passed,
    ', failed: ',
    status.assertions.failed
  ].join('');
}

// Copied from QUnit source code
function generateHash (module) {
  var hex;
  var i = 0;
  var hash = 0;
  var str = module + '\x1C' + undefined;
  var len = str.length;

  for (; i < len; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }

  // Convert the possibly negative integer hash code into an 8 character
  // hex string, which isn't strictly necessary but increases user understanding
  // that the id is a SHA-like hash
  hex = (0x100000000 + hash).toString(16);
  if (hex.length < 8) {
    hex = '0000000' + hex;
  }

  return hex.slice(-8);
}

function getFullUrl(url) {
  if ((url.length < 4) || (url.substring(0,4) !== 'http')) {
    return 'file://' + path.resolve(__dirname, '..', url);
  } else {
    return url;
  }
}

module.exports = function(grunt) {

  var eventBus = new EventEmitter2({wildcard: true, maxListeners: 0});

  // Keep track of the last-started module and test. Additionally, keep track
  // of status for individual test files and the entire test suite.
  var options;
  var puppeteerLaunchOptions;
  var currentModule;
  var currentTest;
  var currentStatus;
  var status;
  var browser;
  var page;

  // Keep track of the last-started test(s).
  var unfinished = {};

  // Get an asset file, local to the root of the project.
  var asset = path.join.bind(null, __dirname, '..');

  // If options.force then log an error, otherwise exit with a warning
  function warnUnlessForced (message) {
    if (options && options.force) {
      grunt.log.error(message);
    } else {
      grunt.warn(message);
    }
  }

  // Keep track of failed assertions for pretty-printing.
  var failedAssertions = [];
  function logFailedAssertions () {
    var assertion;

    if (options && options.summaryOnly) {
      return;
    }

    // Print each assertion error.
    while (assertion = failedAssertions.shift()) {
      grunt.verbose.or.error(assertion.testName);
      grunt.log.error('Message: ' + formatMessage(assertion.message));
      if (assertion.actual !== assertion.expected) {
        grunt.log.error('Actual: ' + formatMessage(assertion.actual));
        grunt.log.error('Expected: ' + formatMessage(assertion.expected));
      }
      if (assertion.source) {
        grunt.log.error(assertion.source.replace(/ {4}(at)/g, '  $1'));
      }
      grunt.log.writeln();
    }
  }


  // QUnit hooks.
  eventBus.on('qunit.begin', function() {
    currentStatus = createStatus();
  });

  eventBus.on('qunit.moduleStart', function(name) {
    unfinished[name] = true;
    currentModule = name;
  });

  eventBus.on('qunit.moduleDone', function(name) {
    delete unfinished[name];
  });

  eventBus.on('qunit.log', function(result, actual, expected, message, source, todo) {
    if (!result && !todo) {
      failedAssertions.push({
        actual: actual,
        expected: expected,
        message: message,
        source: source,
        testName: currentTest
      });
    }
  });

  eventBus.on('qunit.testStart', function(name) {
    currentTest = (currentModule ? currentModule + ' - ' : '') + name;
    grunt.verbose.write(currentTest + '...');
  });

  eventBus.on('qunit.testDone', function(name, failed, passed, total, runtime, skipped, todo) {
    var testPassed = failed > 0 ? todo : !todo;

    if (skipped) {
      currentStatus.skipped++;
    } else if (!testPassed) {
      currentStatus.failed++;
    } else if (todo) {
      currentStatus.todo++;
    } else {
      currentStatus.passed++;
    }

    // Log errors if necessary, otherwise success.
    if (testPassed) {
      grunt.verbose.ok().or.write('.');
      // list assertions or message about todo failure
    } else if (grunt.option('verbose')) {
      grunt.log.error();

      if (todo) {
        grunt.log.error('Expected at least one failing assertion in todo test:' + name);
      } else {
        logFailedAssertions();
      }
    } else {
      grunt.log.write('F'.red);
    }
  });

  eventBus.on('qunit.done', function(failed, passed, total, runtime) {

    currentStatus.runtime += runtime;
    currentStatus.assertions.passed += passed;
    currentStatus.assertions.failed += failed;

    // Print assertion errors here, if verbose mode is disabled.
    if (!grunt.option('verbose')) {
      if (currentStatus.failed > 0) {
        grunt.log.writeln();
        logFailedAssertions();
      } else {
        grunt.log.ok();
      }
    }

    mergeStatus(status, currentStatus);
  });



  // Re-broadcast qunit events on grunt.event.
  eventBus.on('qunit.*', function() {
    var args = [this.event].concat(grunt.util.toArray(arguments));
    grunt.event.emit.apply(grunt.event, args);
  });

  // Built-in error handlers.
  eventBus.on('fail.load', function(url) {
    grunt.verbose.write('...');
    grunt.event.emit('qunit.fail.load', url);
    grunt.log.error('Chrome unable to load \'' + url + '\' URI.');

    status.failed += 1;
  });

  eventBus.on('fail.timeout', function() {
    grunt.log.writeln();
    grunt.event.emit('qunit.fail.timeout');
    grunt.log.error('Chrome timed out, possibly due to:\n' +
        '- QUnit is not loaded correctly.\n- A missing QUnit start() call.\n' +
        '- Or, a misconfiguration of this task.');

    status.failed += 1;
  });

  eventBus.on('error.onError', function (msg, stackTrace) {
    grunt.event.emit('qunit.error.onError', msg, stackTrace);
  });

  grunt.registerMultiTask('qunit', 'Run QUnit unit tests in a headless Chrome instance.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    options = this.options({
      // Default Chrome timeout.
      timeout: 5000,
      // QUnit-Chrome bridge file to be injected.
      inject: asset('chrome/bridge.js'),
      // Explicit non-file URLs to test.
      urls: [],
      force: false,
      // Connect Chrome console output to Grunt output
      console: true,
      // Do not use an HTTP base by default
      httpBase: false,
      summaryOnly: false
    });
    puppeteerLaunchOptions = options.puppeteer || {};

    // This task is asynchronous.
    var done = this.async();
    var urls;
    var bridgeFile = fs.readFileSync(options.inject, 'utf8');

    if (!bridgeFile) {
      grunt.fail.fatal('Could not load the specified Chrome/QUnit bridge file.');
      done(false);
      return;
    }

    if (options.httpBase) {
      // If URLs are explicitly referenced, use them still
      urls = options.urls;
      // Then create URLs for the src files
      this.filesSrc.forEach(function(testFile) {
        urls.push(options.httpBase + '/' + testFile);
      });
    } else {
      // Combine any specified URLs with src files.
      urls = options.urls.concat(this.filesSrc);
    }

    // The final tasks to run before terminating the task
    function finishTask(success) {
      // Close the puppeteer browser
      if (browser) {
        browser.close();
      }
      // Finish the task
      done(success);
    }

    function appendToUrls (queryParam, value) {
      // Append the query param to all urls
      urls = urls.map(function(testUrl) {
        var parsed = url.parse(testUrl, true);
        parsed.query[queryParam] = value;
        delete parsed.search;
        return url.format(parsed);
      });
    }

    if (options.noGlobals) {
      // Append a noglobal query string param to all urls
      appendToUrls('noglobals', 'true');
    }

    if (grunt.option('modules')) {
      var modules = grunt.option('modules').split(',');
      var hashes = modules.map(function(module) {
        return generateHash(module.trim());
      });
      // Append moduleId to all urls
      appendToUrls('moduleId', hashes);
    }

    if (grunt.option('seed')) {
      // Append seed to all urls
      appendToUrls('seed', grunt.option('seed'));
    }

    // Reset status.
    status = createStatus();

    // Instantiate headless browser
    puppeteer.launch(Object.assign({
      headless: true,
    }, puppeteerLaunchOptions))
      .then(function(b) {
        browser = b;
        return b.newPage();
      })
      .then(function(p) {
        page = p;
        // emit events published in bridge.js.
        // This function exposure survives url navigations.
        return page.exposeFunction('__grunt_contrib_qunit__', function() {
          eventBus.emit.apply(eventBus, [].slice.call(arguments));
        });
      })
      .then(function() {
        // Pass through the console logs if instructed
        if (options.console) {
          page.on('console', function() {
            var args = [].slice.apply(arguments);
            var colors = {
              'error': 'red',
              'warning': 'yellow'
            };
            for (var i = 0; i < args.length; ++i) {
              var txt = args[i].text();
              var color = colors[args[i].type()];
              grunt.log.writeln(color ? txt[color] : txt);  
            }
          });
        }

        // Surface uncaught exceptions
        page.on('pageerror', function() {
          var args = [].slice.apply(arguments);
          for (var i = 0; i < args.length; i++) {
            eventBus.emit('error.onError', args[i]);
          }
        });

        // Whenever a page is loaded with a new document, before scripts execute, inject the bridge file.
        // Tell the client that when DOMContentLoaded fires, it needs to tell this
        // script to inject the bridge. This should ensure that the bridge gets
        // injected before any other DOMContentLoaded or window.load event handler.
        page.evaluateOnNewDocument('if (window.QUnit) {\n' + bridgeFile + '\n} else {\n' + 'document.addEventListener("DOMContentLoaded", function() {\n' + bridgeFile + '\n});\n}\n');

        return Promise.mapSeries(urls, function(url) {
          // Reset current module.
          currentModule = null;
          grunt.event.emit('qunit.spawn', url);
          grunt.verbose.subhead('Testing ' + url + ' ').or.write('Testing ' + url + ' ');

          return Promise.all([
            // Setup listeners for qunit.done / fail events
            new Promise(function(resolve, reject) {
              eventBus.once('qunit.done', function() {
                setTimeout(resolve, 1);
              });
              eventBus.once('fail.*', function() {
                setTimeout(function() {
                  reject(url);
                }, 1);
              });
            }),
            // Navigate to the url to be tested
            page.goto(getFullUrl(url), {
              timeout: options.timeout
            })
          ]);
        });
      })
      .then(function() {
        // All tests have been run.
        var message = generateMessage(status);
        var success;

        // Log results.
        if (status.failed > 0) {
          warnUnlessForced(message);
        } else {
          grunt.verbose.writeln();
          grunt.log.ok(message);
        }

        if (options && options.force) {
          success = true;
        } else {
          success = status.failed === 0;
        }
        // All done!
        finishTask(success);
      })
      .catch(function(err) {
        // If anything goes wrong, terminate the grunt task
        grunt.log.error("There was an error with headless chrome");
        grunt.fail.fatal(err);
        finishTask(false);
      });
  });

};
