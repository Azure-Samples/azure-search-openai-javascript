import transformTaggedTemplate from 'rollup-plugin-transform-tagged-template';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import cleaner from 'rollup-plugin-cleaner';
import copy from 'rollup-plugin-copy';
import serve from 'rollup-plugin-serve';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/main.ts',
  output: {
    file: 'dist/bundle.js',
    name: 'bundle',
    format: 'umd',
    sourcemap: true
  },
  plugins: [
    transformTaggedTemplate({
      tagsToProcess: ['html','css'],
      parserOptions: {
        sourceType: "module",
        plugins: [
            "typescript",
            [
                "decorators",
                { decoratorsBeforeExport: true }
            ]
        ]
      },
      transformer(data) {
          data = data.replace(/\s([{}()>~+=^$:!;])\s/gm, '$1');
          data = data.replace(/([",[]])\s+/gm, '$1');
          data = data.replace(/\s{2,}/gm, ' ');
          return data.trim();
      }
    }),
    typescript(),
    resolve(),
    cleaner({
      targets: [
      'dist'
      ]
    }),
    copy({
      targets: [
        { src: 'index.html', dest: 'dist' },
      ]
    }),
    serve({
      open: true,
      contentBase: 'dist'
    }),
    terser(),
  ]
};