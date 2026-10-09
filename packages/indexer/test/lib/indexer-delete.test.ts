import assert from 'node:assert/strict';
import { test } from 'node:test';
import pino from 'pino';
import { Indexer } from '../../src/lib/indexer.js';
import { type AzureClients } from '../../src/plugins/azure.js';
import { type OpenAiService } from '../../src/plugins/openai.js';

const openai: OpenAiService = {
  config: { apiUrl: '', apiVersion: '' },
  async getEmbeddings() {
    throw new Error('Embeddings are not used in this test');
  },
  async getApiToken() {
    throw new Error('API tokens are not used in this test');
  },
};

function createIndexer(files: Array<{ id: string; sourcefile: string }>, blobs: string[] = []) {
  const documents = new Map(files.map((file) => [file.id, file]));
  const storedBlobs = new Set(blobs);
  const filters: Array<string | undefined> = [];
  const deletedIds: string[] = [];
  const deletedBlobs: string[] = [];
  let requestedIndex: string | undefined;

  const searchClient = {
    async search(_text: string, options: { filter?: string }) {
      filters.push(options.filter);
      let selected = [...documents.values()];
      if (options.filter !== undefined) {
        const literal = /^sourcefile eq '((?:[^']|'')*)'$/.exec(options.filter);
        assert.ok(literal, `Expected a single quoted sourcefile equality, got ${options.filter}`);
        const filename = literal[1].replaceAll("''", "'");
        selected = selected.filter((document) => document.sourcefile === filename);
      }
      return {
        count: selected.length,
        results: (async function* () {
          for (const document of selected) {
            yield { document };
          }
        })(),
      };
    },
    async deleteDocuments(items: Array<{ id: string }>) {
      for (const item of items) {
        deletedIds.push(item.id);
        documents.delete(item.id);
      }
      return { results: items };
    },
  };
  const azure = {
    searchIndex: {
      getSearchClient(index: string) {
        requestedIndex = index;
        return searchClient;
      },
    },
    blobContainer: {
      async exists() {
        return true;
      },
      getBlockBlobClient(name: string) {
        return {
          async deleteIfExists() {
            if (storedBlobs.delete(name)) {
              deletedBlobs.push(name);
            }
          },
        };
      },
    },
  } as unknown as AzureClients;

  return {
    indexer: new Indexer(pino({ level: 'silent' }), azure, openai),
    documents,
    storedBlobs,
    filters,
    deletedIds,
    deletedBlobs,
    get requestedIndex() {
      return requestedIndex;
    },
  };
}

test('deletes only the requested file and its exact blob, including filenames with special characters', async () => {
  for (const filename of ['notes.txt', "l'équipe 日本語.txt", "notes' or sourcefile ne 'notes.txt", 'report[1].txt']) {
    const state = createIndexer(
      [
        { id: 'target-1', sourcefile: filename },
        { id: 'target-2', sourcefile: filename },
        { id: 'other', sourcefile: `${filename}.backup` },
      ],
      [filename, `${filename}.backup`],
    );

    await state.indexer.deleteFromIndex('test-index', filename);

    assert.equal(state.requestedIndex, 'test-index');
    assert.deepEqual(state.deletedIds, ['target-1', 'target-2']);
    assert.deepEqual([...state.documents.keys()], ['other']);
    assert.deepEqual(state.deletedBlobs, [filename]);
    assert.deepEqual([...state.storedBlobs], [`${filename}.backup`]);
    assert.ok(state.filters.every((filter) => filter === state.filters[0]));
    assert.equal(state.filters[0], `sourcefile eq '${filename.replaceAll("'", "''")}'`);
  }
});

test('removes the exact blob even when no indexed sections remain', async () => {
  const state = createIndexer([{ id: 'other', sourcefile: 'other.txt' }], ['missing.txt', 'other.txt']);

  await state.indexer.deleteFromIndex('test-index', 'missing.txt');

  assert.deepEqual(state.deletedIds, []);
  assert.deepEqual(state.deletedBlobs, ['missing.txt']);
  assert.deepEqual([...state.storedBlobs], ['other.txt']);
});

test('rejects absent, empty and non-string filenames before any search or blob deletion', async () => {
  const state = createIndexer([{ id: 'other', sourcefile: 'other.txt' }], ['other.txt']);
  // eslint-disable-next-line unicorn/no-null
  for (const filename of [undefined, null, '', 0, false, {}]) {
    await assert.rejects(Reflect.apply(state.indexer.deleteFromIndex, state.indexer, ['test-index', filename]), {
      name: 'TypeError',
      message: 'Filename is required to delete a file from the index',
    });
  }

  assert.deepEqual(state.filters, []);
  assert.deepEqual(state.deletedIds, []);
  assert.deepEqual(state.deletedBlobs, []);
  assert.deepEqual([...state.documents.keys()], ['other']);
  assert.deepEqual([...state.storedBlobs], ['other.txt']);
});
