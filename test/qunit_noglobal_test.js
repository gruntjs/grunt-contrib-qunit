
var pushFailure = QUnit.pushFailure;
var failures = [];

test('global pollution', function(assert) {
  window.pollute = true;
  assert.ok(pollute, 'nasty pollution');
  QUnit.pushFailure = function(message) {
    failures.push(message);
  };
});

test('actually check for global pollution', function() {
  expect(1);
  QUnit.pushFailure = pushFailure;
  deepEqual(failures, ['Introduced global variable(s): pollute']);
});
