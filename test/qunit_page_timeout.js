QUnit.module('grunt-contrib-qunit timeout');

QUnit.test('last forever', function(assert) {
  var done = assert.async();

  assert.ok( true );
});
