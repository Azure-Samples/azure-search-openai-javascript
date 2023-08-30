import fp from 'fastify-plugin';
import { OpenAI } from 'openai';

// TODO: use getters instead that checks if token is expired and refreshes it
export default fp(
  async (fastify, opts) => {
    const config = fastify.config;
    const openAiUrl = `https://${config.azureOpenAiService}.openai.azure.com`;
    const openAiToken = await fastify.azure.credential.getToken('https://cognitiveservices.azure.com/.default');

    fastify.log.info(`Using OpenAI at ${openAiUrl}`);

    const commonOptions = {
      apiKey: openAiToken.token,
      defaultQuery: { 'api-version': '2023-05-15' },
      defaultHeaders: { 'api-key': openAiToken.token },
    };

    const chat = new OpenAI({
      ...commonOptions,
      baseURL: `${openAiUrl}/openai/deployments/${config.azureOpenAiChatGptDeployment}`,
    });
    const embeddings = new OpenAI({
      ...commonOptions,
      baseURL: `${openAiUrl}/openai/deployments/${config.azureOpenAiEmbDeployment}`,
    });

    fastify.decorate('openai', {
      chat,
      embeddings,
    });
  },
  {
    name: 'openai',
    dependencies: ['azure'],
  },
);

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    openai: any;
  }
}
