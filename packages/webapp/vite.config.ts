import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: './dist',
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    proxy: {
      '/ask': 'http://127.0.0.1:3000',
      '/chat': 'http://127.0.0.1:3000',
      '/content': 'http://127.0.0.1:3000',
    },
  },
});
