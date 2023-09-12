import fp from 'fastify-plugin';
import sensible, { type SensibleOptions } from '@fastify/sensible';

/**
 * This plugins adds some utilities to handle http errors
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp<SensibleOptions>(async (fastify) => {
  fastify.register(sensible);

  fastify.addSchema({
    $id: 'httpError',
    type: 'object',
    properties: {
      statusCode: { type: 'number' },
      code: { type: 'string' },
      error: { type: 'string' },
      message: { type: 'string' },
    },
  });
});
