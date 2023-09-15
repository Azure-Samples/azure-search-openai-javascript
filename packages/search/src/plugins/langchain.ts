import fp from 'fastify-plugin';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { type OpenAIChatInput } from 'langchain/dist/types/openai-types';

export type LangchainService = {
  getChat(options?: Partial<OpenAIChatInput>): Promise<ChatOpenAI>;
  getEmbeddings(options?: Partial<OpenAIChatInput>): Promise<OpenAIEmbeddings>;
};

export default fp(
  async (fastify, _options) => {
    const config = fastify.config;
    const getAzureOpenAiOptions = (apiToken: string) => ({
      openAIApiKey: apiToken,
      azureOpenAIApiVersion: fastify.openai.config.apiVersion,
      azureOpenAIApiKey: apiToken,
      azureOpenAIBasePath: `${fastify.openai.config.apiUrl}/openai/deployments`,
    });

    fastify.decorate('langchain', {
      async getChat(options?: Partial<OpenAIChatInput>) {
        const apiToken = await fastify.openai.getApiToken();
        return new ChatOpenAI({
          ...options,
          ...getAzureOpenAiOptions(apiToken),
          azureOpenAIApiDeploymentName: config.azureOpenAiChatGptDeployment,
        } as any);
      },
      async getEmbeddings(options?: Partial<OpenAIChatInput>) {
        const apiToken = await fastify.openai.getApiToken();
        return new OpenAIEmbeddings({
          ...options,
          ...getAzureOpenAiOptions(apiToken),
          azureOpenAIApiDeploymentName: config.azureOpenAiEmbeddingDeployment,
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
