import { test } from 'node:test';
import fs from 'node:fs/promises';
import { CsvLookupTool } from '../../../src/lib/langchain/csv-lookup-tool.js';

test('CsvLookupTool', async (t) => {
  const filename = 'test.csv';
  const keyField = 'id';
  const csv = `id,name,age
1,John Doe,30
2,Jane Doe,25
3,Bob Smith,40`;

  // Mock readFile function
  t.mock.method(fs, 'readFile', async (_filename: string) => csv);

  const tool = new CsvLookupTool(filename, keyField);

  await t.test('_call()', async (t) => {
    await t.test('should return the correct data', async (t) => {
      const input = '1';
      const expected = 'id:1\nname:John Doe\nage:30';
      const actual = await tool._call(input);
      t.assert.equal(actual, expected);
    });

    await t.test('should return an empty string if no data is found', async (t) => {
      const input = '4';
      const expected = '';
      const actual = await tool._call(input);
      t.assert.equal(actual, expected);
    });
  });
});
