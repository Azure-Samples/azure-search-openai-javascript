import process from "node:process";
import path from "node:path";
import * as dotenv from "dotenv";
import fp from "fastify-plugin";

export interface AppConfig {
  openaiApiUrl: string;
  openaiEmbeddingDeploymentId: string;
  openaiChatDeploymentId: string;
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp(
  async (fastify, opts) => {
    const envPath = path.resolve(process.cwd(), "../../.env");

    console.log(`Loading .env config from ${envPath}...`);
    dotenv.config({ path: envPath });

    const config: AppConfig = {
      openaiApiUrl: process.env.AZURE_OPENAI_API_URL || "",
      openaiEmbeddingDeploymentId: process.env.AZURE_OPENAI_EMBEDDING_ID || "text-embedding-ada-002",
      openaiChatDeploymentId: process.env.AZURE_OPENAI_CHATGPT_ID || "gpt-35-turbo",
    };

    // if (!config.openaiApiUrl) {
    //   const message = `OPENAI_API_URL is missing!`;
    //   fastify.log.error(message);
    //   throw new Error(message);
    // }

    fastify.decorate("config", config);
  },
  {
    name: "config",
  },
);

// When using .decorate you have to specify added properties for Typescript
declare module "fastify" {
  export interface FastifyInstance {
    config: AppConfig;
  }
}
