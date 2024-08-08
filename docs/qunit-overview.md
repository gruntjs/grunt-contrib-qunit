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

## QUnit version

The current version of `grunt-contrib-qunit` supports QUnit 2.17.0 and later.

| grunt-contrib-qunit | QUnit
|--|--
| grunt-contrib-qunit 10 and later | QUnit 2.17 and later
| grunt-contrib-qunit 9 | QUnit 2.2.0 and later
| grunt-contrib-qunit 5 | QUnit 1.x

## System dependencies

This plugin uses Puppeteer to run tests in a Chrome process. Chrome requires a number of dependencies that must be installed, depending on your OS.
Please see Puppeteer's docs to see the latest docs for what dependencies you need for your OS:

https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md
