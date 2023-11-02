import { resolve } from 'node:path';
// eslint-disable-next-line n/no-unpublished-import
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      // eslint-disable-next-line unicorn/prefer-module, no-undef
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'chat-component',
      fileName: 'chat-component',
    },
  },
});
