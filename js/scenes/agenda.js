import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { hp } from './dig.js';
import { grip } from './hand-over.js';
import { roomBg, say, desk } from './look-over.js';
// agenda：会議室で、ホワイトボードの議題リストをまめが指しながら1つずつ確認する（例文 What's on the agenda today?）
export const meta = { duration: 4.0, beats: [[0, '今日は何？'], [1.0, '議題を指す'], [3.0, '3つある']] };
export function create(k) {
  const { el, tf, pal, text } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  el('rect', { x: 196, y: 52, width: 170, height: 118, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 4 });
  el('rect', { x: 206, y: 170, width: 150, height: 6, fill: pal.woodDark });
  const rows = [0, 1, 2].map((i) => {
    const y = 80 + i * 32, cols = [pal.blue, pal.coral, pal.green];
    el('circle', { cx: 218, cy: y, r: 10, fill: cols[i] });
    text(218, y + 5, String(i + 1), { 'font-size': 13, fill: '#fff', 'font-weight': 700, 'text-anchor': 'middle' });
    return [el('rect', { x: 238, y: y - 5, width: 0, height: 10, rx: 5, fill: '#C9D3DE' }), el('path', { d: `M 340 ${y} l 5 5 l 10 -11`, fill: 'none', stroke: pal.green, 'stroke-width': 3.5, 'stroke-linecap': 'round', opacity: 0 })];
  });
  const b = k.buddy({ x: 110, y: FY, scale: S });
  const q = say(k, 44, 34, 1); text(0, 7, '?', { 'font-size': 22, 'font-weight': 700, fill: pal.blue, 'text-anchor': 'middle' }, q.g);
  const pt = el('circle', { r: 6, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.5 });
  return {
    update(t) {
      const idx = t < 1.0 ? 0 : t < 1.8 ? 0 : t < 2.4 ? 1 : 2;
      const arm = lerp(40, 85 + (idx - 1) * 14, easeOut(seg(t, 0.6, 1.1)));
      P(b, { x: 110, armR: arm, look: 0.8, lean: 4 * seg(t, 0.6, 1.2), mood: t > 3.0 ? 'grin' : 'smile', blink: blinkAt(t) });
      const h = hp(b, S, 'R'); k.set(pt, { cx: h.x, cy: h.y });
      q.show(t < 0.9 ? seg(t, 0.1, 0.5) : 0, 140, 90);
      rows.forEach(([bar, ck], i) => { const a = 0.9 + i * 0.7; k.set(bar, { width: 90 * easeOut(seg(t, a, a + 0.5)) }); ck.setAttribute('opacity', seg(t, a + 0.5, a + 0.7)); });
    }
  };
}
