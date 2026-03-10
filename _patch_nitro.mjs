import { readFileSync, writeFileSync } from 'fs';

const f = new URL('./node_modules/nitro/dist/_build/common.mjs', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
let content = readFileSync(f, 'utf8');

const old = [
	'\t\t\t\tif (rOpts.custom?.["node-resolve"]) return null;',
	'\t\t\t\tlet resolved = await this.resolve(id, importer, rOpts);',
	'\t\t\t\tconst cjsResolved = resolved?.meta?.commonjs?.resolved;',
	'\t\t\t\tif (cjsResolved) {',
	'\t\t\t\t\tif (!filter(cjsResolved.id)) return resolved;',
	'\t\t\t\t\tresolved = cjsResolved;',
	'\t\t\t\t}',
].join('\n');

const rep = [
	'\t\t\t\tlet resolved;',
	'\t\t\t\tif (rOpts.custom?.["node-resolve"]) {',
	'\t\t\t\t\tif (!opts.trace) return null;',
	'\t\t\t\t\tconst resolvedPath = tryResolve(id, importer);',
	'\t\t\t\t\tif (!resolvedPath || !filter(resolvedPath)) return null;',
	'\t\t\t\t\tresolved = { id: resolvedPath };',
	'\t\t\t\t} else {',
	'\t\t\t\t\tresolved = await this.resolve(id, importer, rOpts);',
	'\t\t\t\t\tconst cjsResolved = resolved?.meta?.commonjs?.resolved;',
	'\t\t\t\t\tif (cjsResolved) {',
	'\t\t\t\t\t\tif (!filter(cjsResolved.id)) return resolved;',
	'\t\t\t\t\t\tresolved = cjsResolved;',
	'\t\t\t\t\t}',
	'\t\t\t\t}',
].join('\n');

if (content.includes(rep)) {
	console.log('Already patched');
	process.exit(0);
}
if (!content.includes(old)) {
	console.error('ERROR: old string not found (unknown state)');
	process.exit(1);
}
content = content.replace(old, rep);
writeFileSync(f, content, 'utf8');
console.log('Patched successfully');
