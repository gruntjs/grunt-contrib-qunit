# Options

## timeout
Type: `Number`  
Default: `5000`

The amount of time (in milliseconds) that grunt will wait for a QUnit `start()` call before failing the task with an error.

## inject
Type: `String`  
Default: (built-in)

Path to an alternate QUnit-PhantomJS bridge file to be injected. See [the built-in bridge](https://github.com/gruntjs/grunt-contrib-qunit/blob/master/phantomjs/bridge.js) for more information.

## httpBase
Type: `String`
Default: `false`

Create URLs for the `src` files, all `src` files are prefixed with that base.

## console
Type: `boolean`
Default: `true`

Set to false to hide PhantomJS console output.

## urls
Type: `Array`  
Default: `[]`

Absolute `http://` or `https://` urls to be passed to PhantomJS. Specified URLs will be merged with any specified `src` files first. Note that urls must be served by a web server, and since this task doesn't contain a web server, one will need to be configured separately. The [grunt-contrib-connect plugin](https://github.com/gruntjs/grunt-contrib-connect) provides a basic web server.

## force
Type: `boolean`  
Default: `false`

When true, the whole task will not fail when there are individual test failures, or when no assertions for a test have run. This can be set to true when you always want other tasks in the queue to be executed.

## summaryOnly
Type: `boolean`  
Default: `false`

When true, this will suppress the default logging for individually failed tests. Customized logging can be performed by listening to and responding to `qunit.log` events.

## (-- PhantomJS arguments)
Type: `String`  
Default: (none)

Additional `--` style arguments that need to be passed in to PhantomJS may be specified as options, like `{'--option': 'value'}`. This may be useful for specifying a cookies file, local storage file, or a proxy. See the [PhantomJS API Reference][] for a list of `--` options that PhantomJS supports.

## noGlobals
Type: `boolean`  
Default: `false`

Fail a test when the global namespace is polluted. See the [QUnit cookbook](http://qunitjs.com/cookbook/#discussion-id170) for more information.
