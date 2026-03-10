import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { d as defineHandler } from "../_libs/h3.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:http";
import "node:stream";
import "node:https";
import "node:http2";
const checkTrace = defineHandler(() => {
  const serverDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const nodeModules = resolve(serverDir, "node_modules");
  const deps = ["bufferutil", "node-gyp-build"];
  const results = {};
  for (const dep of deps) {
    results[dep] = existsSync(resolve(nodeModules, dep));
  }
  return {
    serverDir,
    nodeModulesDir: nodeModules,
    traced: results
  };
});
export {
  checkTrace as default
};
