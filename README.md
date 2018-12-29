# grunt-contrib-qunit v3.1.0 [![Build Status: Linux](https://travis-ci.org/gruntjs/grunt-contrib-qunit.svg?branch=master)](https://travis-ci.org/gruntjs/grunt-contrib-qunit) [![Build Status: Windows](https://ci.appveyor.com/api/projects/status/3vd43779joyj6qji/branch/master?svg=true)](https://ci.appveyor.com/project/gruntjs/grunt-contrib-qunit/branch/master)

> Run QUnit unit tests in a headless Chrome instance



## Getting Started

If you haven't used [Grunt](https://gruntjs.com/) before, be sure to check out the [Getting Started](https://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](https://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-contrib-qunit --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-contrib-qunit');
```




## Qunit task
_Run this task with the `grunt qunit` command._

You have chosen to write your unit tests using [QUnit](https://qunitjs.com/), you have written a
html page which reports the summary and indivudual details of your unit
tests, you are happy with this but realize you miss the ability to have your
unit test suite run automatically each time you commit changes to your
code.

This is where the `grunt-contrib-qunit` plugin comes in the play:
`grunt-contrib-qunit` lets you run your tests in the invisible [Chrome][]
browser, thus converting your unit test suite into something you can run
from a script, a script you can have automatically run on travis-ci (or the
Continuous Integration service of your choice) which in turn can alert you
of any rule-breaking commit to your code.

You can still monitor the status of your unit tests suite visiting your html
test page in your browser, but with `grunt-contrib-qunit` you can also run
the same suite from the command line interface.

This plugin defines one single task: `qunit`. Configure it in your `Gruntfile.js`, run it with the `grunt qunit` command.

Please read about specifying task targets, files and options in the grunt [Configuring tasks](https://gruntjs.com/configuring-tasks) guide.

When installed by npm, this plugin will automatically download and install a local
[Chrome][] binary within the `node_modules` directory of the [puppeteer][] library,
which is used for launching a Chrome process.  If your system already provides an
installation of Chrome, you can configure this plugin to use the globally installed
executable by specifying a custom `executablePath` in the puppeteer launch options.  
This will almost certainly be needed in order to run Chrome in a CI environment

[Puppeteer]: https://pptr.dev/

#### OS Dependencies
This plugin uses Puppeteer to run tests in a Chrome process. Chrome requires a number of dependencies that must be installed, depending on your OS.  
Please see Puppeteer's docs to see the latest docs for what dependencies you need for your OS:

https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md
### Options

#### timeout
Type: `Number`  
Default: `5000`

The amount of time (in milliseconds) that grunt will wait for a QUnit `start()` call before failing the task with an error.

#### inject
Type: `String`|`Array`  
Default: `chrome/bridge.js`

One or multiple (array) JavaScript file names to inject into the html test page. Defaults to the path of the QUnit-Chrome bridge file.

You may want to inject something different than the provided QUnit-Chrome bridge, or to inject more than just the provided bridge.
See [the built-in bridge](https://github.com/gruntjs/grunt-contrib-qunit/blob/master/chrome/bridge.js) for more information.

#### httpBase
Type: `String`  
Default: `""`

Create URLs for the `src` files, all `src` files are prefixed with that base.

#### console
Type: `boolean`  
Default: `true`

By default, `console.[log|warn|error]` output from the Chrome browser will be piped into QUnit console. Set to `false` to disable this behavior.

#### urls
Type: `Array`  
Default: `[]`

Absolute `http://` or `https://` urls to be passed to Chrome. Specified URLs will be merged with any specified `src` files first. Note that urls must be served by a web server, and since this task doesn't contain a web server, one will need to be configured separately. The [grunt-contrib-connect plugin](https://github.com/gruntjs/grunt-contrib-connect) provides a basic web server.

#### force
Type: `boolean`  
Default: `false`

When true, the whole task will not fail when there are individual test failures, or when no assertions for a test have run. This can be set to true when you always want other tasks in the queue to be executed.

#### summaryOnly
Type: `boolean`  
Default: `false`

When true, this will suppress the default logging for individually failed tests. Customized logging can be performed by listening to and responding to `qunit.log` events.

#### puppeteer
Type: `Object`  
Default: `{ headless: true }`

