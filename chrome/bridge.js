/*
 * grunt-contrib-qunit
 * https://gruntjs.com/
 *
 * Copyright (c) 2016 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

/* global QUnit:true */
(function() {
  'use strict';

  if (window.self !== window.top) {
    // Ignore iframes. https://github.com/gruntjs/grunt-contrib-qunit/issues/202
    return;
  }

  var lastMessage = performance.now();

  // Don't re-order tests.
  QUnit.config.reorder = false;

  // Send messages to the Node process
  function sendMessage() {
    self.__grunt_contrib_qunit__.apply(self, [].slice.call(arguments));
    lastMessage = performance.now();
  }

  if (self.__grunt_contrib_qunit_timeout__) {
    setTimeout(function checkTimeout() {
      if ((performance.now() - lastMessage) > self.__grunt_contrib_qunit_timeout__) {
        sendMessage('fail.timeout');
      } else {
        // Keep checking
        setTimeout(checkTimeout, 1000);
      }
    }, 1000);
  }

  // QUnit reporter events
  // https://qunitjs.com/api/callbacks/QUnit.on/

  QUnit.on('error', function(error) {
    sendMessage('qunit.on.error', error.stack || String(error));
  });

  QUnit.on('testStart', function(obj) {
    sendMessage('qunit.on.testStart', obj);
  });

  QUnit.on('testEnd', function(obj) {
    // Re-create object to strip out 'assertions' field

    // expected and actual may contain circular objects,
    // which would fail in puppeteer as it uses JSON.stringify to serialize its messages
    // In that case, replace actual and expected
    var errors = obj.errors;
    if (!canBeJSONStringified(errors)) {
      errors = obj.errors.map(function (error) {
        return {
          passed: error.passed,
          message: error.message,
          stack: error.stack,
          actual: replaceIfCannotBeJSONStringified(error.actual),
          expected: replaceIfCannotBeJSONStringified(error.expected)
        }
      });
    }

    sendMessage('qunit.on.testEnd', {
      name: obj.name,
      moduleName: obj.moduleName,
      fullName: obj.fullName,
      status: obj.status,
      runtime: obj.runtime,
      errors: errors,
    });
  });

  function replaceIfCannotBeJSONStringified(obj) {
    return canBeJSONStringified(obj) ? obj : obj.toString();
  }

  function canBeJSONStringified(obj) {
    try {
      JSON.stringify(obj);
      return true;
    } catch (e) {
      return false;
    }
  }

  QUnit.on('runEnd', function(obj) {
    // Re-create object to strip out large 'tests' field (deprecated).
    sendMessage('qunit.on.runEnd', {
      testCounts: obj.testCounts,
      runtime: obj.runtime,
      status: obj.status
    });
  });

  // QUnit plugin callbacks
  // https://api.qunitjs.com/callbacks/

  QUnit.begin(function() {
    sendMessage('qunit.begin');
  });

  // It is encouraged to listen to `qunit.on.testEnd` instead, so that you
  // don't have to deal with:
  // * grouping tests by test and module (testName provides "fullName",
  //   and provides FailedAssertion in one go instead of per-assertion).
  // * inversion of "todo" tests (i.e. pass when failing).
  // * undefined actual/expected for passing tests.
  QUnit.log(function(obj) {
    var actual;
    var expected;
    if (!obj.result) {
      // Dumping large objects can be very slow, and the dump isn't used for
      // passing tests, so only dump if the test failed.
      actual = QUnit.dump.parse(obj.actual);
      expected = QUnit.dump.parse(obj.expected);
    }
    sendMessage('qunit.log', {
      result: obj.result,
      actual: actual,
      expected: expected,
      message: obj.message,
      source: obj.source,
      module: obj.module,
      name: obj.name,
      todo: obj.todo
    });
  });

  QUnit.done(function() {
    sendMessage('qunit.done');
  });
}());
