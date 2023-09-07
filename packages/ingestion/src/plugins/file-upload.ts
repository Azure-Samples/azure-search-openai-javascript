import fp from 'fastify-plugin';
import multipart from '@fastify/multipart';
import fileUpload from 'fastify-file-upload';

const FILE_UPLOAD_LIMIT = 20 * 1024 * 1024; // 20 MB

export default fp(async (fastify) => {
  fastify.register(multipart);

  fastify.register(fileUpload, {
    limits: { fileSize: FILE_UPLOAD_LIMIT },
  });
});
