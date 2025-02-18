import fp from 'fastify-plugin';
import multipart from '@fastify/multipart';

const FILE_UPLOAD_LIMIT = 20 * 1024 * 1024; // 20 MB

export default fp(async (fastify) => {
  fastify.register(multipart, {
    attachFieldsToBody: true,
    sharedSchemaId: 'multipartField',
    limits: { fileSize: FILE_UPLOAD_LIMIT, files: 1 },
  });
});
