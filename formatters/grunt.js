/*
 * grunt-contrib-qunit
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

'use strict';

// define a new formatter
// ----------
// formatter receive hooks notification
// and adjust the data to present cool output
module.exports = function(grunt, force, junitDir) {

  var path = require("path");

  // Keep track of the last-started module, test and status.
  var currentUrl, currentModule, currentTest, status;
  // Keep track of the last-started test(s).
  var unfinished = {};
  var junitReports = {};

  status = {failed: 0, passed: 0, total: 0, duration: 0};
  currentModule = null;
  currentUrl = null;

  // Allow an error message to retain its color when split across multiple lines.
  var formatMessage = function(str) {
    return String(str).split('\n').map(function(s) { return s.magenta; }).join('\n');
  };

  // If force then log an error, otherwise exit with a warning
  var warnUnlessForced = function (message) {
    if ( force ) {
      grunt.log.error(message);
    } else {
      grunt.warn(message);
    }
  };

  // Keep track of failed assertions for pretty-printing.
  var failedAssertions = [];
  var logFailedAssertions = function() {
    var assertion;
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

  // hooks receiver
  this.moduleStart = function(name){
    unfinished[name] = true;
    currentModule = name;
  };

  this.moduleDone = function(name/*, failed, passed, total*/){
    delete unfinished[name];
  };

  this.testStart = function(name){
    currentTest = (currentModule ? currentModule + ' - ' : '') + name;
    grunt.verbose.write(currentTest + '...');
  };

  this.assert = function(result, actual, expected, message, source){
    if (!result) {
      failedAssertions.push({
        actual: actual, expected: expected, message: message, source: source,
        testName: currentTest
      });
    }
  };

  this.testDone = function(name, failed/*, passed, total*/){
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
  };

  this.done = function(failed, passed, total, duration){
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
  };

  this.fail = function(error,url){
    if( error == "load" ){
      grunt.verbose.write('...');
      grunt.log.error('PhantomJS unable to load "' + url + '" URI.');
    }else{
      grunt.log.writeln();
      grunt.log.error('PhantomJS timed out, possibly due to a missing QUnit start() call.');
    }
    status.failed += 1;
    status.total += 1;
  };

  this.urlStart = function(url){
    currentUrl = url;
    grunt.verbose.subhead('Testing ' + url + ' ').or.write('Testing ' + url + ' ');
  };

  this.urlDone = function(err){
    currentModule = null;
    currentUrl = null;
  };

  this.junit = function(report){
    junitReports[currentUrl] = report;
  };

  this.finalize = function(done){
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

    // write jUnit result files
    if (junitDir && junitReports) {
      grunt.log.ok("Writing Junit Report");
      grunt.file.delete(junitDir);
      for( var url in junitReports ){
        var junitReport = junitReports[url];
        var pathname = require('url').parse(url).pathname;
        var filename = junitDir + '/' + pathname.replace(/[.][^.]+$/,'') + '.xml';
        grunt.log.writeln('jUnit output to: ' + filename);
        grunt.file.write(filename, junitReport.xml);
      }
      // reset junitReports
      junitReports = {};
    }
    done();
  };
};
