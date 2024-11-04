import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import alias from "@rollup/plugin-alias";
import { terser } from "rollup-plugin-terser";

export default {
  input: "src/main.ts",
  output: {
    dir: "dist",
    sourcemap: true,
    format: "esm",
    exports: "default",
  },
  external: ["obsidian", "electron"],
  treeshake: true,
  plugins: [
    alias({
      entries: [
        { find: "@src", replacement: "./src" },
      ],
    }),
    typescript(),
    nodeResolve({ browser: false }),
    commonjs(),
    json(),
    terser(),  // Minify for production
  ],
};
