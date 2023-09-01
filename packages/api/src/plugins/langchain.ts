import fp from 'fastify-plugin';
import { OpenAIChatInput } from 'langchain/dist/types/openai-types';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';

export type LangchainService = {
  getChat(): Promise<ChatOpenAI>;
  getEmbeddings(): Promise<OpenAIEmbeddings>;
};

export default fp(
  async (fastify, opts) => {
    const config = fastify.config;
    const getAzureOpenAiOptions = (apiToken: string) => ({
      azureOpenAIApiVersion: fastify.openai.config.apiVersion,
      azureOpenAIApiKey: apiToken,
      azureOpenAIBasePath: `${fastify.openai.config.apiUrl}/openai/deployments`,
      azureOpenAIApiDeploymentName: config.azureOpenAiChatGptDeployment,
    });

    fastify.decorate('langchain', {
      async getChat(options?: Partial<OpenAIChatInput>) {
        const apiToken = await fastify.openai.getApiToken();
        return new ChatOpenAI({
          ...options,
          ...getAzureOpenAiOptions(apiToken),
        });
      },
      async getEmbeddings(options?: Partial<OpenAIChatInput>) {
        const apiToken = await fastify.openai.getApiToken();
        return new OpenAIEmbeddings({
          ...options,
          ...getAzureOpenAiOptions(apiToken),
        });
      },
    });
  },
  {
    name: 'langchain',
    dependencies: ['azure', 'config', 'openai'],
  },
);

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    langchain: LangchainService;
  }
}
