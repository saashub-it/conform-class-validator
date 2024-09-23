import typescript from '@rollup/plugin-typescript';

const outputDir = "./lib";
const input = "./src/index.ts";
const plugins = [typescript()];

export default {
  input,
  plugins,
  output: [
    {
      dir: outputDir,
      format: 'esm',
      entryFileNames: '[name].mjs',
    },
    {
      dir: outputDir,
      format: 'cjs',
      exports: 'auto',
    },
  ],
};
