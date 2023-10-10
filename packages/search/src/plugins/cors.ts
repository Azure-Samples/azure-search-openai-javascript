import fp from 'fastify-plugin';
import cors from '@fastify/cors';

export default fp(
  async (fastify) => {
    const allowedOrigins = fastify.config.allowedOrigins.split(',').map((origin) => origin.trim());
    fastify.log.info(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
    fastify.register(cors, {
      origin: allowedOrigins,
    });
  },
  {
    name: 'cors',
    dependencies: ['config'],
  },
);
