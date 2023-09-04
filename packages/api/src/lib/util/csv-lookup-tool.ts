import fs from 'fs/promises';
import path from 'path';
import { Tool, ToolParams } from 'langchain/tools';

const CSV_SEPARATOR = ',';

export type CsvData = Record<string, string>;

export class CsvLookupTool extends Tool {
  static lc_name(): string {
    return 'CsvLookupTool';
  }

  name = 'csvlookup';
  description =
    'useful to look up details given an input key as opposite to searching data with an unstructured question';

  private data: Record<string, CsvData> = {};
  private loaded = false;

  constructor(
    private filename: string,
    private keyField: string,
    options?: ToolParams,
  ) {
    super(options);
  }

  async _call(input: string): Promise<string> {
    await this.loadFile();
    return this.lookupAsString(input?.trim());
  }

  protected async loadFile() {
    if (this.loaded) return;

    try {
      const csvContent = await fs.readFile(path.resolve(this.filename), 'utf8');
      const [headerRow, ...dataRows] = csvContent.split('\n');
      const headerRowFields = headerRow.split(CSV_SEPARATOR);
      const keyFieldIndex = headerRowFields.indexOf(this.keyField);

      for (const row of dataRows) {
        const fields = row.split(CSV_SEPARATOR);
        // Transform the row into a key-value object
        this.data[fields[keyFieldIndex]] = fields.reduce((acc, field, index) => {
          acc[headerRowFields[index]] = field;
          return acc;
        }, {} as CsvData);
      }
    } catch (_error: unknown) {
      const error = _error as Error;
      throw new Error(`Failed to load CSV file ${this.filename}: ${error.message}`);
    }
  }

  protected lookup(key: string): CsvData {
    return this.data[key] || {};
  }

  protected lookupAsString(key: string): string {
    const data = this.lookup(key);
    return data
      ? Object.keys(data)
          .map((key) => `${key}:${data[key]}`)
          .join('\n')
      : '';
  }
}
