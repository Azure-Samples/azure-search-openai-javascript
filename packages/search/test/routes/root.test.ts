import { test } from 'tap';
import { build } from '../helper.js';

test('default root route', async (t) => {
  const app = await build(t);

  const response = await app.inject({
    url: '/',
  });
  t.same(JSON.parse(response.payload), { root: true });
});
