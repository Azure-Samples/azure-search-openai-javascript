import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/chat-component.ts',
  output: {
    file: 'dist/bundle.js',
    name: 'bundle',
    format: 'umd',
    sourcemap: true
  },
  plugins: [
    typescript(),
    terser(),
  ]
};