module('module1');

test('basic test', function() {
  expect(1);
  ok(true, 'this had better work.');
});


module('module2');

test('a second basic test', function() {
  expect(1);
  ok(true, 'this had better work.');
});
