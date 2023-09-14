import { type FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';

const root: FastifyPluginAsyncJsonSchemaToTs = async (fastify, _options): Promise<void> => {
  fastify.get('/', async function (_request, _reply) {
    return { root: true };
  });

  fastify.get('/content/:path', {
    schema: {
      params: {
        type: 'object',
        properties: {
          path: { type: 'string' },
        },
        required: ['path'],
      },
      response: {
        200: {},
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
      body: {
        type: 'object',
        properties: {
          approach: { type: 'string' },
          history: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                bot: { type: 'string' },
                user: { type: 'string' },
              },
            },
          },
          overrides: {
            type: 'object',
            additionalProperties: { type: 'string' },
          },
        },
        required: ['approach', 'history'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            data_points: {
              type: 'array',
              items: { type: 'string' },
            },
            answer: { type: 'string' },
            thoughts: { type: 'string' },
          },
          required: ['data_points', 'answer', 'thoughts'],
          additionalProperties: false,
        },
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
      body: {
        type: 'object',
        properties: {
          approach: { type: 'string' },
          question: { type: 'string' },
          overrides: {
            type: 'object',
            additionalProperties: { type: 'integer' },
          },
        },
        required: ['approach', 'question'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            data_points: {
              type: 'array',
              items: { type: 'string' },
            },
            answer: { type: 'string' },
            thoughts: { type: 'string' },
          },
          required: ['data_points', 'answer', 'thoughts'],
          additionalProperties: false,
        },
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
