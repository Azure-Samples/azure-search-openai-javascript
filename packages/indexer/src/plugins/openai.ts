import fp from 'fastify-plugin';
import { type AccessToken } from '@azure/core-http';
import { OpenAI } from 'openai';
import { type Embeddings } from 'openai/resources/index';

export type OpenAiService = {
  getEmbeddings(): Promise<Embeddings>;
  getApiToken(): Promise<string>;
  config: {
    apiVersion: string;
    apiUrl: string;
  };
};

const AZURE_OPENAI_API_VERSION = '2024-02-01';
const AZURE_COGNITIVE_SERVICES_AD_SCOPE = 'https://cognitiveservices.azure.com/.default';

export default fp(
  async (fastify, _options) => {
    const config = fastify.config;
    const openAiUrl = `https://${config.azureOpenAiService}.openai.azure.com`;

    fastify.log.info(`Using OpenAI at ${openAiUrl}`);

    let openAiToken: AccessToken;
    let embeddingsClient: OpenAI;

    const refreshOpenAiToken = async () => {
      if (!openAiToken || openAiToken.expiresOnTimestamp < Date.now() + 60 * 1000) {
        openAiToken = await fastify.azure.credential.getToken(AZURE_COGNITIVE_SERVICES_AD_SCOPE);

        const commonOptions = {
          apiKey: openAiToken.token,
          defaultQuery: { 'api-version': AZURE_OPENAI_API_VERSION },
          defaultHeaders: { 'api-key': openAiToken.token },
        };

        embeddingsClient = new OpenAI({
          ...commonOptions,
          baseURL: `${openAiUrl}/openai/deployments/${config.azureOpenAiEmbeddingDeployment}`,
        });
      }
    };

    fastify.decorate('openai', {
      async getEmbeddings() {
        await refreshOpenAiToken();
        return embeddingsClient.embeddings;
      },
      async getApiToken() {
        await refreshOpenAiToken();
        return openAiToken.token;
      },
      config: {
        apiVersion: AZURE_OPENAI_API_VERSION,
        apiUrl: openAiUrl,
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
    openai: OpenAiService;
  }
}
