# Options

## timeout
Type: `Number`  
Default: `5000`

The amount of time (in milliseconds) that grunt will wait for a QUnit `start()` call before failing the task with an error.

## inject
Type: `String`  
Default: (built-in)

Path to an alternate QUnit-PhantomJS bridge file to be injected. See [the built-in bridge](https://github.com/gruntjs/grunt-contrib-qunit/blob/master/phantomjs/bridge.js) for more information.

## urls
Type: `Array`  
Default: `[]`

Absolute `http://` or `https://` urls to be passed to PhantomJS. Specified URLs will be merged with any specified `src` files first. Note that urls must be served by a web server, and since this task doesn't contain a web server, one will need to be configured separately. The [grunt-contrib-connect plugin](https://github.com/gruntjs/grunt-contrib-connect) provides a basic web server.

## warnOnMissingAssertions
Type: `Boolean`  
Default: true

As of version 0.2.2 a warning will be issued if you have a test that does not include any assertion. If `warnOnMissingAssertions` is set to false no warnings will be issued. It is recommended to have this option set to true (the default).

## (-- PhantomJS arguments)
Type: `String`  
Default: (none)

Additional `--` style arguments that need to be passed in to PhantomJS may be specified as options, like `{'--option': 'value'}`. This may be useful for specifying a cookies file, local storage file, or a proxy. See the [PhantomJS API Reference][] for a list of `--` options that PhantomJS supports.
