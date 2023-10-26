import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Expose environment variables to the client
process.env.VITE_CHAT_API_URI = process.env.CHAT_API_URI ?? '';
console.log(`Using search API base URL: "${process.env.VITE_CHAT_API_URI}"`);

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      // eslint-disable-next-line unicorn/prefer-module
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'azc-chat',
      fileName: 'azc-chat',
    },
  },
  server: {
    proxy: {
      '/ask': 'http://127.0.0.1:3000',
      '/chat': 'http://127.0.0.1:3000',
      '/content': 'http://127.0.0.1:3000',
    },
  },
});
