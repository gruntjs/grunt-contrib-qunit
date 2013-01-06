# Options

## timeout
Type: `Number`  
Default: `5000`

The amount of time (in milliseconds) that grunt will wait for a QUnit `start()` call before failing the task with an error.

## inject
Type: `String`  
Default: (built-in)

Path to an alternate QUnit-PhantomJS bridge file to be injected. See [the built-in bridge](https://github.com/gruntjs/grunt-contrib-qunit/blob/master/phantomjs/bridge.js) for more information.

## stopOnFailure
Type: `boolean`  
Default: `true`

When true, upon completion of all tests, any test that failed will cause the whole task to fail. This can be set to false when you always want other tasks in the queue to be executed.

## (-- PhantomJS arguments)
Type: `String`  
Default: (none)

Additional `--` style arguments that need to be passed in to PhantomJS may be specified as options, like `{'--option': 'value'}`. This may be useful for specifying a cookies file, local storage file, or a proxy. See the [PhantomJS API Reference][] for a list of `--` options that PhantomJS supports.
