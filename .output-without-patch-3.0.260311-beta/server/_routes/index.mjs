import { W as WebSocketServer } from "../_libs/ws.mjs";
import { d as defineHandler } from "../_libs/h3.mjs";
import "events";
import "http";
import "stream";
import "crypto";
import "buffer";
import "zlib";
import "../_libs/bufferutil.mjs";
import "../_libs/node-gyp-build.mjs";
import "fs";
import "path";
import "os";
import "https";
import "net";
import "tls";
import "url";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:http";
import "node:stream";
import "node:https";
import "node:http2";
let wss;
const index = defineHandler(() => {
  if (!wss) {
    wss = new WebSocketServer({ noServer: true });
  }
  return {
    ok: true,
    wsReady: !!wss
    // bufferutil is an optional native dependency of ws.
    // ws loads it via CJS require('bufferutil') internally.
    // Nitro's externals plugin should trace bufferutil to .output/server/node_modules/
    // so it's available at runtime. Without the fix, it's missing.
  };
});
export {
  index as default
};
