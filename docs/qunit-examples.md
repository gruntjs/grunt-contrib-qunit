# Usage examples

## Wildcards
In this example, `grunt qunit` will test all `.html` files in the test directory _and all subdirectories_. First, the wildcard is expanded to match each individual file. Then, each matched filename is converted to the appropriate `file://` URI. Finally, each URI is passed to [PhantomJS][] (one at a time).

```js
// Project configuration.
grunt.initConfig({
  qunit: {
    all: ['test/**/*.html']
  }
});
```

## Testing via http:// or https://
In circumstances where running unit tests from `file://` URIs is inadequate, you can specify `http://` or `https://` URIs instead. If `http://` or `https://` URIs have been specified, those URIs will be passed directly to [PhantomJS][], as-specified.

In this example, `grunt qunit` will test two files, served from the server running at `localhost:8000`.

```js
// Project configuration.
grunt.initConfig({
  qunit: {
    all: ['http://localhost:8000/test/foo.html', 'http://localhost:8000/test/bar.html']
  }
});
```

## Using the grunt-contrib-connect plugin
It's important to note that grunt does not automatically start a `localhost` web server. That being said, the [grunt-contrib-connect plugin][] `connect` task can be run before the `qunit` task to serve files via a simple [connect][] web server.

[grunt-contrib-connect plugin]: https://github.com/gruntjs/grunt-contrib-connect
[connect]: http://www.senchalabs.org/connect/

In the following example, if a web server isn't running at `localhost:8000`, running `grunt qunit` with the following configuration will fail because the `qunit` task won't be able to load the specified URIs. However, running `grunt connect qunit` will first start a static [connect][] web server at `localhost:8000` with its base path set to the Gruntfile's directory. Then, the `qunit` task will be run, requesting the specified URIs.

```js
// Project configuration.
grunt.initConfig({
  qunit: {
    all: ['http://localhost:8000/test/foo.html', 'http://localhost:8000/test/bar.html']
  },
  connect: {
    port: 8000,
    base: '.'
  }
});

// This plugin provides the "connect" task.
grunt.loadNpmTasks('grunt-contrib-connect');

// A convenient task alias.
grunt.registerTask('test', ['connect', 'qunit']);
```

## Custom timeouts and PhantomJS options
In the following example, the default timeout value of `5000` is overridden with the value `10000` (timeout values are in milliseconds). Additionally, PhantomJS will read stored cookies from the specified file. See the [PhantomJS API Reference][] for a list of `--` options that PhantomJS supports.

[PhantomJS API Reference]: https://github.com/ariya/phantomjs/wiki/API-Reference

```js
// Project configuration.
grunt.initConfig({
  qunit: {
    options: {
      timeout: 10000,
      '--cookies-file': 'misc/cookies.txt'
    },
    all: ['test/**/*.html']
  }
});
```
