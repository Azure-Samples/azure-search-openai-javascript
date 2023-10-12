import t from 'tap';
import { build } from '../helper.js';

t.test('default root route', async (t) => {
  const app = await build(t);

  const response = await app.inject({
    url: '/',
  });

  const result = JSON.parse(response.payload);
  t.hasProps(result, ['service', 'description', 'version']);
});
