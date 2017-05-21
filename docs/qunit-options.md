# Options

## timeout
Type: `Number`  
Default: `5000`

The amount of time (in milliseconds) that grunt will wait for a QUnit `start()` call before failing the task with an error.

## inject
Type: `String`|`Array`  
Default: `phantomjs/bridge.js`

One or multiple (array) JavaScript file names to inject into the html test page. Defaults to the path of the QUnit-PhantomJS bridge file.

You may want to inject something different than the provided QUnit-PhantomJS bridge, or to inject more than just the provided bridge.
See [the built-in bridge](https://github.com/gruntjs/grunt-contrib-qunit/blob/master/phantomjs/bridge.js) for more information.

## httpBase
Type: `String`  
Default: `""`

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

When true, this will suppress the default logging for individually failed tests. Customized logging can be performed by listening to and responding to `qunit.log` events. Also suppresses unhandled exceptions messages and JS erros and when `true` overrides `printResourcesEvents`.

## (-- PhantomJS arguments)
Type: `String`  
Default: (none)

Additional `--` style arguments that need to be passed in to PhantomJS may be specified as options, like `{'--option': 'value'}`. This may be useful for specifying a cookies file, local storage file, or a proxy. See the [PhantomJS API Reference][] for a list of `--` options that PhantomJS supports.

## noGlobals
Type: `boolean`  
Default: `false`

Fail a test when the global namespace is polluted. See the [QUnit cookbook](http://qunitjs.com/cookbook/#discussion-id170) for more information.

## failOnScriptErrors
Type: `boolean`  
Default: `true`

Fail a test if script error encountered.

## failOnMissingResources
Type: `boolean`  
Default: `false`

Fail a test if PhantomJS failed to load a resource (scripts, etc.)

## printResourcesEvents
Type: `boolean`  
Default: `false`

Print resource is missing or load timed out messages. Use `--verbose` for more details (error code and description). `summaryOnly = true` suppresses these messages.


# Command line options

## Filtering by module name: `--modules`

`grunt qunit --modules="foo"`

Will run the module `foo`. You can specify one or multiple, comma-separated modules to run.

## Running tests in seeded-random order: `--seed`

`grunt qunit --seed="a-string"`

Specify the seed to pass to QUnit, to run tests in random, but deterministic order. See [`QUnit.config.seed`](https://api.qunitjs.com/QUnit.config/) docs for more information.

_Note: You must be using `QUnit` version `1.23.0` or greater for these features to work properly._
