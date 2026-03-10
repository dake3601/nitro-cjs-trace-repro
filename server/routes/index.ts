import { defineHandler } from "nitro/h3";
import { WebSocketServer } from "ws";

let wss: WebSocketServer | undefined;

export default defineHandler(() => {
  // Create a WebSocketServer to trigger ws's internal require('bufferutil')
  if (!wss) {
    wss = new WebSocketServer({ noServer: true });
  }

  return {
    ok: true,
    wsReady: !!wss,
    // bufferutil is an optional native dependency of ws.
    // ws loads it via CJS require('bufferutil') internally.
    // Nitro's externals plugin should trace bufferutil to .output/server/node_modules/
    // so it's available at runtime. Without the fix, it's missing.
  };
});
