// paragraph：紙の文章が3つの段落に分かれ、それぞれに「考え1つ」の電球が付く（例文 Each paragraph should have one main idea.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, desk, hp } from './look-over.js';
import { grip } from './hand-over.js';

export const meta = { duration: 4.2, beats: [[0, '文章'], [1.4, '段落に分ける'], [3.2, '各段落に1つ']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const sheet = g({});
  el('rect', { x: -52, y: -64, width: 104, height: 128, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, sheet);
  // 3つの段落（各3行）。最初は間隔なしで並び、段落ごとに隙間が開く
  const rows = [];
  for (let p = 0; p < 3; p++) for (let i = 0; i < 3; i++) rows.push([p, el('line', { x1: -38, x2: i === 2 ? 4 : 34, y1: 0, y2: 0, stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' }, sheet)]);
  const cols = [pal.blue, pal.coral, pal.green];
  const bar = cols.map((c) => el('rect', { x: -46, y: 0, width: 3, height: 26, rx: 1.5, fill: c }, sheet));
  const bulbs = cols.map((c, p) => {
    const bg = g({}, sheet);
    el('circle', { r: 9, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, bg);
    k.text(0, 4, '1', { 'font-size': 11, 'font-weight': 800, fill: pal.ink }, bg);
    return bg;
  });
  const gr = grip(k, pal.mint, pal.mintDark, S);
  return {
    update(t) {
      const up = easeInOut(seg(t, 0.2, 1.0)), sp = easeInOut(seg(t, 1.4, 2.4));
      P(b, { armR: lerp(30, 72, up), lean: 3, mood: t > 3.0 ? 'grin' : 'smile', blink: blinkAt(t), look: 4 });
      const h = hp(b, S, 'R');
      tf(sheet, lerp(300, h.x + 54, up), lerp(182, h.y - 44, up), 0, 0.95, 0.95);
      gr(h);
      rows.forEach(([p, l], i) => {
        const y = -44 + i * 10 + p * 7 * sp - 4;
        k.set(l, { y1: y + 8, y2: y + 8 });
      });
      bar.forEach((r, p) => { k.set(r, { y: -46 + p * 30 + p * 7 * sp, opacity: sp }); });
      bulbs.forEach((bg, p) => {
        const s = backOut(seg(t, 2.6 + p * 0.3, 3.1 + p * 0.3));
        tf(bg, 42, -30 + p * 30 + p * 7 * sp, 0, s + 0.001, s + 0.001);
      });
    }
  };
}
