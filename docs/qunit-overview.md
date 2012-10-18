[qunit]: http://docs.jquery.com/QUnit
[phantom]: http://www.phantomjs.org/

## About

This task is a [multi task](types_of_tasks.md), meaning that grunt will automatically iterate over all `qunit` targets if a target is not specified.

_Need some help getting started with grunt? Visit the [getting started](getting_started.md) page. And if you're creating your own tasks, be sure to check out the [types of tasks](types_of_tasks.md) page as well as the [API documentation](api.md)._

### QUnit

[QUnit][qunit] is a powerful, easy-to-use, JavaScript test suite. It's used by the jQuery project to test its code and plugins but is capable of testing any generic JavaScript code.

### PhantomJS

[PhantomJS](http://www.phantomjs.org/) is a headless WebKit with JavaScript API. It has fast and native support for various web standards: DOM handling, CSS selector, JSON, Canvas, and SVG. PhantomJS is required for the `qunit` task to work.

See the [FAQ](faq.md) for instructions on installing PhantomJS.


## A Very Important Note
Your Gruntfile **must** contain this code, once and **only** once. If it doesn't, grunt won't work. For the sake of brevity, this "wrapper" code has been omitted from all examples on this page, but it needs to be there.

```javascript
module.exports = function(grunt) {
  // Your grunt code goes in here.
};
```

## Project configuration

This example shows a brief overview of the [config](api_config.md) properties used by the `qunit` task. For a more in-depth explanation, see the usage examples.

```javascript
// Project configuration.
grunt.initConfig({
  // Lists of files or URLs to be unit tested with QUnit.
  qunit: {}
});
```

