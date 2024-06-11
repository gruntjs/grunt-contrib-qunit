QUnit.config.reorder = false;

var failures;
QUnit.on('testEnd', function(test) {
  if (!failures) {
    failures = test.errors;
  }
});

QUnit.todo('global pollution', function(assert) {
  window.myPollution = true;
  assert.true(myPollution, 'nasty pollution');
  // We expect QUnit to add an error to the end of this test
});

QUnit.test('check result of previous test', function(assert) {
  assert.expect(1);
  assert.propContains(failures, [
    { message: 'Introduced global variable(s): myPollution' }
  ]);
});
