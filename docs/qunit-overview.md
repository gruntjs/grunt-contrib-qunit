You have chosen to write your unit tests using [QUnit](http://qunitjs.com/), you have written a
html page which reports the summary and indivudual details of your unit
tests, you are happy with this but realize you miss the ability to have your
unit test suite run automatically each time you commit changes to your
code.

This is where the `grunt-contrib-qunit` plugin comes in the play:
`grunt-contrib-qunit` lets you run your tests in the invisible [PhantomJS][]
browser, thus converting your unit test suite into something you can run
from a script, a script you can have automatically run on travis-ci (or the
Continuous Integration service of your choice) which in turn can alert you
of any rule-breaking commit to your code.

You can still monitor the status of your unit tests suite visiting your html
test page in your browser, but with `grunt-contrib-qunit` you can also run
the same suite from the command line interface.

This plugin defines one single task: `qunit`. Configure it in your `Gruntfile.js`, run it with the `grunt qunit` command.

Please read about specifying task targets, files and options in the grunt [Configuring tasks](http://gruntjs.com/configuring-tasks) guide.

When installed by npm, this plugin will automatically download and install
[PhantomJS][] locally via the [grunt-lib-phantomjs][] library.  If your
system already provides the PhantomJS program, this plugin will use the
globally installed program.

[PhantomJS]: http://www.phantomjs.org/
[grunt-lib-phantomjs]: https://github.com/gruntjs/grunt-lib-phantomjs

Also note that running grunt with the `--debug` flag will output a lot of PhantomJS-specific debugging information. This can be very helpful in seeing what actual URIs are being requested and received by PhantomJS.

## OS Dependencies
This plugin uses PhantomJS to run tests. PhantomJS requires these dependencies

**On Ubuntu/Debian**

`apt-get install libfontconfig1 fontconfig libfontconfig1-dev libfreetype6-dev`

**On CentOS**

`yum install fontconfig freetype`
