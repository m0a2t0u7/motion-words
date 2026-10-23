// Node.js 2026-10-21 security release minimums; fail before running QA on an unpatched runtime.
(() => {
  const [major, minor, patch] = process.versions.node.split('.').map(Number);
  const minimum = {22: [23, 4], 24: [22, 1], 26: [12, 1]}[major];
  if (!minimum || minor < minimum[0] || (minor === minimum[0] && patch < minimum[1])) {
    throw new Error('Use patched Node.js 22.23.4, 24.22.1, or 26.12.1 (or newer in those release lines). Current: ' + process.versions.node);
  }
})();

// 収録済み項目の一覧をCSVで出す（候補づくりで重複を避けるため、ChatGPTなどに渡す用）。
// 使い方：node tools/export-csv.mjs > words.csv
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const idx = JSON.parse(readFileSync(join(root, 'data/index.json'), 'utf8'));
const label = Object.fromEntries(idx.cats.map((c) => [c.id, c.label]));
const q = (s) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
console.log('en,category,ja,motion');
for (const i of idx.items) console.log([i.en, label[i.cat], i.ja, i.motion === '3d' ? '3D' : i.motion ? '場面' : 'なし'].map(q).join(','));

