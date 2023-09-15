import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { type FastifyPluginAsync } from 'fastify';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const root: FastifyPluginAsync = async (fastify, _options): Promise<void> => {
  fastify.get('/', async function (_request, _reply) {
    const packageJson = JSON.parse(await fs.readFile(path.join(__dirname, '../../package.json'), 'utf8'));
    return {
      service: packageJson.name,
      description: packageJson.description,
      version: packageJson.version,
    };
  });
};

export default root;
