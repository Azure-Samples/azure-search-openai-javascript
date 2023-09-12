import process from 'node:process';
import path from 'node:path';
import * as dotenv from 'dotenv';
import fp from 'fastify-plugin';

export interface AppConfig {
  azureStorageAccount: string;
  azureStorageContainer: string;
  azureSearchService: string;
  azureSearchIndex: string;
  azureOpenAiService: string;
  azureOpenAiChatGptDeployment: string;
  azureOpenAiChatGptModel: string;
  azureOpenAiEmbDeployment: string;
  kbFieldsContent: string;
  kbFieldsSourcePage: string;
}

const camelCaseToUpperSnakeCase = (string_: string) => string_.replaceAll(/[A-Z]/g, (l) => `_${l}`).toUpperCase();

export default fp(
  async (fastify, _options) => {
    const environmentPath = path.resolve(process.cwd(), '../../.env');

    console.log(`Loading .env config from ${environmentPath}...`);
    dotenv.config({ path: environmentPath });

    const config: AppConfig = {
      azureStorageAccount: process.env.AZURE_STORAGE_ACCOUNT || '',
      azureStorageContainer: process.env.AZURE_STORAGE_CONTAINER || '',
      azureSearchService: process.env.AZURE_SEARCH_SERVICE || '',
      azureSearchIndex: process.env.AZURE_SEARCH_INDEX || '',
      azureOpenAiService: process.env.AZURE_OPENAI_SERVICE || '',
      azureOpenAiChatGptDeployment: process.env.AZURE_OPENAI_CHATGPT_DEPLOYMENT || '',
      azureOpenAiChatGptModel: process.env.AZURE_OPENAI_CHATGPT_MODEL || 'gpt-35-turbo',
      azureOpenAiEmbDeployment: process.env.AZURE_OPENAI_EMB_DEPLOYMENT || '',
      kbFieldsContent: process.env.KB_FIELDS_CONTENT || 'content',
      kbFieldsSourcePage: process.env.KB_FIELDS_SOURCEPAGE || 'sourcepage',
    };

    // Check that all config values are set
    for (const [key, value] of Object.entries(config)) {
      if (!value) {
        const message = `${camelCaseToUpperSnakeCase(key)} environment variable must be set`;
        fastify.log.error(message);
        throw new Error(message);
      }
    }

    fastify.decorate('config', config);
  },
  {
    name: 'config',
  },
);

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    config: AppConfig;
  }
}
