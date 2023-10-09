import { resolve } from 'node:path';
// eslint-disable-next-line n/no-unpublished-import
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      // eslint-disable-next-line unicorn/prefer-module
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'ChatComponent',
      fileName: 'chat-component',
    },
  },
});
