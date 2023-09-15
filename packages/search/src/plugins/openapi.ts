import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default fp(async (fastify) => {
  const file = await fs.readFile(join(__dirname, '../../package.json'), 'utf8');
  const packageJson = JSON.parse(file) as Record<string, string>;

  fastify.register(swagger, {
    openapi: {
      info: {
        title: packageJson.name,
        description: packageJson.description,
        version: packageJson.version,
      },
    },
    hideUntagged: true,
    refResolver: {
      buildLocalReference(json) {
        // Keep the same name as the JSON schema
        return String(json.$id);
      },
    },
  });

  fastify.register(swaggerUi, {
    routePrefix: '/openapi',
    staticCSP: true,
  });
});
