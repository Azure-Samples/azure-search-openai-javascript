import process from 'node:process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Expose environment variables to the client
process.env.VITE_SEARCH_API_URI = process.env.BACKEND_URI ?? '';
console.log(`Using search API base URL: "${process.env.VITE_SEARCH_API_URI}"`);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: './dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1024,
  },
  server: {
    proxy: { '/ask': 'http://127.0.0.1:3000', '/chat': 'http://127.0.0.1:3000', '/content': 'http://127.0.0.1:3000' },
  },
});
