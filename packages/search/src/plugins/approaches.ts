import fp from 'fastify-plugin';
import { type AskApproach, AskRetrieveThenRead, type ChatApproach, ChatReadRetrieveRead } from '../lib/index.js';

export type Approaches = { chat: Record<string, ChatApproach>; ask: Record<string, AskApproach> };

export default fp(
  async (fastify, _options) => {
    const config = fastify.config;

    // Various approaches to integrate GPT and external knowledge.
    // Most applications will use a single one of these patterns or some derivative,
    // here we include several for exploration purposes.
    fastify.decorate('approaches', {
      chat: {
        rrr: new ChatReadRetrieveRead(
          fastify.azure.search,
          fastify.openai,
          config.azureOpenAiChatGptModel,
          config.azureOpenAiEmbeddingModel,
          config.kbFieldsSourcePage,
          config.kbFieldsContent,
        ),
      },
      ask: {
        rtr: new AskRetrieveThenRead(
          fastify.azure.search,
          fastify.openai,
          config.azureOpenAiChatGptModel,
          config.azureOpenAiEmbeddingModel,
          config.kbFieldsSourcePage,
          config.kbFieldsContent,
        ),
      },
    });
  },
  { name: 'approaches', dependencies: ['config', 'azure', 'openai', 'langchain'] },
);

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    approaches: Approaches;
  }
}
