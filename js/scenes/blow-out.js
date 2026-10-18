// blow out：ケーキのろうそくの火を、まめが息を吹きかけて消す（例文 She blew out the candles on the cake.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';

export const meta = { duration: 3.8, beats: [[0, 'ろうそくの火'], [1.4, '息を吹く'], [2.6, '火が消えた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'evening' });
  const n0 = k.root.childNodes.length;
  el('rect', { x: 180, y: 190, width: 220, height: 10, rx: 3, fill: pal.wood });
  el('rect', { x: 180, y: 200, width: 220, height: 40, fill: '#F1D9BE' });
  // ケーキ
  el('ellipse', { cx: 290, cy: 190, rx: 70, ry: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: 236, y: 146, width: 108, height: 42, rx: 6, fill: '#FBE2D2' });
  el('path', { d: 'M 236 156 Q 250 166 263 156 T 290 156 T 317 156 T 344 156 L 344 146 L 236 146 Z', fill: '#fff' });
  el('ellipse', { cx: 290, cy: 146, rx: 54, ry: 7, fill: '#fff' });
  [[-30, 0], [0, -3], [30, 0]].forEach(([dx], i) => el('circle', { cx: 290 + dx + 14, cy: 150, r: 4, fill: pal.red }));
  const cx = [258, 290, 322];
  cx.forEach((x, i) => el('rect', { x: x - 3, y: 118, width: 6, height: 28, rx: 2, fill: [pal.blue, pal.yellow, pal.violet][i] }));
  const CK = g({ transform: 'translate(0 26)' });
  Array.from(k.root.childNodes).slice(n0, -1).forEach((n) => CK.appendChild(n));
  const flames = cx.map((x) => { const n = g({}); el('path', { d: 'M 0 0 C -6 -4 -5 -12 0 -18 C 5 -12 6 -4 0 0 Z', fill: '#FFB020' }, n); el('path', { d: 'M 0 -2 C -3 -4 -2 -8 0 -11 C 2 -8 3 -4 0 -2 Z', fill: '#FFF0B0' }, n); return { n, x }; });
  const smokes = cx.map(() => el('path', { d: 'M 0 0 C 6 -8 -6 -14 0 -22 C 6 -30 -4 -34 2 -42', stroke: '#B7BEC9', 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' }));
  const puffs = [0, 1, 2].map(() => el('path', { d: 'M 0 0 Q 10 -4 20 0', stroke: '#9FD3F0', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }));
  const B = k.buddy({ x: 170, y: FY, scale: 1.1 });
  const outAt = [1.55, 1.75, 1.95];
  return {
    update(t) {
      const inh = easeOut(seg(t, 0.6, 1.2)) * (1 - seg(t, 1.3, 1.5));
      const blow = hump(seg(t, 1.3, 2.3));
      B.pose({ lean: 14 * easeInOut(seg(t, 0.8, 1.3)) * (1 - seg(t, 2.6, 3.2)), squash: 1 + 0.06 * inh - 0.04 * blow, mood: t > 1.3 && t < 2.3 ? 'open' : t > 2.6 ? 'grin' : 'smile', armL: t > 2.6 ? lerp(10, 150, easeOut(seg(t, 2.6, 3.0))) : 10, armR: t > 2.6 ? lerp(10, 150, easeOut(seg(t, 2.6, 3.0))) : 10, look: 0.7, lift: t > 2.6 ? 6 * hump(seg(t, 2.7, 3.1)) : 0 });
      flames.forEach((f, i) => {
        const bend = blow * (1 + i * 0.2);
        const off = t > outAt[i];
        tf(f.n, f.x, 144, 30 * bend + 4 * Math.sin(t * 13 + i), off ? 0 : 1 - 0.1 * Math.sin(t * 11 + i) - 0.4 * seg(t, outAt[i] - 0.2, outAt[i]), 1);
        const sm = seg(t, outAt[i], outAt[i] + 1.2);
        smokes[i].setAttribute('opacity', off ? 0.8 * (1 - sm) : 0);
        tf(smokes[i], f.x, 140 - sm * 16);
      });
      puffs.forEach((p, i) => { const u = (((t - 1.3) * 2.2 + i / 3) % 1); p.setAttribute('opacity', t > 1.3 && t < 2.2 ? 0.8 * (1 - u) : 0); tf(p, 200 + u * 90, 158 - i * 6 - u * 10); });
    }
  };
}
