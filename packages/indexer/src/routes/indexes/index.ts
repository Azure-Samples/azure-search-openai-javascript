import { type FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';

export interface IndexFileOptionsField {
  category?: string;
  wait?: boolean;
  useVectors?: boolean;
  uploadToStorage?: boolean;
}

const root: FastifyPluginAsyncJsonSchemaToTs = async (fastify, _options): Promise<void> => {
  fastify.post('/', {
    schema: {
      description: 'Create a new search index',
      tags: ['indexes'],
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
        await fastify.indexer.createSearchIndex(name, fastify.config.azureSearchSemanticRanker !== 'enabled');
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
      description: 'Delete a search index',
      tags: ['indexes'],
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
      description: 'Upload a file for indexing',
      tags: ['indexes'],
      consumes: ['multipart/form-data'],
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
          options: { $ref: 'multipartField' },
          // TODO: missing proper file type from ajv plugin
          file: { $ref: 'multipartField' },
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
      const { file, options } = (request as any).body;
      if (file.type !== 'file') {
        return reply.badRequest('field "file" must be a file');
      }
      if (options && options.type !== 'field') {
        return reply.badRequest('field "options" must be a value');
      }
      try {
        const fileOptions = JSON.parse(options?.value ?? '{}') as IndexFileOptionsField;
        fastify.log.info(`Received indexing options: ${JSON.stringify(fileOptions)}`);

        const wait = Boolean(fileOptions?.wait);
        const filesInfos = {
          filename: file.filename,
          data: await file.toBuffer(),
          type: file.mimetype,
          category: fileOptions?.category ?? 'default',
        };
        if (wait) {
          fastify.log.info(`Indexing file "${filesInfos.filename}" synchronously`);
          await fastify.indexer.indexFile(request.params.name, filesInfos, {
            useVectors: fileOptions?.useVectors ?? true,
            uploadToStorage: fileOptions?.uploadToStorage ?? true,
            throwErrors: true,
          });
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
      description: 'Delete a file from the index',
      tags: ['indexes'],
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
