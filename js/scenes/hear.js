// hear：部屋で本を読んでいると、窓の外で鳥が鳴き、まめが耳に手を当てて聞く（例文 I can hear birds outside.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { win } from './run-after.js';
import { waves } from './look-over.js';
import { hp } from './dig.js';
import { icon } from './in-common.js';

export const meta = { duration: 4.2, beats: [[0, '本を読む'], [1.4, '鳥が鳴く'], [2.6, '聞こえる']] };

function bird(k, c) {
  const o = k.g({}), b = k.g({}, o);
  k.el('ellipse', { cx: 0, cy: -8, rx: 11, ry: 9, fill: c }, b);
  k.el('circle', { cx: 7, cy: -15, r: 6, fill: c }, b);
  k.el('path', { d: 'M -8 -10 Q -18 -12 -20 -4 Q -12 -4 -6 -6 Z', fill: '#00000022' }, b);
  k.el('circle', { cx: 9, cy: -16, r: 1.6, fill: k.pal.ink }, b);
  const beak = k.el('path', { d: 'M 12 -16 L 18 -14 L 12 -12 Z', fill: k.pal.yellowDark }, b);
  k.el('line', { x1: -2, y1: 0, x2: -2, y2: 3, stroke: k.pal.ink, 'stroke-width': 1.5 }, o);
  k.el('line', { x1: 3, y1: 0, x2: 3, y2: 3, stroke: k.pal.ink, 'stroke-width': 1.5 }, o);
  return { o, b, beak };
}

export function create(k) {
  const { el, tf, pal } = k, S = 0.85;
  const FY = k.backdrop({ floorY: 238, mood: 'indoor' });
  const w = win(k, 220, 40, 150, 110, '#CFE9F7');
  // 窓の外：木の枝と鳥
  el('circle', { cx: 330, cy: 70, r: 40, fill: '#9ED9A8' }, w.inner);
  el('path', { d: 'M 372 160 Q 330 112 238 116', stroke: pal.woodDark, 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, w.inner);
  const birds = [bird(k, pal.yellow), bird(k, pal.blue)];
  birds.forEach((x) => w.inner.appendChild(x.o));
  tf(birds[0].o, 270, 114); tf(birds[1].o, 318, 120, 0, -1, 1);
  w.frame();
  const notes = [0, 1, 2].map((i) => { const n = icon(k, 'note'); return n; });
  // 椅子
  el('rect', { x: 84, y: FY - 92, width: 12, height: 92, rx: 5, fill: pal.woodDark });
  el('rect', { x: 84, y: FY - 44, width: 76, height: 10, rx: 4, fill: pal.wood });
  el('rect', { x: 150, y: FY - 34, width: 7, height: 34, fill: pal.woodDark });
  const b = k.buddy({ x: 122, y: FY - 34, scale: S });
  b.g.children[0].setAttribute('opacity', 0);
  const book = icon(k, 'book');
  const wv = waves(k, pal.blue);
  return {
    update(t) {
      const turn = easeInOut(seg(t, 1.7, 2.3)), ear = easeOut(seg(t, 2.3, 2.8));
      b.pose({ x: 122, y: FY - 34, armL: 8, armR: lerp(lerp(62, 40, turn), 142, ear), lean: lerp(10, -6, turn), look: lerp(0.2, 1, turn), mood: t > 2.6 ? 'grin' : 'smile', blink: t > 3.0 ? 0 : hump(seg(t, 0.8, 1.0)) });
      // 本：はじめは手に、耳に手を当てたら膝の上へ
      if (ear < 0.05) { const h = hp(b, S, 'R', 30); tf(book, h.x + 6, h.y - 6, -12, 0.95); }
      else tf(book, 150, FY - 52, -6, 0.9);
      const sing = (i) => Math.max(0, Math.sin((t - 1.2 - i * 0.35) * 9)) * (t > 1.2 ? 1 : 0);
      birds.forEach((x, i) => { const s = sing(i); tf(x.beak, 12, -14, -18 * s, 1, 1); x.beak.setAttribute('transform', `rotate(${(-14 * s).toFixed(1)} 12 -14)`); tf(x.b, 0, -2 * s); });
      notes.forEach((n, i) => { const q = ((t - 1.2 - i * 0.5) / 1.4), u = q - Math.floor(q);
        tf(n, lerp(276 - i * 10, 200 - i * 6, u), 96 - u * 22 + Math.sin(u * 9) * 3, 0, 0.8); n.setAttribute('opacity', t > 1.2 ? Math.sin(u * Math.PI) : 0); });
      wv(seg(t, 2.4, 2.8), (t * 0.8) % 1, 186, FY - 106, -1, 1);
    }
  };
}
