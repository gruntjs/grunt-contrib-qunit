
test('basic test', function() {
  expect(1);
  ok(true, 'this had better work.');
});

test( "global pollution", function( assert ) {
  window.pollute = true;
  assert.ok( pollute, "nasty pollution" );
});
