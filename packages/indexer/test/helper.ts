// This file contains code that we reuse between our tests.
import * as helper from 'fastify-cli/helper.js';
import * as path from 'node:path';
import type * as test from 'node:test';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

export type TestContext = { after: typeof test.after };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AppPath = path.join(__dirname, '..', 'src', 'app.ts');

// Fill in this config with all the configurations
// needed for testing the application
async function config() {
  process.env.AZURE_OPENAI_CHATGPT_DEPLOYMENT = 'chat';
  process.env.AZURE_OPENAI_CHATGPT_MODEL = 'gpt-4o-mini';
  process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT = 'embeddings';
  process.env.AZURE_OPENAI_EMBEDDING_MODEL = '';
  process.env.AZURE_OPENAI_SERVICE = 'https://example.com';
  process.env.AZURE_SEARCH_INDEX = 'testindex';
  process.env.AZURE_SEARCH_SERVICE = 'https://example.com';
  process.env.AZURE_STORAGE_ACCOUNT = 'dummystorage';
  process.env.AZURE_STORAGE_CONTAINER = 'testfiles';

  return {};
}

// Automatically build and tear down our instance
async function build(t: TestContext) {
  // you can set all the options supported by the fastify CLI command
  const argv = [AppPath];

  // fastify-plugin ensures that all decorators
  // are exposed for testing purposes, this is
  // different from the production setup
  const app = await helper.build(argv, await config());

  // Tear down our app after we are done
  t.after(() => void app.close());

  return app;
}

export { config, build };
