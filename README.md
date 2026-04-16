[![npm](https://img.shields.io/npm/v/grunt-contrib-qunit.svg?style=flat)](https://www.npmjs.com/package/grunt-contrib-qunit)
[![Build Status](https://github.com/gruntjs/grunt-contrib-qunit/workflows/Tests/badge.svg)](https://github.com/gruntjs/grunt-contrib-qunit/actions?workflow=Tests)
[![Built with Grunt](https://gruntjs.com/builtwith.svg)](https://gruntjs.com/)
[![Tested with QUnit](https://qunitjs.com/testedwith.svg)](https://qunitjs.com/)

# grunt-contrib-qunit

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

## QUnit task

_Run this task with the `grunt qunit` command._

You have chosen to write your unit tests using [QUnit](https://qunitjs.com/), you have written a
html page which reports the summary and individual details of your unit
tests, you are happy with this but realize you miss the ability to have your
unit test suite run automatically each time you commit changes to your
code.

This is where the `grunt-contrib-qunit` plugin comes in the play:
`grunt-contrib-qunit` lets you run your tests in a Headless Chrome
browser, thus converting your unit test suite into something you can run
from the command-line, and from any automated continuous integration service,
which in turn can alert you of any failing tests.

You can debug your unit tests suite browsing your [HTML test page in your browser](https://qunitjs.com/browser/).

This plugin defines one single task: `qunit`. Configure it in your `Gruntfile.js`, run it with the `grunt qunit` command.

Please read about specifying task targets, files and options in the grunt [Configuring tasks](https://gruntjs.com/configuring-tasks) guide.

When installed by npm, this plugin will automatically download and install a local
Chrome binary within the `node_modules` directory of the [Puppeteer][] library,
which is used for launching a Chrome process.  If your system already provides an
installation of Chrome, you can configure this plugin to use the globally installed
executable by specifying a custom `executablePath` in the puppeteer launch options.  
This will almost certainly be needed in order to run Chrome in a CI environment

[Puppeteer]: https://pptr.dev/

#### QUnit version

The current version of `grunt-contrib-qunit` supports QUnit 2.17.0 and later.

| grunt-contrib-qunit | QUnit
|--|--
| grunt-contrib-qunit 10 and later | QUnit 2.17 and later
| grunt-contrib-qunit 9 | QUnit 2.2.0 and later
| grunt-contrib-qunit 5 | QUnit 1.x

#### System dependencies

This plugin uses Puppeteer to run tests in a Chrome process. Chrome requires a number of dependencies that must be installed, depending on your OS.
Please see Puppeteer's docs to see the latest docs for what dependencies you need for your OS:

https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md

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
See [the built-in bridge](https://github.com/gruntjs/grunt-contrib-qunit/blob/main/chrome/bridge.js) for more information.

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

When true, this will suppress the default logging for individually failed tests. Customized logging can be performed by listening to `qunit.on.testEnd` events.

#### puppeteer
Type: `Object`  
Default: `{ headless: true, args: [] }`

Options passed to `puppeteer.launch()`. This can used to specify a custom Chrome executable path, run in non-headless mode, specify environment variables for the Chrome process, etc. See the [Puppeteer API Reference](https://pptr.dev/#?product=Puppeteer&version=v9.0.0&show=api-puppeteerlaunchoptions) for a list of launch options.

The default value for `args` is set from the `CHROMIUM_FLAGS` environment variable, which in turn defaults to `--no-sandbox` if the `CI` environment variable is set.

#### noGlobals
Type: `boolean`  
Default: `false`

Fail a test when the global namespace is polluted. See the [`QUnit.config.noglobals`](https://api.qunitjs.com/config/noglobals/) for more information.

### Command line options

#### Filtering by module name: `--modules`

`grunt qunit --modules="foo"`

Will run the module `foo`. You can specify one or multiple, comma-separated modules to run.

#### Running tests in seeded-random order: `--seed`

`grunt qunit --seed="a-string"`

Specify the seed to pass to QUnit, to run tests in random, but deterministic order. See [`QUnit.config.seed`](https://api.qunitjs.com/config/seed/) docs for more information.

### Usage examples

#### Wildcards
In this example, `grunt qunit:all` will test all `.html` files in the test directory _and all subdirectories_. First, the wildcard is expanded to match each individual file. Then, each matched filename is passed to Chrome (one at a time).

```js
// Project configuration.
grunt.initConfig({
  qunit: {
    all: ['test/**/*.html']
  }
});
```

#### Testing via `http://` or `https://`
In circumstances where running unit tests from local files is inadequate, you can specify `http://` or `https://` URLs via the `urls` option. Each URL is passed to Chrome (one at a time).

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
It's important to note that Grunt does not automatically start a local web server. That being said, the [grunt-contrib-connect plugin][] `connect` task can be run before the `qunit` task to serve files via a simple [connect][] web server.

[grunt-contrib-connect plugin]: https://github.com/gruntjs/grunt-contrib-connect
[connect]: https://github.com/senchalabs/connect

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
In the following example, the default timeout value of `5000` is overridden with the value `10000` (timeout values are in milliseconds). Custom options to use when launching Puppeteer can be specified using `options.puppeteer`, with all property names corresponding directly to options supported by [`puppeteer.launch()`](https://pptr.dev/#?product=Puppeteer&version=v9.0.0&show=api-puppeteerlaunchoptions). For example, the following configuration sets the TZ environment variable and invokes a custom Chrome executable at "/usr/bin/chromium"

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

#### Events and reporting
QUnit events are forwarded to Grunt's event system, enabling you to build custom reporting tools. Please refer to the QUnit API documentation on [QUnit events](https://qunitjs.com/api/callbacks/QUnit.on/) and [QUnit callbacks](https://qunitjs.com/api/callbacks/) for when and what data is exposed from these events.

* `qunit.on.testStart` `(obj)`
* `qunit.on.testEnd` `(obj)`
* `qunit.on.runEnd` `(obj)`

* `qunit.begin`
* `qunit.log` `(obj)`
* `qunit.done`

In addition to forwarding QUnit's events, the following events are also emitted by the Grunt plugin:

* `qunit.spawn` `(url)`: when Chrome is spawned for a test
* `qunit.fail.load` `(url)`: when Chrome could not open the given url
* `qunit.fail.timeout`: when a QUnit test times out, usually due to a missing `QUnit.start()` call
* `qunit.error.onError` `(err)`: when a JavaScript execution error occurs

You may listen for these events like so:

```js
grunt.event.on('qunit.spawn', function (url) {
  grunt.log.ok('Running test: ' + url);
});
grunt.event.on('qunit.on.testEnd', function (test) {
  var name = test.fullName.join(' > ');
  if (test.status === 'failed') {
    grunt.log.error(name);
  } else {
    grunt.log.ok(name + ' # ' + test.status);
  }
});
```

---

Task originally created by ["Cowboy" Ben Alman](http://benalman.com/)
