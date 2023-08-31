import fp from 'fastify-plugin';
import { AskApproach, ChatApproach, ChatReadRetrieveRead } from '../lib/index.js';

export type Approaches = {
  chat: Record<string, ChatApproach>;
  ask: Record<string, AskApproach>;
};

export default fp(
  async (fastify, opts) => {
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
          config.kbFieldsSourcePage,
          config.kbFieldsContent,
        ),
      },
      ask: {},
    });
  },
  {
    name: 'approaches',
    dependencies: ['config', 'azure', 'openai'],
  },
);

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    approaches: Approaches;
  }
}
