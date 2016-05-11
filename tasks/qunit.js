/*
 * grunt-contrib-qunit
 * http://gruntjs.com/
 *
 * Copyright (c) 2016 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Nodejs libs.
  var path = require('path');
  var url = require('url');

  // External lib.
  var phantomjs = require('grunt-lib-phantomjs').init(grunt);

  // Keep track of the last-started module, test and status.
  var options, currentModule, currentTest, status;
  // Keep track of the last-started test(s).
  var unfinished = {};

  // Get an asset file, local to the root of the project.
  var asset = path.join.bind(null, __dirname, '..');

  // Allow an error message to retain its color when split across multiple lines.
  var formatMessage = function(str) {
    return String(str).split('\n').map(function(s) { return s.magenta; }).join('\n');
  };

  // If options.force then log an error, otherwise exit with a warning
  var warnUnlessForced = function (message) {
    if (options && options.force) {
      grunt.log.error(message);
    } else {
      grunt.warn(message);
    }
  };

  // Keep track of failed assertions for pretty-printing.
  var failedAssertions = [];
  var logFailedAssertions = function() {
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
  };
  // Copied from QUnit source code
  var generateHash = function(module) {
    var hex;
    var i = 0;
    var hash = 0;
    var str = module + '\x1C' + undefined;
    var len = str.length;

    for (; i < len; i++) {
      hash  = ((hash << 5) - hash) + str.charCodeAt(i);
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
  };

  // QUnit hooks.
  phantomjs.on('qunit.moduleStart', function(name) {
    unfinished[name] = true;
    currentModule = name;
  });

  phantomjs.on('qunit.moduleDone', function(name/*, failed, passed, total*/) {
    delete unfinished[name];
  });

  phantomjs.on('qunit.log', function(result, actual, expected, message, source) {
    if (!result) {
      failedAssertions.push({
        actual: actual, expected: expected, message: message, source: source,
        testName: currentTest
      });
    }
  });

  phantomjs.on('qunit.testStart', function(name) {
    currentTest = (currentModule ? currentModule + ' - ' : '') + name;
    grunt.verbose.write(currentTest + '...');
  });

  phantomjs.on('qunit.testDone', function(name, failed/*, passed, total*/) {
    // Log errors if necessary, otherwise success.
    if (failed > 0) {
      // list assertions
      if (grunt.option('verbose')) {
        grunt.log.error();
        logFailedAssertions();
      } else {
        grunt.log.write('F'.red);
      }
    } else {
      grunt.verbose.ok().or.write('.');
    }
  });

  phantomjs.on('qunit.done', function(failed, passed, total, duration) {
    phantomjs.halt();
    status.failed += failed;
    status.passed += passed;
    status.total += total;
    status.duration += duration;
    // Print assertion errors here, if verbose mode is disabled.
    if (!grunt.option('verbose')) {
      if (failed > 0) {
        grunt.log.writeln();
        logFailedAssertions();
      } else if (total === 0) {
        warnUnlessForced('0/0 assertions ran (' + duration + 'ms)');
      } else {
        grunt.log.ok();
      }
    }
  });

  // Re-broadcast qunit events on grunt.event.
  phantomjs.on('qunit.*', function() {
    var args = [this.event].concat(grunt.util.toArray(arguments));
    grunt.event.emit.apply(grunt.event, args);
  });

  // Built-in error handlers.
  phantomjs.on('fail.load', function(url) {
    phantomjs.halt();
    grunt.verbose.write('...');
    grunt.event.emit('qunit.fail.load', url);
    grunt.log.error('PhantomJS unable to load "' + url + '" URI.');
    status.failed += 1;
    status.total += 1;
  });

  phantomjs.on('fail.timeout', function() {
    phantomjs.halt();
    grunt.log.writeln();
    grunt.event.emit('qunit.fail.timeout');
    grunt.log.error('PhantomJS timed out, possibly due to:\n' +
        '- QUnit is not loaded correctly.\n- A missing QUnit start() call.\n' +
        '- Or, a misconfiguration of this task.');
    status.failed += 1;
    status.total += 1;
  });

  phantomjs.on('error.onError', function (msg, stackTrace) {
    grunt.event.emit('qunit.error.onError', msg, stackTrace);
  });

  grunt.registerMultiTask('qunit', 'Run QUnit unit tests in a headless PhantomJS instance.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    options = this.options({
      // Default PhantomJS timeout.
      timeout: 5000,
      // QUnit-PhantomJS bridge file to be injected.
      inject: asset('phantomjs/bridge.js'),
      // Explicit non-file URLs to test.
      urls: [],
      force: false,
      // Connect phantomjs console output to grunt output
      console: true,
      // Do not use an HTTP base by default
      httpBase: false,
      summaryOnly: false
    });

    var urls;

    if (options.httpBase) {
      //If URLs are explicitly referenced, use them still
      urls = options.urls;
      // Then create URLs for the src files
      this.filesSrc.forEach(function(testFile) {
        urls.push(options.httpBase + '/' + testFile);
      });
    } else {
      // Combine any specified URLs with src files.
      urls = options.urls.concat(this.filesSrc);
    }

    var parsed;
    var appendToUrls = function(queryParam, value) {
      // Append the query param to all urls
      urls = urls.map(function(testUrl) {
        parsed = url.parse(testUrl, true);
        parsed.query[queryParam] = value;
        delete parsed.search;
        return url.format(parsed);
      });
    };

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

    // This task is asynchronous.
    var done = this.async();

    // Reset status.
    status = {failed: 0, passed: 0, total: 0, duration: 0};

    // Pass-through console.log statements.
    if(options.console) {
      phantomjs.on('console', console.log.bind(console));
    }

    // Process each filepath in-order.
    grunt.util.async.forEachSeries(urls, function(url, next) {
      grunt.verbose.subhead('Testing ' + url + ' ').or.write('Testing ' + url + ' ');

      // Reset current module.
      currentModule = null;

      // Launch PhantomJS.
      grunt.event.emit('qunit.spawn', url);
      phantomjs.spawn(url, {
        // Additional PhantomJS options.
        options: options,
        // Do stuff when done.
        done: function(err) {
          if (err) {
            // If there was an error, abort the series.
            done();
          } else {
            // Otherwise, process next url.
            next();
          }
        },
      });
    },
    // All tests have been run.
    function() {
      var success;

      // Log results.
      if (status.failed > 0) {
        warnUnlessForced(status.failed + '/' + status.total +
            ' assertions failed (' + status.duration + 'ms)');
      } else if (status.total === 0) {
        warnUnlessForced('0/0 assertions ran (' + status.duration + 'ms)');
      } else {
        grunt.verbose.writeln();
        grunt.log.ok(status.total + ' assertions passed (' + status.duration + 'ms)');
      }

      if (options && options.force) {
        success = true;
      } else {
        success = status.failed === 0;
      }

      // All done!
      done(success);
    });
  });

};
