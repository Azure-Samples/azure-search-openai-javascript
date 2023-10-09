import t from 'tap';
import { removeNewlines, parseBoolean } from '../../../src/lib/util/string.js';

t.test('removeNewlines', (t) => {
  t.equal(removeNewlines('Hello\nworld'), 'Hello world');
  t.equal(removeNewlines('Hello\r\nworld'), 'Hello world');
  t.equal(removeNewlines(''), '');
  t.equal(removeNewlines(), '');
  t.end();
});

t.test('parseBoolean', (t) => {
  t.equal(parseBoolean('true'), true);
  t.equal(parseBoolean('false'), false);
  // eslint-disable-next-line unicorn/no-useless-undefined
  t.equal(parseBoolean(undefined), false);
  t.equal(parseBoolean(true), true);
  t.equal(parseBoolean(false), false);
  t.end();
});
