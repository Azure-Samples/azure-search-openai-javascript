import { test } from 'node:test';
import { build } from '../helper.js';

test('default root route', async (t) => {
  const app = await build(t);

  const response = await app.inject({ url: '/' });

  const result = JSON.parse(response.payload);
  t.assert.partialDeepStrictEqual(result, {
    service: 'indexer',
    description: 'Document indexer service',
    version: '1.0.0',
  });
});
