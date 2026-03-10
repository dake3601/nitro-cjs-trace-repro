import { defineHandler } from "nitro/h3";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export default defineHandler(() => {
  // In a production build, Nitro traces dependencies to .output/server/node_modules/
  // This route checks whether bufferutil was correctly traced.
  //
  // bufferutil is a native .node addon that ws loads via CJS require('bufferutil').
  // The bug: Nitro's externals plugin had `if (rOpts.custom?.["node-resolve"]) return null;`
  // which blanket-skipped all CJS require() resolutions, so bufferutil was never
  // added to tracedPaths and never copied to the output.

  const serverDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const nodeModules = resolve(serverDir, "node_modules");

  const deps = ["bufferutil", "node-gyp-build"];
  const results: Record<string, boolean> = {};

  for (const dep of deps) {
    results[dep] = existsSync(resolve(nodeModules, dep));
  }

  return {
    serverDir,
    nodeModulesDir: nodeModules,
    traced: results,
  };
});
