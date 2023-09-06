import fp from 'fastify-plugin';
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';

const AZURE_OPENAI_API_VERSION = '2023-05-15';
const AZURE_COGNITIVE_SERVICES_AD_SCOPE = 'https://cognitiveservices.azure.com/.default';

export default fp(
  async (fastify, opts) => {
    const config = fastify.config;
    const azureOpenAiEndpoint = `https://${config.azureOpenAiService}.openai.azure.com`;

    fastify.log.info(`Using Azure OpenAI at ${azureOpenAiEndpoint}`);

    const azureApiKey = '<include-azure-open-ai-key>';

    const azureOpenAiClient = new OpenAIClient(azureOpenAiEndpoint, new AzureKeyCredential(azureApiKey));

    const refreshOpenAiToken = async () => {
      // TODO: Implement token refresh
    };

    azureOpenAiClient.getCompletions(config.azureOpenAiEmbDeployment, []);
    azureOpenAiClient.getEmbeddings(config.azureOpenAiEmbDeployment, []);

    fastify.decorate('azureOpenAi', {
      config: {
        apiVersion: AZURE_OPENAI_API_VERSION,
        apiUrl: azureOpenAiEndpoint,
      },
    });
  },
  {
    name: 'azureopenai',
    dependencies: ['azure', 'config'],
  },
);

declare module 'fastify';
