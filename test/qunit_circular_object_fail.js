var circularObject = { a: {} };
circularObject.a.b = circularObject;

QUnit.test('circular object test', function(assert) {
  assert.expect(2);
  debugger;
  assert.equal(circularObject, {}, 'fail with circular actual.');
  assert.equal({}, circularObject, 'fail with circular expected.');
});
