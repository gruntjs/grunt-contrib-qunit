# Usage examples

## Wildcards
In this example, `grunt qunit:all` will test all `.html` files in the test directory _and all subdirectories_. First, the wildcard is expanded to match each individual file. Then, each matched filename is passed to Chrome (one at a time).

```js
// Project configuration.
grunt.initConfig({
  qunit: {
    all: ['test/**/*.html']
  }
});
```

## Testing via `http://` or `https://`
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

## Using the grunt-contrib-connect plugin
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

## Custom timeouts and Puppeteer options
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

## Loading QUnit with AMD
When using AMD to load QUnit and your tests, make sure to have a path for the `qunit` module defined.

## Events and reporting
[QUnit callback](http://api.qunitjs.com/category/callbacks/) methods and arguments are also emitted through grunt's event system so that you may build custom reporting tools. Please refer to to the QUnit documentation for more information.

The events, with arguments, are as follows:

* `qunit.on.testStart` `(obj)`
* `qunit.on.testEnd` `(obj)`
* `qunit.on.runEnd` `(obj)`

* `qunit.begin`
* `qunit.moduleStart` `(name)`
* `qunit.testStart` `(name)`
* `qunit.log` `(result, actual, expected, message, source)`
* `qunit.testDone` `(name, failed, passed, total, duration)`
* `qunit.moduleDone` `(name, failed, passed, total)`
* `qunit.done` `(failed, passed, total, runtime)`

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
```
