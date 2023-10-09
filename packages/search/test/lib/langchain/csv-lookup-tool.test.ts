import t from 'tap';

t.test('CsvLookupTool', async (t) => {
  const filename = 'test.csv';
  const keyField = 'id';
  const csv = `id,name,age
1,John Doe,30
2,Jane Doe,25
3,Bob Smith,40`;

  // Mock readFile function
  const readFile = async (_filename: string) => csv;
  const { CsvLookupTool } = await t.mockImport('../../../src/lib/langchain/csv-lookup-tool.js', {
    'node:fs/promises': { readFile },
  });

  const tool = new CsvLookupTool(filename, keyField);

  t.test('_call()', async (t) => {
    t.test('should return the correct data', async (t) => {
      const input = '1';
      const expected = 'id:1\nname:John Doe\nage:30';
      const actual = await tool._call(input);
      t.equal(actual, expected);
    });

    t.test('should return an empty string if no data is found', async (t) => {
      const input = '4';
      const expected = '';
      const actual = await tool._call(input);
      t.equal(actual, expected);
    });

    t.end();
  });
});
