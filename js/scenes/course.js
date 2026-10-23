// course：机のパソコンで英語の講座の動画を見ながら、1つずつ進めて進行バーが伸びる（例文 I'm taking an online English course.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, desk, hp } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, '講座を開く'], [1.4, '受講する'], [3.4, '進んだ']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.0;
  const FY = roomBg(k, 'home', 240);
  const b = k.buddy({ x: 135, y: FY, scale: S });
  desk(k, 150, 240, 200);
  k.shadow(260, 200, 66, 3);
  // パソコン
  el('rect', { x: 192, y: 112, width: 136, height: 82, rx: 6, fill: pal.ink });
  el('rect', { x: 198, y: 118, width: 124, height: 70, rx: 3, fill: '#fff' });
  el('rect', { x: 180, y: 194, width: 160, height: 8, rx: 4, fill: '#B8C2D2' });
  el('rect', { x: 198, y: 118, width: 124, height: 10, fill: pal.blue });
  el('rect', { x: 203, y: 133, width: 66, height: 40, rx: 3, fill: '#DDEFFA' });
  k.text(236, 160, 'ABC', { 'font-size': 18, fill: pal.blueDark, 'font-weight': 700 });
  const play = el('path', { d: 'M 233 140 L 233 150 L 241 145 Z', fill: pal.coral });
  el('rect', { x: 203, y: 178, width: 66, height: 5, rx: 2.5, fill: pal.line });
  const bar = el('rect', { x: 203, y: 178, width: 1, height: 5, rx: 2.5, fill: pal.green });
  const ticks = [0, 1, 2].map((i) => {
    el('rect', { x: 276, y: 135 + i * 16, width: 12, height: 12, rx: 3, fill: 'none', stroke: pal.sub, 'stroke-width': 2 });
    el('line', { x1: 292, x2: 292 + [22, 18, 24][i], y1: 141 + i * 16, y2: 141 + i * 16, stroke: pal.line, 'stroke-width': 3, 'stroke-linecap': 'round' });
    return el('path', { d: `M 278 ${141 + i * 16} l 3 3 l 6 -7`, fill: 'none', stroke: pal.green, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  });
  return {
    update(t) {
      const pr = seg(t, 1.0, 4.0), typing = t > 0.6 && t < 3.6;
      const o = { x: 135, lean: 4, armL: 8, look: 0.9, mood: t > 3.5 ? 'grin' : 'smile', blink: blinkAt(t) };
      P(b, { ...o, armR: 8 });
      P(b, { ...o, armR: lerp(8, 98, easeOut(seg(t, 0, 0.6))) - (typing ? Math.abs(Math.sin(t * 13)) * 6 : 0) });
      k.set(bar, { width: 1 + pr * 64 });
      ticks.forEach((tk, i) => tk.setAttribute('opacity', pr > (i + 1) / 3 - 0.02 ? 1 : 0));
      play.setAttribute('opacity', Math.floor(t * 3) % 2 && t < 3.6 ? 0.45 : 1);
    }
  };
}
