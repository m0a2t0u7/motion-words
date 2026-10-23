// internet：インターネット（地球マーク）で検索して調べる（例文 I looked it up on the internet.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { roomBg, desk, say, cloud } from './look-over.js';
import { hp, held, reach } from './dig.js';
function pz(b, S, o, R, L) { P(b, o); const a = {}; if (R) a.armR = reach(b, S, 'R', R[0], R[1]); if (L) a.armL = reach(b, S, 'L', L[0], L[1]); P(b, { ...o, ...a }); }

export const meta = { duration: 4.2, beats: [[0, '調べたい'], [1.2, '検索する'], [3.0, '答えが出た']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = roomBg(k, 'home');
  const S = 1.1;
  const b = k.buddy({ x: 175, y: FY, scale: S });
  el('rect', { x: 216, y: 66, width: 168, height: 122, rx: 8, fill: '#3A4456' });
  el('rect', { x: 223, y: 73, width: 154, height: 108, rx: 3, fill: '#fff' });
  el('rect', { x: 223, y: 73, width: 154, height: 14, fill: '#E3E9F1' });
  el('rect', { x: 236, y: 91, width: 128, height: 18, rx: 9, fill: '#fff', stroke: pal.blue, 'stroke-width': 2 });
  el('circle', { cx: 350, cy: 100, r: 4, fill: 'none', stroke: pal.blue, 'stroke-width': 2 });
  el('path', { d: 'M 353 103 L 357 107', stroke: pal.blue, 'stroke-width': 2, 'stroke-linecap': 'round' });
  const qt = el('rect', { x: 244, y: 97, width: 0, height: 6, rx: 3, fill: pal.ink });
  // 地球
  const gl = k.g({});
  el('circle', { cx: 0, cy: 0, r: 15, fill: pal.blue }, gl);
  el('path', { d: 'M -8 -8 Q 0 -13 6 -6 Q 2 0 8 4 Q 0 12 -6 6 Q -10 0 -8 -8 Z', fill: pal.green }, gl);
  el('ellipse', { cx: 0, cy: 0, rx: 15, ry: 6, fill: 'none', stroke: '#fff', 'stroke-width': 1.2, opacity: 0.6 }, gl);
  const res = [0, 1, 2].map((i) => {
    const r = k.g({});
    el('rect', { x: 240, y: 120 + i * 20, width: 80 - i * 10, height: 7, rx: 3.5, fill: i === 0 ? pal.blue : '#C9D3DF' }, r);
    el('rect', { x: 240, y: 130 + i * 20, width: 112, height: 5, rx: 2.5, fill: '#E3E9F1' }, r);
    return r;
  });
  const ck = el('path', { d: 'M 342 126 L 348 132 L 358 120', stroke: pal.green, 'stroke-width': 3.4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': 1 });
  desk(k, 196, 200, 198);
  el('rect', { x: 226, y: 190, width: 80, height: 8, rx: 3, fill: '#DDE3EA' });
  return {
    update(t) {
      const typing = t > 0.8 && t < 2.0;
      const ph = t * 14;
      k.set(qt, { width: 74 * easeOut(seg(t, 0.8, 2.0)) });
      k.tf(gl, 300, 146, 0, 1.7, 1.7); gl.setAttribute('opacity', seg(t, 2.1, 2.3) < 1 ? 1 : 0);
      res.forEach((r, i) => { const p = easeOut(seg(t, 2.2 + i * 0.25, 2.6 + i * 0.25)); r.setAttribute('opacity', p); k.tf(r, 0, (1 - p) * 8); });
      ck.setAttribute('stroke-dashoffset', 1 - seg(t, 3.0, 3.4));
      pz(b, S, { x: 175, facing: 1, lean: 5 + typing, look: 1, blink: blinkAt(t), mood: t > 3 ? 'grin' : 'smile' },
        [236, 192 - (typing ? 4 * Math.abs(Math.sin(ph)) : 0)], null);
    }
  };
}
