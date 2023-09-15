import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { type FastifyPluginAsync } from 'fastify';
import { type JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts';
import { type SchemaTypes } from '../plugins/schemas.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root: FastifyPluginAsync = async (_fastify, _options): Promise<void> => {
  const fastify = _fastify.withTypeProvider<JsonSchemaToTsProvider<{ references: SchemaTypes }>>();

  fastify.get('/', async function (_request, _reply) {
    const packageJson = JSON.parse(await fs.readFile(path.join(__dirname, '../../package.json'), 'utf8'));
    return {
      service: packageJson.name,
      description: packageJson.description,
      version: packageJson.version,
    };
  });

  fastify.get('/content/:path', {
    schema: {
      description: 'Get content file',
      tags: ['content'],
      produces: ['*/*'],
      params: {
        type: 'object',
        properties: {
          path: { type: 'string' },
        },
        required: ['path'],
      },
      response: {
        200: {
          type: 'object',
          format: 'binary',
          additionalProperties: false,
        },
        404: { $ref: 'httpError' },
        500: { $ref: 'httpError' },
      },
    } as const,
    handler: async function (request, reply) {
      const { path } = request.params;
      try {
        const blobClient = await fastify.azure.blobContainer.getBlobClient(path);
        const exists = await blobClient.exists();
        if (!exists) {
          return reply.notFound();
        }
        const properties = await blobClient.getProperties();
        if (!properties?.contentType) {
          return reply.notFound();
        }
        const buffer = await blobClient.downloadToBuffer();
        return reply.type(properties.contentType).send(buffer);
      } catch (_error: unknown) {
        const error = _error as Error;
        fastify.log.error(error);
        return reply.internalServerError(`Unknown server error: ${error.message}`);
      }
    },
  });

  fastify.post('/chat', {
    schema: {
      description: 'Chat with the bot',
      tags: ['chat'],
      body: { $ref: 'chatRequest' },
      response: {
        // 200: { $ref: 'approachResponse' },
        400: { $ref: 'httpError' },
        500: { $ref: 'httpError' },
      },
    } as const,
    handler: async function (request, reply) {
      const { approach } = request.body;
      const chatApproach = fastify.approaches.chat[approach];
      if (!chatApproach) {
        return reply.badRequest(`Chat approach "${approach}" is unknown or not implemented.`);
      }

      const { history, overrides } = request.body;
      try {
        return await chatApproach.run(history, overrides ?? {});
      } catch (_error: unknown) {
        const error = _error as Error;
        fastify.log.error(error);
        return reply.internalServerError(`Unknown server error: ${error.message}`);
      }
    },
  });

  fastify.post('/ask', {
    schema: {
      description: 'Ask the bot a question',
      tags: ['ask'],
      body: { $ref: 'askRequest' },
      response: {
        // 200: { $ref: 'approachResponse' },
        400: { $ref: 'httpError' },
        500: { $ref: 'httpError' },
      },
    } as const,
    handler: async function (request, reply) {
      const { approach } = request.body;
      const askApproach = fastify.approaches.ask[approach];
      if (!askApproach) {
        return reply.badRequest(`Ask approach "${approach}" is unknown or not implemented.`);
      }

      const { overrides, question } = request.body;
      try {
        return await askApproach.run(question, overrides ?? {});
      } catch (_error: unknown) {
        const error = _error as Error;
        fastify.log.error(error);
        return reply.internalServerError(`Unknown server error: ${error.message}`);
      }
    },
  });
};

export default root;
