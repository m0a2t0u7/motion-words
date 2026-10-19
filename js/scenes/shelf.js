// shelf：読み終えた2冊の本を持って本棚へ行き、棚のすき間に戻して押し込む（例文 Put the books back on the shelf.）
// 共通ヘルパー：bookcase（本棚）、book（立てた本）
import { seg, lerp, easeInOut, easeOut, wobble } from '../ease.js';
import { reach, hp } from './dig.js';
import { gait } from './weigh.js';
import { P, blinkAt } from './run-after.js';
import { homeBg } from './furniture.js';

// 立てた本（原点＝底の中央）
export function book(k, parent, w, h, c) {
  const g = k.g({}, parent);
  k.el('rect', { x: -w / 2, y: -h, width: w, height: h, rx: 1.5, fill: c }, g);
  k.el('rect', { x: -w / 2 + 2, y: -h + 6, width: w - 4, height: 2.5, fill: '#fff', opacity: 0.55 }, g);
  k.el('rect', { x: -w / 2 + 2, y: -12, width: w - 4, height: 2.5, fill: '#fff', opacity: 0.55 }, g);
  return g;
}
// 本棚（x0〜x1、棚板の y の配列）
export function bookcase(k, x0, x1, ys, FY) {
  const { el, pal } = k;
  k.shadow((x0 + x1) / 2, FY + 1, (x1 - x0) / 2 + 6, 5);
  el('rect', { x: x0 - 6, y: ys[0] - 64, width: x1 - x0 + 12, height: FY - ys[0] + 64, rx: 3, fill: pal.woodDark });
  el('rect', { x: x0, y: ys[0] - 58, width: x1 - x0, height: FY - ys[0] + 52, fill: '#EFD9B8' });
  ys.forEach((y) => el('rect', { x: x0 - 2, y, width: x1 - x0 + 4, height: 6, fill: pal.woodDark }));
}

export const meta = { duration: 4.2, beats: [[0, '本を持つ'], [1.3, '棚に戻す'], [2.8, '並んだ']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9;
  const FY = homeBg(k, { winX: 40, winW: 76 });
  const X0 = 236, X1 = 384, SH = [124, 182];
  bookcase(k, X0, X1, SH, FY);
  const cols = [pal.blue, pal.coral, pal.yellow, pal.violet, pal.green, '#F59E7A', pal.blueDark];
  // 上の段
  let x = X0 + 6;
  for (let i = 0; i < 9; i++) { const w = 11 + (i % 3) * 3, h = 40 + (i * 7) % 14; tf(book(k, k.root, w, h, cols[i % 7]), x + w / 2, SH[0]); x += w + 1; }
  // 下の段：左に本、すき間、右に本
  const GAP = 280.5;
  x = X0 + 6;
  [[10, 42, cols[3]], [13, 46, cols[4]]].forEach(([w, h, c]) => { const n = g({}); book(k, n, w, h, c); tf(n, x + w / 2, SH[1]); x += w + 1; });
  const lean = g({}); book(k, lean, 12, 44, cols[0]);
  x = 307;
  for (let i = 0; i < 6; i++) { const w = 11 + (i % 2) * 4, h = 38 + (i * 5) % 12; const n = g({}); book(k, n, w, h, cols[(i + 2) % 7]); tf(n, x + w / 2, SH[1]); x += w + 1; }
  const b = k.buddy({ x: 70, y: FY, scale: S });
  const pair = g({});
  const bA = book(k, pair, 12, 46, pal.red), bB = book(k, pair, 12, 42, '#7FCB92');
  tf(bA, -6, 0); tf(bB, 7, 0);
  const xf = (t) => lerp(70, 232, easeInOut(seg(t, 0.2, 1.2)));
  return {
    update(t) {
      const w = gait(xf, t, 70, 0, 0.12);
      const put = easeInOut(seg(t, 1.3, 1.9)), push = easeInOut(seg(t, 1.95, 2.3)), off = easeInOut(seg(t, 2.4, 2.8));
      const pose = { x: w.x, walk: w.walk, lean: w.lean + 6 * put * (1 - off), look: 0.6, blink: blinkAt(t), mood: t > 2.6 ? 'grin' : 'smile', armL: w.armL };
      P(b, pose);
      // 2冊は棚の上で立てたまま下ろし、押し込む
      const tgt = { x: GAP + 2 * push, y: SH[1] - 22 };
      let armR = lerp(64, reach(b, S, 'R', tgt.x - 10, tgt.y), put);
      armR = lerp(armR, 8, off);
      P(b, { ...pose, armR });
      const h = hp(b, S, 'R', 28);
      if (t < 1.9) tf(pair, lerp(h.x + 10, GAP - 1, put), lerp(h.y + 22, SH[1], put) - 8 * Math.sin(put * Math.PI));
      else tf(pair, GAP - 1 + push, SH[1]);
      // 倒れていた本がすき間で立ち上がる
      const st = easeOut(seg(t, 1.75, 2.0));
      tf(lean, 300, SH[1], lerp(-24, 0, st) + 2 * wobble(seg(t, 2.0, 2.6), 2, 6));
    }
  };
}
