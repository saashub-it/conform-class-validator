const typescript = require('@rollup/plugin-typescript');

const outputDir = './lib';
const input = `./index.ts`;
const plugins = [typescript()];

module.exports = {
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
