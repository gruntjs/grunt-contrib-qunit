var circularObject = { a: {} };
circularObject.a.b = circularObject;

QUnit.test('circular object test', function(assert) {
  assert.expect(1);
  assert.ok(circularObject, 'succeed with circular actual.');
});
