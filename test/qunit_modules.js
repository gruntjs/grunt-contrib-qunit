QUnit.module('module1');

QUnit.test('basic test', function(assert) {
  assert.expect(1);
  assert.ok(true, 'this had better work.');
});


QUnit.module('module2');

QUnit.test('a second basic test', function(assert) {
  assert.expect(1);
  assert.ok(true, 'this had better work.');
});
