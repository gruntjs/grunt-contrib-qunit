
QUnit.test('basic test', function(assert) {
  assert.expect(1);
  assert.ok(true, 'this had better work.');
});


QUnit.test('can access the DOM', function(assert) {
  assert.expect(1);
  var fixture = document.getElementById('qunit-fixture');
  assert.equal(fixture.innerText, 'this had better work.', 'should be able to access the DOM.');
});
