import { copyFileSync } from 'fs';

const target = new URL('./node_modules/nitro/dist/_build/common.mjs', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const original = new URL('./_nitro_original_common.mjs', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');

copyFileSync(original, target);
console.log('Restored original common.mjs');
