// tie up：積んだ箱にひもを縦・横に回し、上でしっかり結ぶ（例文 She tied up the boxes with string.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { reach } from './dig.js';
import { pop } from './queue-up.js';

export const meta = { duration: 4.2, beats: [[0, '積んだ箱'], [1.6, 'ひもを回す'], [3.6, '結べた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 290, y: 46, width: 80, height: 62, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 4 });
  const BX = 236, CB = '#E2B680', CD = '#C9975C';
  k.shadow(BX, FY + 1, 56, 5);
  [[FY - 44, 92, 44], [FY - 84, 80, 40]].forEach(([y, w, h]) => {
    el('rect', { x: BX - w / 2, y, width: w, height: h, rx: 3, fill: CB, stroke: CD, 'stroke-width': 2 });
    el('rect', { x: BX - 10, y, width: 20, height: 6, fill: '#F0D3A6' });
  });
  const top = FY - 84;
  const V = el('line', { x1: BX, y1: top, x2: BX, y2: FY, stroke: '#B04A3C', 'stroke-width': 3, 'stroke-linecap': 'round' });
  const H1 = el('line', { x1: BX - 46, y1: FY - 22, x2: BX + 46, y2: FY - 22, stroke: '#B04A3C', 'stroke-width': 3, 'stroke-linecap': 'round' });
  const H2 = el('line', { x1: BX - 40, y1: FY - 64, x2: BX + 40, y2: FY - 64, stroke: '#B04A3C', 'stroke-width': 3, 'stroke-linecap': 'round' });
  const bow = g({});
  el('path', { d: 'M 0 0 Q -16 -14 -18 -2 Q -14 6 0 0 Z M 0 0 Q 16 -14 18 -2 Q 14 6 0 0 Z', fill: '#C65A4A', stroke: '#9A3E33', 'stroke-width': 1.5 }, bow);
  el('path', { d: 'M -2 1 L -9 13 M 2 1 L 9 13', stroke: '#B04A3C', 'stroke-width': 3, 'stroke-linecap': 'round' }, bow);
  el('circle', { r: 3.5, fill: '#9A3E33' }, bow);
  const S = 1;
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const ball = el('circle', { r: 5, fill: '#B04A3C' });
  const dash = (n, len, p) => k.set(n, { 'stroke-dasharray': `${(len * p).toFixed(1)} 400` });
  return {
    update(t) {
      const pv = easeInOut(seg(t, 0.5, 1.4)), p1 = easeInOut(seg(t, 1.5, 2.2)), p2 = easeInOut(seg(t, 2.3, 2.9));
      dash(V, 84, pv); dash(H1, 92, p1); dash(H2, 80, p2);
      let tip;
      if (t < 1.45) tip = { x: BX, y: lerp(top, FY, pv) };
      else if (t < 2.25) tip = { x: BX - 46 + 92 * p1, y: FY - 22 };
      else if (t < 2.95) tip = { x: BX - 40 + 80 * p2, y: FY - 64 };
      else tip = { x: BX, y: top - 4 };
      // 手が届く範囲へ：結び目は上
      const pull = hump(seg(t, 3.1, 3.5));
      const a = reach(b, S, 'R', Math.min(tip.x, 196), tip.y - pull * 10);
      const into = easeOut(seg(t, 0.2, 0.5));
      b.pose({ x: 150, armR: lerp(12, a, into), armL: 10 + 30 * pull, lean: 6 * into, squash: 1 - 0.05 * pull, mood: t > 3.6 ? 'grin' : 'flat', look: 0.5 });
      const k2 = pop(seg(t, 3.15, 3.6));
      tf(bow, BX, top - 2, 6 * wobble(seg(t, 3.3, 4.0), 2, 5), Math.max(0.001, k2));
      tf(ball, tip.x, tip.y); ball.setAttribute('opacity', t < 3.2 ? 1 : 0);
    }
  };
}
