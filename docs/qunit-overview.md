You have chosen to write your unit tests using [QUnit](https://qunitjs.com/), you have written a
html page which reports the summary and individual details of your unit
tests, you are happy with this but realize you miss the ability to have your
unit test suite run automatically each time you commit changes to your
code.

This is where the `grunt-contrib-qunit` plugin comes in the play:
`grunt-contrib-qunit` lets you run your tests in the invisible Chrome
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
Chrome binary within the `node_modules` directory of the [Puppeteer][] library,
which is used for launching a Chrome process.  If your system already provides an
installation of Chrome, you can configure this plugin to use the globally installed
executable by specifying a custom `executablePath` in the puppeteer launch options.  
This will almost certainly be needed in order to run Chrome in a CI environment

[Puppeteer]: https://pptr.dev/

## OS Dependencies
This plugin uses Puppeteer to run tests in a Chrome process. Chrome requires a number of dependencies that must be installed, depending on your OS.  
Please see Puppeteer's docs to see the latest docs for what dependencies you need for your OS:

https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md

## QUnit version

The plugin supports QUnit 2.2.0 and later. To test with QUnit 1.x, use grunt-contrib-qunit 5.
