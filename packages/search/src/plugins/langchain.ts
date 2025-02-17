import fp from 'fastify-plugin';
import { AzureChatOpenAI, AzureOpenAIEmbeddings, type OpenAIChatInput } from '@langchain/openai';

export type LangchainService = {
  getChat(options?: Partial<OpenAIChatInput>): Promise<AzureChatOpenAI>;
  getEmbeddings(options?: Partial<OpenAIChatInput>): Promise<AzureOpenAIEmbeddings>;
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
        return new AzureChatOpenAI({
          ...options,
          ...getAzureOpenAiOptions(apiToken),
          azureOpenAIApiDeploymentName: config.azureOpenAiChatGptDeployment,
        } as any);
      },
      async getEmbeddings(options?: Partial<OpenAIChatInput>) {
        const apiToken = await fastify.openai.getApiToken();
        return new AzureOpenAIEmbeddings({
          ...options,
          ...getAzureOpenAiOptions(apiToken),
          azureOpenAIApiDeploymentName: config.azureOpenAiEmbeddingDeployment,
        });
      },
    });
  },
  { name: 'langchain', dependencies: ['azure', 'config', 'openai'] },
);

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    langchain: LangchainService;
  }
}
