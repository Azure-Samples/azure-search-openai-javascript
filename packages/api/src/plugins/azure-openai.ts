import fp from 'fastify-plugin';
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';

const AZURE_OPENAI_API_VERSION = '2023-05-15';
const AZURE_COGNITIVE_SERVICES_AD_SCOPE = 'https://cognitiveservices.azure.com/.default';

export default fp(
  async (fastify, opts) => {
    const config = fastify.config;
    const azureOpenAiUrl = `https://${config.azureOpenAiService}.openai.azure.com`;

    fastify.log.info(`Using Azure OpenAI at ${azureOpenAiUrl}`);

    const azureApiKey = '<include-azure-open-ai-key>';

    const azureOpenAiClient = new OpenAIClient(azureOpenAiUrl, new AzureKeyCredential(azureApiKey));

    const refreshOpenAiToken = async () => {
      // TODO: Implement token refresh
    };

    azureOpenAiClient.getChatCompletions(`${azureOpenAiUrl}/${config.azureOpenAiChatGptModel}`, []);

    azureOpenAiClient.getEmbeddings(`${azureOpenAiUrl}/${config.azureOpenAiEmbDeployment}`, []);

    fastify.decorate('azureOpenAi', {
      config: {
        apiVersion: AZURE_OPENAI_API_VERSION,
        apiUrl: azureOpenAiUrl,
      },
    });
  },
  {
    name: 'azureopenai',
    dependencies: ['azure', 'config'],
  },
);

declare module 'fastify';
