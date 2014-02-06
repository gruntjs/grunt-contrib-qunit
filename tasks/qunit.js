/*
 * grunt-contrib-qunit
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Nodejs libs.
  var path = require('path');

  // External lib.
  var phantomjs = require('grunt-lib-phantomjs').init(grunt);

  // Get an asset file, local to the root of the project.
  var asset = path.join.bind(null, __dirname, '..');

  // The output formatter,
  // is nullable, exists only during the execution of the tasks
  var GruntOutput = require(__dirname+"/../formatters/grunt.js");
  var JunitOutput = require(__dirname+"/../formatters/junit.js");
  var TapOutput = require(__dirname+"/../formatters/tap.js");
  var formatter;
  var file_formatter;

  // Execute qunit in phantomjs
  // ----------
  grunt.registerMultiTask('qunit',
    'Run QUnit unit tests in a headless PhantomJS instance.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      // Default PhantomJS timeout.
      timeout: 5000,
      // QUnit-PhantomJS bridge file to be injected.
      inject: asset('phantomjs/bridge.js'),
      // Explicit non-file URLs to test.
      urls: [],
      force: false,
      // Connect phantomjs console output to grunt output
      console: true,
      // path to save report result files
      outputDir: null,
      // type of report : (tap|junit)
      type: null
    });

    // assign the formatter, to listens the current execution
    formatter = new GruntOutput(grunt, options.force, options.outputDir);
    if( options.type && options.type.match(/(tap|junit)/) ){
      if( options.type === "junit" ){
        file_formatter = new JunitOutput(grunt, options.force, options.outputDir);
      }else{
        file_formatter = new TapOutput(grunt, options.force, options.outputDir);
      }
    }

    // Combine any specified URLs with src files.
    var urls = options.urls.concat(this.filesSrc);

    // This task is asynchronous.
    var done = this.async();

    // Pass-through console.log statements.
    if(options.console) {
      phantomjs.on('console', console.log.bind(console));
    }

    // Process each filepath in-order.
    grunt.util.async.forEachSeries(urls, function(url, next) {

      // notify formatter
      formatter.urlStart(url);
      if( file_formatter ){
        file_formatter.urlStart(url);
      }
      // Launch PhantomJS.
      grunt.event.emit('qunit.spawn', url);

      phantomjs.spawn(url, {
        // Additional PhantomJS options.
        options: options,
        // Do stuff when done.
        done: function(err) {
          // notify formatter
          formatter.urlDone(err);
          if( file_formatter ){
            file_formatter.urlDone(err);
          }

          if (err) {
            // If there was an error, abort the series.
            done();
          } else {
            // Otherwise, process next url.
            next();
          }
        }
      });
    },
    // All tests have been run.
    function() {
      // All done!
      formatter.finalize();
      if( file_formatter ){
        file_formatter.finalize();
      }
      done();
      // reset the formatter
      formatter = null;
      file_formatter = null;
    });
  });


  // Register QUnit−>phantomjs->grunt hooks.
  // -----------
  // notify formatter for noticeable events
  phantomjs.on('qunit.moduleStart', function(name) {
    if(formatter){
      formatter.moduleStart(name);
    }
    if(file_formatter){
      file_formatter.moduleStart(name);
    }
  });

  phantomjs.on('qunit.moduleDone', function(name, failed, passed, total) {
    if(formatter){
      formatter.moduleDone(name, failed, passed, total);
    }
    if(file_formatter){
      file_formatter.moduleDone(name, failed, passed, total);
    }
  });

  phantomjs.on('qunit.log', function(result, actual, expected, message, source) {
    if(formatter){
      formatter.assert(result, actual, expected, message, source);
    }
    if(file_formatter){
      file_formatter.assert(result, actual, expected, message, source);
    }
  });

  phantomjs.on('qunit.testStart', function(name) {
    if(formatter){
      formatter.testStart(name);
    }
    if(file_formatter){
      file_formatter.testStart(name);
    }
  });

  phantomjs.on('qunit.testDone', function(name, failed, passed, total) {
    if(formatter){
      formatter.testDone(name, failed, passed, total);
    }
    if(file_formatter){
      file_formatter.testDone(name, failed, passed, total);
    }
  });

  // occurs after an url has completed
  phantomjs.on('qunit.done', function(failed, passed, total, duration) {
    phantomjs.halt();
    if(formatter){
      formatter.done(failed, passed, total, duration);
    }
    if(file_formatter){
      file_formatter.done(failed, passed, total, duration);
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
    grunt.event.emit('qunit.fail.load', url);
    if(formatter){
      formatter.fail("load", url);
    }
    if(file_formatter){
      file_formatter.fail("load", url);
    }
  });

  phantomjs.on('fail.timeout', function() {
    phantomjs.halt();
    grunt.event.emit('qunit.fail.timeout');
    if(formatter){
      formatter.fail("timeout");
    }
    if(file_formatter){
      file_formatter.fail("timeout");
    }
  });

  phantomjs.on('error.onError', function (msg, stackTrace) {
    grunt.event.emit('qunit.error.onError', msg, stackTrace);
  });

  // catch junit event from qunit
  phantomjs.on('qunit.junitreport', function(report) {
    if(formatter){
      formatter.append_report(report);
    }
    if(file_formatter){
      file_formatter.append_report(report);
    }
  });

  // catch tap event from qunit
  phantomjs.on('qunit.tapreport', function(report) {
    if(formatter){
      formatter.append_report(report);
    }
    if(file_formatter){
      file_formatter.append_report(report);
    }
  });
};
