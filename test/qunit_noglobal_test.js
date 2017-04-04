var failures = [];
QUnit.log(function(details) {
  if (details.result === false) {
    failures.push(details.message);
  }
});

QUnit.todo('global pollution', function(assert) {
  window.pollute = true;
  assert.ok(pollute, 'nasty pollution');
});

QUnit.test('actually check for global pollution', function(assert) {
  assert.expect(1);
  assert.deepEqual(failures, ['Introduced global variable(s): pollute']);
});
