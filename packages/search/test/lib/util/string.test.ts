import { test } from 'tap';
import { removeNewlines, parseBoolean } from '../../../src/lib/util/string.js';

test('removeNewlines', (t) => {
  t.equal(removeNewlines('Hello\nworld'), 'Hello world');
  t.equal(removeNewlines('Hello\r\nworld'), 'Hello world');
  t.equal(removeNewlines(''), '');
  t.equal(removeNewlines(), '');
  t.end();
});

test('parseBoolean', (t) => {
  t.equal(parseBoolean('true'), true);
  t.equal(parseBoolean('false'), false);
  t.equal(parseBoolean(undefined), false);
  t.equal(parseBoolean(true), true);
  t.equal(parseBoolean(false), false);
  t.end();
});
