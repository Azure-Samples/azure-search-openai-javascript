import fp from 'fastify-plugin';
import { Indexer } from '../lib/index.js';

export default fp(
  async (fastify, _options) => {
    const config = fastify.config;

    fastify.decorate(
      'indexer',
      new Indexer(fastify.log, fastify.azure, fastify.openai, config.azureOpenAiEmbeddingModel),
    );
  },
  {
    name: 'indexer',
    dependencies: ['config', 'azure', 'openai'],
  },
);

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    indexer: Indexer;
  }
}
