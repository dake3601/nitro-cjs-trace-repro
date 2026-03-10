# Nitro CJS require() tracing bug reproduction

## Problem

Nitro's externals plugin does not trace dependencies loaded via CJS `require()` inside bundled packages.

`ws` is a common WebSocket library that optionally loads native addons (`bufferutil`) via `require('bufferutil')`. These native packages are in Nitro's `NodeNativePackages` list and should be externalized and traced to `.output/server/node_modules/` during production builds.

**Root cause:** In `src/build/plugins/externals.ts`, the `resolveId` handler has:

```js
if (rOpts.custom?.["node-resolve"]) return null;
```

When `@rollup/plugin-node-resolve` resolves a CJS `require()` call, it sets `rOpts.custom: { "node-resolve": { isRequire: true } }`. The line above blanket-skips these resolutions, preventing packages like `bufferutil` from being externalized even when they match the `include` filter.

As a result, `bufferutil` is never added to `tracedPaths` and `traceNodeModules` never copies it to the output `node_modules/`.

## Reproduction

```bash
npm install
npm run build
```

After build, check the output:

```bash
# These should exist but DON'T (bug):
ls .output/server/node_modules/bufferutil/
ls .output/server/node_modules/node-gyp-build/

# Or run the server and hit the check endpoint:
npm run preview
# GET http://localhost:3000/check-trace
```

The `/check-trace` endpoint reports which native deps were traced. With the bug, `bufferutil` and `node-gyp-build` are missing.

## Expected

`bufferutil` and `node-gyp-build` should be traced to `.output/server/node_modules/` because:
1. `bufferutil` is in `NodeNativePackages` (matched by the `include` filter)
2. `ws` loads it via `require('bufferutil')` at runtime
3. The production build uses tracing to copy dependencies to the output

## Fix

In the `resolveId` handler, instead of blanket-skipping CJS resolutions, check `opts.trace` first. In dev mode (no tracing), skip as before. In production, resolve via `tryResolve` and externalize if the resolved path matches the include filter:

```js
if (rOpts.custom?.["node-resolve"]) {
  if (!opts.trace) return null;
  const resolvedPath = tryResolve(id, importer);
  if (!resolvedPath || !filter(resolvedPath)) return null;
  resolved = { id: resolvedPath };
}
```

PR: https://github.com/dake3601/nitro/tree/fix/externals-cjs-require-tracing

Test out with `node ./_patch_nitro.mjs` in the root of this repo, which applies the fix to your local Nitro installation. Then run the reproduction steps again to confirm the fix works.

After testing, run `node ./_unpatch_nitro.mjs` to restore the original Nitro files.

.output-without-patch contains the build output without the patch (missing `bufferutil` and `node-gyp-build`), while .output contains the build output with the patch applied (both dependencies present).
