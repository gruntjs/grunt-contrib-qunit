/*
 * grunt-contrib-qunit
 * https://gruntjs.com/
 *
 * Copyright (c) 2016 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

/* global QUnit:true */
(function (factory) {
  if (window.self !== window.top) {
    // Ignore iframes. https://github.com/gruntjs/grunt-contrib-qunit/issues/202
    return;
  }
  if (typeof define === 'function' && define.amd) {
    require(['qunit'], factory);
  } else {
    factory(QUnit);
  }
}(function(QUnit) {
  'use strict';

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

  QUnit.done(function() {
    sendMessage('qunit.done');
  });
}));
