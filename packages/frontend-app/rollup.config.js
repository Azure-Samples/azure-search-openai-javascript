import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/main.ts',
  output: {
    file: 'dist/bundle.js',
    name: 'bundle',
    format: 'umd',
    sourcemap: true,
  },
  plugins: [typescript(), terser()],
};
