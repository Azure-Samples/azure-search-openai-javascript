import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';

const root: FastifyPluginAsyncJsonSchemaToTs = async (fastify, opts): Promise<void> => {
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
        },
        required: ['name'],
      },
      response: {
        204: {
          description: 'Successfully created index',
          type: 'null',
        },
        400: { $ref: 'httpError' },
        500: { $ref: 'httpError' },
      },
    } as const,
    handler: async function (request, reply) {
      const { name } = request.body;
      try {
        await fastify.indexer.createSearchIndex(name);
        reply.code(204);
      } catch (_error: unknown) {
        const error = _error as Error;
        fastify.log.error(error);
        reply.internalServerError(`Unknown server error: ${error.message}`);
      }
    },
  });

  fastify.delete('/:name', {
    schema: {
      params: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
        },
        required: ['name'],
      },
      response: {
        204: {
          description: 'Successfully deleted index',
          type: 'null',
        },
        500: { $ref: 'httpError' },
      },
    } as const,
    handler: async function (request, reply) {
      const { name } = request.params;
      try {
        await fastify.indexer.deleteSearchIndex(name);
        reply.code(204);
      } catch (_error: unknown) {
        const error = _error as Error;
        fastify.log.error(error);
        reply.internalServerError(`Unknown server error: ${error.message}`);
      }
    },
  });

  fastify.post('/:name/files', {
    schema: {
      // consumes: ['multipart/form-data'],
      params: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
        },
        required: ['name'],
      },
      body: {
        type: 'object',
        properties: {
          category: { $ref: '#multipartField' },
          wait: { $ref: '#multipartField' },
          file: { $ref: '#multipartField' },
        },
        required: ['file'],
      },
      response: {
        202: {
          description: 'File indexing started',
          type: 'null',
        },
        204: {
          description: 'File indexing completed',
          type: 'null',
        },
        400: { $ref: 'httpError' },
        500: { $ref: 'httpError' },
      },
    } as const,
    handler: async function (request, reply) {
      // TOFIX: issue in types generation
      // https://github.com/fastify/fastify-type-provider-json-schema-to-ts/issues/57
      const { file, category, wait } = (request as any).body;
      if (file.type !== 'file') {
        return reply.badRequest('field "file" must be a file');
      }
      if (category && category.type !== 'field') {
        return reply.badRequest('field "category" must be a value');
      }
      if (wait && wait.type !== 'field') {
        return reply.badRequest('field "wait" must be a value');
      }
      const filesInfos = {
        filename: file.filename,
        data: await file.toBuffer(),
        type: file.mimetype,
        category: category?.value,
      };
      try {
        if (Boolean(wait?.value)) {
          fastify.log.info(`Indexing file "${filesInfos.filename}" synchronously`);
          await fastify.indexer.indexFile(request.params.name, filesInfos);
          reply.code(204);
        } else {
          // Do not await this, we want to return 202 immediately
          fastify.indexer.indexFile(request.params.name, filesInfos);
          reply.code(202);
        }
      } catch (_error: unknown) {
        const error = _error as Error;
        fastify.log.error(error);
        reply.internalServerError(`Unknown server error: ${error.message}`);
      }
    },
  });

  fastify.delete('/:name/files/:filename', {
    schema: {
      params: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
          filename: {
            type: 'string',
          },
        },
        required: ['name', 'filename'],
      },
      response: {
        204: {
          description: 'Successfully deleted file',
          type: 'null',
        },
        500: { $ref: 'httpError' },
      },
    } as const,
    handler: async function (request, reply) {
      const { name, filename } = request.params;
      try {
        await fastify.indexer.deleteFromIndex(name, filename);
        reply.code(204);
      } catch (_error: unknown) {
        const error = _error as Error;
        fastify.log.error(error);
        reply.internalServerError(`Unknown server error: ${error.message}`);
      }
    },
  });
};

export default root;