Arguments to be used when `puppeteer.launch()` is invoked. This may be useful for specifying a custom Chrome executable path, running in non-headless mode, specifying environment variables to use when launching Chrome, etc. See the [Puppeteer API Reference][https://pptr.dev/#?product=Puppeteer&version=v1.3.0] for a list of launch options that are available.

#### noGlobals
Type: `boolean`  
Default: `false`

Fail a test when the global namespace is polluted. See the [QUnit cookbook](https://qunitjs.com/cookbook/#discussion-id170) for more information.

### Command line options

#### Filtering by module name: `--modules`

`grunt qunit --modules="foo"`

Will run the module `foo`. You can specify one or multiple, comma-separated modules to run.

#### Running tests in seeded-random order: `--seed`

`grunt qunit --seed="a-string"`

Specify the seed to pass to QUnit, to run tests in random, but deterministic order. See [`QUnit.config.seed`](https://api.qunitjs.com/QUnit.config/) docs for more information.

_Note: You must be using `QUnit` version `1.23.0` or greater for these features to work properly._

### Usage examples

#### Wildcards
In this example, `grunt qunit:all` will test all `.html` files in the test directory _and all subdirectories_. First, the wildcard is expanded to match each individual file. Then, each matched filename is passed to [Chrome][] (one at a time).

```js
// Project configuration.
grunt.initConfig({
  qunit: {
    all: ['test/**/*.html']
  }
});
```

#### Testing via http:// or https://
In circumstances where running unit tests from local files is inadequate, you can specify `http://` or `https://` URLs via the `urls` option. Each URL is passed to [Chrome][] (one at a time).

In this example, `grunt qunit` will test two files, served from the server running at `localhost:8000`.

```js
// Project configuration.
grunt.initConfig({
  qunit: {
    all: {
      options: {
        urls: [
          'http://localhost:8000/test/foo.html',
          'http://localhost:8000/test/bar.html'
        ]
      }
    }
  }
});
```

Wildcards and URLs may be combined by specifying both.

#### Using the grunt-contrib-connect plugin
It's important to note that grunt does not automatically start a `localhost` web server. That being said, the [grunt-contrib-connect plugin][] `connect` task can be run before the `qunit` task to serve files via a simple [connect][] web server.

[grunt-contrib-connect plugin]: https://github.com/gruntjs/grunt-contrib-connect
[connect]: http://www.senchalabs.org/connect/

In the following example, if a web server isn't running at `localhost:8000`, running `grunt qunit` with the following configuration will fail because the `qunit` task won't be able to load the specified URLs. However, running `grunt connect qunit` will first start a static [connect][] web server at `localhost:8000` with its base path set to the Gruntfile's directory. Then, the `qunit` task will be run, requesting the specified URLs.

```js
// Project configuration.
grunt.initConfig({
  qunit: {
    all: {
      options: {
        urls: [
          'http://localhost:8000/test/foo.html',
          'http://localhost:8000/test/bar.html',
        ]
      }
    }
  },
  connect: {
    server: {
      options: {
        port: 8000,
        base: '.'
      }
    }
  }
});

// This plugin provides the "connect" task.
grunt.loadNpmTasks('grunt-contrib-connect');

// A convenient task alias.
grunt.registerTask('test', ['connect', 'qunit']);
```

#### Custom timeouts and Puppeteer options
In the following example, the default timeout value of `5000` is overridden with the value `10000` (timeout values are in milliseconds). Custom options to use when launching Puppeteer can be specified using `options.puppeteer`, with all property names corresponding directly to options supported by [`puppeteer.launch()`](https://pptr.dev/#?product=Puppeteer&version=v1.3.0&show=api-puppeteerlaunchoptions). For example, the following configuration sets the TZ environment variable and invokes a custom Chrome executable at "/usr/bin/chromium"

[Puppeteer API Reference]: https://pptr.dev/

```js
// Project configuration.
grunt.initConfig({
  qunit: {
    options: {
      timeout: 10000,
      puppeteer: {
        env: {
          TZ: "UTC"
        },
        executablePath: "/usr/bin/chromium"
      }
    },
    all: ['test/**/*.html']
  }
});
```

#### Loading QUnit with AMD

When using AMD to load QUnit and your tests, make sure to have a path for the `qunit` module defined.

#### Events and reporting
[QUnit callback](http://api.qunitjs.com/category/callbacks/) methods and arguments are also emitted through grunt's event system so that you may build custom reporting tools. Please refer to to the QUnit documentation for more information.

The events, with arguments, are as follows:

* `qunit.begin`
* `qunit.moduleStart` `(name)`
* `qunit.testStart` `(name)`
* `qunit.log` `(result, actual, expected, message, source)`
* `qunit.testDone` `(name, failed, passed, total, duration)`
* `qunit.moduleDone` `(name, failed, passed, total)`
* `qunit.done` `(failed, passed, total, runtime)`

In addition to QUnit callback-named events, the following events are emitted by Grunt:

* `qunit.spawn` `(url)`: when [Chrome][] is spawned for a test
* `qunit.fail.load` `(url)`: when [Chrome][] could not open the given url
* `qunit.fail.timeout`: when a QUnit test times out, usually due to a missing `QUnit.start()` call
* `qunit.error.onError` `(message, stackTrace)`: when a JavaScript execution error occurs

You may listen for these events like so:

```js
grunt.event.on('qunit.spawn', function (url) {
  grunt.log.ok('Running test: ' + url);
});
```


## Release History

 * 2018-12-29   v3.1.0   Updated to puppeteer ^1.11.0.
 * 2018-08-12   v3.0.1   Fixed regressions.
 * 2018-07-24   v3.0.0   Switch to using headless chrome / puppeteer instead of phantomjs
 * 2017-04-04   v2.0.0   Remove usage of `QUnit.jsDump` Upgrade qunitjs to 2.3.0 (#123) adding an Introduction to the README (#140)
 * 2017-02-07   v1.3.0   Add ability to run tests in seeded-random order through `--seed` flag Add note about min version of QUnit required to use the CLI flags Implement support for todo tests and revamp reporting logic (#137)
 * 2016-04-14   v1.2.0   Add support for filtering running modules using command line (--modules) Removed 'grunt.warn' output from `error.onError` handler, onus now on end user binding to event. Update docs.
 * 2016-03-11   v1.1.0   Adding support for 'summaryOnly'. Fix `options.force`. Fix query string for `noGlobals`. Update docs.
 * 2016-02-05   v1.0.1   Change `QUnit.jsDump` to `QUnit.dump`.
 * 2016-02-05   v1.0.0   Update grunt-lib-phantomjs to 1.0.0, effectively upgrading to phantomjs 2.x. Remove grunt as a peerDependency.
 * 2015-04-03   v0.7.0   Log PhantomJS errors as warnings.
 * 2015-03-31   v0.6.0   Add noGlobals option, forwarded to QUnit. Report proper exit code to grunt based on failures. Add support for AMD.
 * 2014-07-09   v0.5.2   Added support for reporting the duration of `testDone`. Other minor fixes.
 * 2014-05-31   v0.5.1   Updates grunt-lib-phantomjs.
 * 2014-05-31   v0.5.0   Add ability to hide PhantomJS console output. Add option for binding phantomjs console to grunt output. Default is `true` (do bind). Add `httpBase` option. Only call `jsDump.parse()` if a test failed.
 * 2014-01-17   v0.4.0   Update grunt-lib-phantomjs to v0.5.0. Explicitly set files to publish to npm. Ref gruntjs/gruntjs.com#65. Update qunit-overview.md, include CentOS dependencies. Closes gh-49.
 * 2013-09-29   v0.3.0   Update grunt-lib-phantomjs to v0.4.0. Add `qunit.fail.load` and `qunit.fail.timeout` events. Update QUnit to v1.12.0. Add `force` option. Propagate `onError` events from phantomjs through the `qunit.error.onError` event. Remove confusing error message.
 * 2013-06-06   v0.2.2   Warn if no assertions ran in a single test. Spaces instead of newlines for clickable URLs. Wrap bridge.js in a IIFE.
 * 2013-04-05   v0.2.1   Update to use PhantomJS 1.9.0. Fixes PhantomJS not found errors.
 * 2013-02-28   v0.2.0   Update to use PhantomJS 1.8.1.
 * 2013-02-15   v0.1.1   First official release for Grunt 0.4.0.
 * 2013-01-18   v0.1.1rc6   Updating grunt/gruntplugin dependencies to rc6. Changing in-development grunt/gruntplugin dependency versions from tilde version ranges to specific versions.
 * 2013-01-09   v0.1.1rc5   Updating to work with grunt v0.4.0rc5. Switching to `this.filesSrc` API. Adding `urls` option for specifying absolute test URLs.
 * 2012-10-05   v0.1.0   Work in progress, not yet officially released.

---

Task submitted by ["Cowboy" Ben Alman](http://benalman.com/)

*This file was generated on Sat Dec 29 2018 17:19:16.*
