import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from '../helper.js';

test('file deletion API rejects encoded directory separators', async (t) => {
  const app = await build(t);

  for (const filename of ['folder%2Fother.txt', 'folder%5Cother.txt']) {
    const response = await app.inject({
      method: 'DELETE',
      url: `/indexes/test-index/files/${filename}`,
    });
    assert.equal(response.statusCode, 400);
  }
});
