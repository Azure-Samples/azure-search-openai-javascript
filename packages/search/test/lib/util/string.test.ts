import { test } from 'node:test';
import { removeNewlines, parseBoolean } from '../../../src/lib/util/string.js';

test('removeNewlines', (t) => {
  t.assert.equal(removeNewlines('Hello\nworld'), 'Hello world');
  t.assert.equal(removeNewlines('Hello\r\nworld'), 'Hello world');
  t.assert.equal(removeNewlines(''), '');
  t.assert.equal(removeNewlines(), '');
});

test('parseBoolean', (t) => {
  t.assert.equal(parseBoolean('true'), true);
  t.assert.equal(parseBoolean('false'), false);
  // eslint-disable-next-line unicorn/no-useless-undefined
  t.assert.equal(parseBoolean(undefined), false);
  t.assert.equal(parseBoolean(true), true);
  t.assert.equal(parseBoolean(false), false);
});
