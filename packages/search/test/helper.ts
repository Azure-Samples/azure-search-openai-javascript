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

const APP_PATH = path.join(__dirname, '../src/app.js');
const ENV_PATH = path.join(__dirname, '../../../../.env');

// Fill in this config with all the configurations
// needed for testing the application
async function config() {
  // Copy package.json to the test directory
  await fs.copyFile(path.join(__dirname, '../../package.json'), path.join(__dirname, '../../test-dist/package.json'));

  if (process.env.TAP_SNAPSHOT) {
    try {
      // Check if .env file exists
      await fs.access(ENV_PATH);
    } catch {
      throw new Error(`.env file not found at ${ENV_PATH}: required to update snapshots`);
    }
  } else {
    // Use fixed values when .env file is not present
    // Note: if you update snapshots, you must also update the values here to match your .env file
    process.env.AZURE_OPENAI_CHATGPT_DEPLOYMENT = 'chat';
    process.env.AZURE_OPENAI_CHATGPT_MODEL = 'gpt-3.5-turbo';
    process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT = 'embedding';
    process.env.AZURE_OPENAI_EMBEDDING_MODEL = '';
    process.env.AZURE_OPENAI_SERVICE = 'cog-x2y5k2ccncqou';
    process.env.AZURE_SEARCH_INDEX = 'gptkbindex';
    process.env.AZURE_SEARCH_SERVICE = 'gptkb-x2y5k2ccncqou';
    process.env.AZURE_STORAGE_ACCOUNT = 'stx2y5k2ccncqou';
    process.env.AZURE_STORAGE_CONTAINER = 'content';
  }

  return {};
}

// Automatically build and tear down our instance
async function build(t: Test) {
  // you can set all the options supported by the fastify CLI command
  const argv = [APP_PATH];

  // fastify-plugin ensures that all decorators
  // are exposed for testing purposes, this is
  // different from the production setup
  const app = await helper.build(argv, await config());

  // Tear down our app after we are done
  t.teardown(() => void app.close());

  return app;
}

export { config, build };
