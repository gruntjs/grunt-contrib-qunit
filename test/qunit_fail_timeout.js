QUnit.module('grunt-contrib-qunit timeout');

QUnit.test('last forever', function(assert) {
  assert.async();

  assert.ok(true);
});
