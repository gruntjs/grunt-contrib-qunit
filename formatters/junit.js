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
module.exports = function(grunt, force, outputDir) {

  var path = require("path");

  // Keep track of the last-started module, test and status.
  var currentUrl, currentModule, currentTest, status;
  // Keep track of the last-started test(s).
  var unfinished = {};
  var reports = null;

  currentModule = null;
  currentUrl = null;


  // hooks receiver
  this.moduleStart = function(name){
    unfinished[name] = true;
    currentModule = name;
  };

  this.moduleDone = function(name/*, failed, passed, total*/){
    delete unfinished[name];
  };

  this.testStart = function(name){};

  this.assert = function(result, actual, expected, message, source){};

  this.testDone = function(name, failed/*, passed, total*/){};

  this.done = function(failed, passed, total, duration){};

  this.fail = function(error,url){};

  this.urlStart = function(url){
    currentUrl = url;
  };

  this.urlDone = function(err){
    currentModule = null;
    currentUrl = null;
  };

  this.append_report = function(report){
    if( ! reports ) reports = {};
    reports[currentUrl] = report;
  };

  this.finalize = function(done){
    // write jUnit result files
    if (outputDir && reports) {
      grunt.log.ok("Writing Junit Report");
      grunt.file.delete(outputDir);
      for( var url in reports ){
        var report = reports[url];
        var pathname = require('url').parse(url).pathname;
        var filename = outputDir + '/' + pathname.replace(/[.][^.]+$/,'') + '.xml';
        grunt.log.writeln('output to: ' + path.relative(process.cwd(),filename));
        grunt.file.write(filename, report.xml);
      }
      // reset reports
      reports = null;
    }
    if(done) done();
  };
};
