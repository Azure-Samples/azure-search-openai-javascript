// This file contains code that we reuse between our tests.
import * as helper from 'fastify-cli/helper.js';
import * as path from 'node:path';
import fs from 'node:fs/promises';
import type * as tap from 'tap';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export type Test = (typeof tap)['Test']['prototype'];

const AppPath = path.join(__dirname, '..', 'src', 'app.js');

// Fill in this config with all the configurations
// needed for testing the application
async function config() {
  // Copy package.json to the test directory
  await fs.copyFile(path.join(__dirname, '../../package.json'), path.join(__dirname, '../../test-dist/package.json'));

  process.env.AZURE_OPENAI_CHATGPT_DEPLOYMENT = 'chat';
  process.env.AZURE_OPENAI_CHATGPT_MODEL = 'gpt-3.5-turbo';
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
async function build(t: Test) {
  // you can set all the options supported by the fastify CLI command
  const argv = [AppPath];

  // fastify-plugin ensures that all decorators
  // are exposed for testing purposes, this is
  // different from the production setup
  const app = await helper.build(argv, await config());

  // Tear down our app after we are done
  t.teardown(() => void app.close());

  return app;
}

export { config, build };
