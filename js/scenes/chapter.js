// chapter：本を開くと第1章から物語が始まる（例文 The story begins in the first chapter.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, desk, hp } from './look-over.js';
import { grip } from './hand-over.js';

export const meta = { duration: 4.2, beats: [[0, '閉じた本'], [1.5, '開く'], [3.4, '第1章から']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'home', 240);
  const b = k.buddy({ x: 170, y: FY, scale: S });
  desk(k, 240, 150, 200);
  const book = g({});
  el('rect', { x: -40, y: -30, width: 80, height: 60, rx: 4, fill: pal.coral, stroke: pal.coralDark, 'stroke-width': 2 }, book);
  const pg = g({}, book);
  el('rect', { x: -37, y: -27, width: 36, height: 54, rx: 2, fill: '#fff' }, pg);
  el('rect', { x: 1, y: -27, width: 36, height: 54, rx: 2, fill: '#fff' }, pg);
  el('line', { x1: 0, x2: 0, y1: -27, y2: 27, stroke: pal.line, 'stroke-width': 2 }, pg);
  // 左ページ：第1章の見出し、右ページ：物語の行
  el('rect', { x: -30, y: -20, width: 12, height: 3, rx: 1.5, fill: pal.sub }, pg);
  k.text(-26, 4, '1', { 'font-size': 26, 'font-weight': 800, fill: pal.coralDark }, pg);
  const lines = [-18, -9, 0, 9, 18].map((y) => el('line', { x1: 8, x2: 30, y1: y, y2: y, stroke: pal.sub, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, pg));
  const cover = el('rect', { x: -38, y: -28, width: 76, height: 56, rx: 4, fill: pal.coral, stroke: pal.coralDark, 'stroke-width': 2 }, book);
  const plate = el('rect', { x: -20, y: -14, width: 40, height: 9, rx: 3, fill: '#fff', opacity: 0.85 }, book);
  const gr = grip(k, pal.mint, pal.mintDark, S);
  return {
    update(t) {
      const up = easeInOut(seg(t, 0.3, 1.4)), op = easeOut(seg(t, 1.5, 2.2)), w = seg(t, 2.6, 3.6);
      P(b, { armR: lerp(30, 70, up), lean: 3 + hump(seg(t, 1.5, 2.2)) * 2, mood: t > 3.4 ? 'grin' : 'smile', blink: blinkAt(t), look: 4 });
      const h = hp(b, S, 'R');
      tf(book, lerp(305, h.x + 36, up), lerp(178, h.y - 4, up), 0, lerp(0.7, 0.9, up), lerp(0.7, 0.9, up));
      gr(h);
      const hide = op < 0.5 ? 1 - op * 2 : 0;
      cover.setAttribute('opacity', hide);
      plate.setAttribute('opacity', hide);
      k.set(cover, { width: lerp(76, 2, op), x: lerp(-38, 0, op) });
      pg.setAttribute('opacity', seg(t, 1.8, 2.1));
      lines.forEach((l, i) => k.set(l, { x2: lerp(8, 30, easeOut(seg(w, i * 0.18, i * 0.18 + 0.3))) }));
    }
  };
}
