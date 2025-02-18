import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import { type FastifyPluginAsync } from 'fastify';
import { type JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts';
import { type SchemaTypes } from '../plugins/schemas.js';
import { type ApproachContext } from '../lib/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const root: FastifyPluginAsync = async (_fastify, _options): Promise<void> => {
  const fastify = _fastify.withTypeProvider<
    JsonSchemaToTsProvider<{
      ValidatorSchemaOptions: { references: SchemaTypes };
      SerializerSchemaOptions: { references: SchemaTypes };
    }>
  >();

  fastify.get('/', async function (_request, _reply) {
    const packageJson = JSON.parse(await fs.readFile(path.join(__dirname, '../../package.json'), 'utf8'));
    return { service: packageJson.name, description: packageJson.description, version: packageJson.version };
  });

  fastify.get('/content/:path', {
    schema: {
      description: 'Get content file',
      tags: ['content'],
      produces: ['*/*'],
      params: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] },
      response: {
        200: { type: 'object', format: 'binary', additionalProperties: false },
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
      const { approach } = request.body.context ?? {};
      const chatApproach = fastify.approaches.chat[approach ?? 'rrr'];
      if (!chatApproach) {
        return reply.badRequest(`Chat approach "${approach}" is unknown or not implemented.`);
      }

      const { messages, context, stream } = request.body;
      let approachContext: ApproachContext = (context as any) ?? {};
      if (this.config.azureSearchSemanticRanker !== 'enabled') {
        approachContext = { ...approachContext, semantic_ranker: false };
      }

      try {
        if (stream) {
          const buffer = new Readable();
          // Dummy implementation needed
          buffer._read = () => {};
          reply.type('application/x-ndjson').send(buffer);

          const chunks = await chatApproach.runWithStreaming(messages, approachContext);
          for await (const chunk of chunks) {
            buffer.push(JSON.stringify(chunk) + '\n');
          }
          // eslint-disable-next-line unicorn/no-null
          buffer.push(null);
        } else {
          return await chatApproach.run(messages, approachContext);
        }
      } catch (_error: unknown) {
        const error = _error as Error & { error?: any; status?: number };
        fastify.log.error(error);
        if (error.error) {
          return reply.code(error.status ?? 500).send(error);
        }

        return reply.internalServerError(error.message);
      }
    },
  });

  fastify.post('/ask', {
    schema: {
      description: 'Ask the bot a question',
      tags: ['ask'],
      body: { $ref: 'chatRequest' },
      response: {
        // 200: { $ref: 'approachResponse' },
        400: { $ref: 'httpError' },
        500: { $ref: 'httpError' },
      },
    } as const,
    handler: async function (request, reply) {
      const { approach } = request.body.context ?? {};
      const askApproach = fastify.approaches.ask[approach ?? 'rtr'];
      if (!askApproach) {
        return reply.badRequest(`Ask approach "${approach}" is unknown or not implemented.`);
      }

      const { messages, context, stream } = request.body;
      let approachContext: ApproachContext = (context as any) ?? {};
      if (this.config.azureSearchSemanticRanker !== 'enabled') {
        approachContext = { ...approachContext, semantic_ranker: false };
      }

      try {
        if (stream) {
          const buffer = new Readable();
          // Dummy implementation needed
          buffer._read = () => {};
          reply.type('application/x-ndjson').send(buffer);

          const chunks = await askApproach.runWithStreaming(messages[0].content, approachContext);
          for await (const chunk of chunks) {
            buffer.push(JSON.stringify(chunk) + '\n');
          }
          // eslint-disable-next-line unicorn/no-null
          buffer.push(null);
        } else {
          return await askApproach.run(messages[0].content, approachContext);
        }
      } catch (_error: unknown) {
        const error = _error as Error & { error?: any; status?: number };
        fastify.log.error(error);
        if (error.error) {
          return reply.code(error.status ?? 500).send(error);
        }

        return reply.internalServerError(error.message);
      }
    },
  });
};

export default root;
