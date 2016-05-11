var lastTest = '';

QUnit.module('QUnit.config.seed');

QUnit.test('1', function(assert) {
  var expected = QUnit.config.seed ? '2' : '';
  assert.equal(lastTest, expected, 'runs second');
  lastTest = '1';
});

QUnit.test('2', function(assert) {
  var expected = QUnit.config.seed ? '' : '1';
  assert.equal(lastTest, expected, 'runs first');
  lastTest = '2';
});
