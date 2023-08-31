import fp from 'fastify-plugin';
import { AccessToken } from '@azure/core-http';
import { OpenAI } from 'openai';
import { Chat, Embeddings } from 'openai/resources/index';

export type OpenAiClients = {
  getChat(): Promise<Chat>;
  getEmbeddings(): Promise<Embeddings>;
};

export default fp(
  async (fastify, opts) => {
    const config = fastify.config;
    const openAiUrl = `https://${config.azureOpenAiService}.openai.azure.com`;

    fastify.log.info(`Using OpenAI at ${openAiUrl}`);

    let openAiToken: AccessToken;
    let chatClient: OpenAI;
    let embeddingsClient: OpenAI;

    const refreshOpenAiToken = async () => {
      if (!openAiToken || openAiToken.expiresOnTimestamp < Date.now() + 60 * 1000) {
        openAiToken = await fastify.azure.credential.getToken('https://cognitiveservices.azure.com/.default');

        const commonOptions = {
          apiKey: openAiToken.token,
          defaultQuery: { 'api-version': '2023-05-15' },
          defaultHeaders: { 'api-key': openAiToken.token },
        };

        // We need two different OpenAI clients, due to limitations with support for Azure OpenAI within the OpenAI JS SDK
        chatClient = new OpenAI({
          ...commonOptions,
          baseURL: `${openAiUrl}/openai/deployments/${config.azureOpenAiChatGptDeployment}`,
        });
        embeddingsClient = new OpenAI({
          ...commonOptions,
          baseURL: `${openAiUrl}/openai/deployments/${config.azureOpenAiEmbDeployment}`,
        });
      }
    };

    fastify.decorate('openai', {
      async getChat() {
        await refreshOpenAiToken();
        return chatClient.chat;
      },
      async getEmbeddings() {
        await refreshOpenAiToken();
        return embeddingsClient.embeddings;
      },
    });
  },
  {
    name: 'openai',
    dependencies: ['azure', 'config'],
  },
);

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    openai: OpenAiClients;
  }
}
