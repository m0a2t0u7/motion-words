// Node.js 2026-10-21 security release minimums; fail before running QA on an unpatched runtime.
(() => {
  const [major, minor, patch] = process.versions.node.split('.').map(Number);
  const minimum = {22: [23, 4], 24: [22, 1], 26: [12, 1]}[major];
  if (!minimum || minor < minimum[0] || (minor === minimum[0] && patch < minimum[1])) {
    throw new Error('Use patched Node.js 22.23.4, 24.22.1, or 26.12.1 (or newer in those release lines). Current: ' + process.versions.node);
  }
})();

// 語彙データの検証と一覧（data/index.json）の生成。
// 使い方：node tools/build-index.mjs
// 項目を追加・修正したら必ず実行する。収録数はここで数えた実数だけを表示に使う。
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CATS = [
  { id: 'phrasal', label: '句動詞' },
  { id: 'daily', label: '日常単語' },
  { id: 'idiom', label: 'イディオム' },
  { id: 'toeic', label: 'TOEIC語彙' },
  { id: 'word', label: '単語' },
  { id: 'phrase', label: '会話表現' }
];
const REQUIRED = ['id', 'en', 'ipa', 'sense', 'ja', 'ex', 'core'];
const errors = [];
const ids = new Set();
const items = [];

for (const cat of CATS) {
  const file = join(root, 'data/items', `${cat.id}.json`);
  if (!existsSync(file)) continue;
  const list = JSON.parse(readFileSync(file, 'utf8'));
  for (const it of list) {
    for (const f of REQUIRED) if (!it[f]) errors.push(`${it.id || '?'}: ${f} がない`);
    if (!it.ex?.en || !it.ex?.ja) errors.push(`${it.id}: 例文（英・日）がそろっていない`);
    (it.ex?.mark || []).forEach((m) => {
      if (!it.ex.en.includes(m)) errors.push(`${it.id}: mark「${m}」が例文に含まれない`);
    });
    if (ids.has(it.id)) errors.push(`${it.id}: id が重複`);
    ids.add(it.id);
    if (!/^[a-z0-9-]+$/.test(it.id)) errors.push(`${it.id}: id は半角小文字・数字・ハイフンのみ`);
    if (it.motion && !['2d', '3d', 'tpl'].includes(it.motion)) errors.push(`${it.id}: motion は "2d" / "3d" / "tpl"`);
    if (it.motion === 'tpl' && !it.tpl?.t) errors.push(`${it.id}: tpl.t がない`);
    if (it.motion && it.motion !== 'tpl' && !existsSync(join(root, 'js/scenes', `${it.id}.js`))) errors.push(`${it.id}: js/scenes/${it.id}.js がない`);
    const ZT = ['time', 'freq', 'sure', 'degree', 'mind', 'tell', 'judge', 'compare'];
    if (it.zu && !ZT.includes(it.zu.t)) errors.push(`${it.id}: zu.t は ${ZT.join(' / ')}`);
    if (it.zu && it.motion) errors.push(`${it.id}: motion と zu を両方付けない`);
    items.push({ id: it.id, en: it.en, ja: it.ja, cat: cat.id, motion: it.motion || null, ...(it.tpl ? { tpl: it.tpl } : {}), ...(it.zu ? { zu: it.zu } : {}), word: !/\s/.test(it.en.trim()) });
  }
}

if (errors.length) {
  console.error('エラー:\n' + errors.map((e) => ' - ' + e).join('\n'));
  process.exit(1);
}

const count = (f) => items.filter(f).length;
const stats = {
  total: items.length,
  words: count((i) => i.word),
  expressions: count((i) => !i.word),
  motion: count((i) => i.motion),
  motionOwn: count((i) => i.motion && i.motion !== 'tpl'),
  motionTpl: count((i) => i.motion === 'tpl'),
  motion3d: count((i) => i.motion === '3d'),
  zukai: count((i) => !i.motion && i.zu),
  byCat: Object.fromEntries(CATS.map((c) => [c.id, count((i) => i.cat === c.id)]))
};
const out = { version: new Date().toISOString().slice(0, 10), cats: CATS, stats, items };
writeFileSync(join(root, 'data/index.json'), JSON.stringify(out) + '\n');
console.log('OK', JSON.stringify(stats));

