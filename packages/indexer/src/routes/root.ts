import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FastifyPluginAsync } from 'fastify';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    const pkg = JSON.parse(await fs.readFile(path.join(__dirname, '../../package.json'), 'utf-8'));
    return {
      service: pkg.name,
      description: pkg.description,
      version: pkg.version,
    };
  });
};

export default root;
