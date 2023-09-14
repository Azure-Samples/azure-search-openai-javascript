import { type FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';

const root: FastifyPluginAsyncJsonSchemaToTs = async (fastify, _options): Promise<void> => {
  fastify.get('/', async function (_request, _reply) {
    return { root: true };
  });

  fastify.post('/chat', {
    schema: {
      body: {
        type: 'object',
        properties: {
          approach: {
            type: 'string',
          },
          history: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                bot: {
                  type: 'string',
                },
                user: {
                  type: 'string',
                },
              },
            },
          },
          overrides: {
            type: 'object',
            additionalProperties: {
              type: 'integer',
            },
          },
        },
        required: ['approach', 'history'],
      } as const,
    },
    handler: async function (request, reply) {
      const { approach } = request.body;
      const chatApproach = fastify.approaches.chat[approach];
      if (!chatApproach) {
        reply.code(400);
        return {
          error: `Chat approach "${approach}" is unknown or not implemented.`,
        };
      }

      const { history, overrides } = request.body;
      try {
        return await chatApproach.run(history, overrides ?? {});
      } catch (_error: unknown) {
        const error = _error as Error;
        fastify.log.error(error);
        reply.code(500);
        return { error: `Unknown server error: ${error.message}` };
      }
    },
  });

  fastify.post('/ask', {
    schema: {
      body: {
        type: 'object',
        properties: {
          approach: {
            type: 'string',
          },
          question: {
            type: 'string',
          },
          overrides: {
            type: 'object',
            additionalProperties: {
              type: 'integer',
            },
          },
        },
        required: ['approach', 'question'],
      },
    } as const,
    handler: async function (request, reply) {
      const { approach } = request.body;
      const askApproach = fastify.approaches.ask[approach];
      if (!askApproach) {
        reply.code(400);
        return {
          error: `Ask approach "${approach}" is unknown or not implemented.`,
        };
      }

      const { overrides, question } = request.body;
      try {
        return await askApproach.run(question, overrides ?? {});
      } catch (_error: unknown) {
        const error = _error as Error;
        fastify.log.error(error);
        reply.code(500);
        return { error: `Unknown server error: ${error.message}` };
      }
    },
  });
};

export default root;
