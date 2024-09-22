import typescript from "@rollup/plugin-typescript";

const sourceDir = './src';
const outputDir = "./lib";
const input = {
  index: `${sourceDir}/index.ts`,
};
const plugins = [typescript()];

export default {
  input,
  plugins,
  output: [
    {
      dir: outputDir,
      format: "esm",
      entryFileNames: "[name].mjs",
    },
    {
      dir: outputDir,
      format: "cjs",
      exports: "auto",
    },
  ],
};
