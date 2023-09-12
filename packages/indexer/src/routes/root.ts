import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { type FastifyPluginAsync } from 'fastify';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const root: FastifyPluginAsync = async (fastify, _options): Promise<void> => {
  fastify.get('/', async function (_request, _reply) {
    const package_ = JSON.parse(await fs.readFile(path.join(__dirname, '../../package.json'), 'utf8'));
    return {
      service: package_.name,
      description: package_.description,
      version: package_.version,
    };
  });
};

export default root;
