import { resolve } from 'node:path';
import { defineConfig } from 'vite';

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
});
