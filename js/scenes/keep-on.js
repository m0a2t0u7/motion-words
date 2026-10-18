// keep on：雨の中、水たまりも気にせず、止まらずに歩き続ける（例文 He kept on walking in the rain.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { streetBg } from './weigh.js';
import { rain } from './work-on.js';

export const meta = { duration: 4.4, beats: [[0, '雨の中'], [1.8, '歩き続ける'], [3.6, 'まだ歩く']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 236);
  el('rect', { x: 0, y: 0, width: 400, height: 236, fill: '#5A6480', opacity: 0.25 });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#D5DBE3' });
  [[-20, 40, 26], [10, 30, 30], [210, 34, 30], [250, 44, 24], [380, 30, 26]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#8C96A8' }));
  const pud = [[150, 32], [300, 26]];
  pud.forEach(([x, w]) => el('ellipse', { cx: x, cy: FY + 6, rx: w, ry: 5, fill: '#9FC3E6' }));
  const S = 0.95;
  const b = k.buddy({ x: 40, y: FY + 6, scale: S });
  const splash = [0, 1, 2, 3, 4, 5].map(() => el('circle', { r: 2.6, fill: '#9FC3E6' }));
  const rings = pud.map(([x]) => el('ellipse', { cx: x, cy: FY + 6, rx: 0, ry: 0, fill: 'none', stroke: '#fff', 'stroke-width': 1.5 }));
  const drip = el('path', { d: 'M 0 -4 Q 3 0 0 3 Q -3 0 0 -4 Z', fill: pal.water });
  const drops = rain(k, 34, 300);
  return {
    update(t) {
      drops(t, 1);
      const x = lerp(20, 380, t / 4.4);
      const w = (x - 20) * 0.107;
      b.pose({ x, walk: w, armL: 8 + 16 * Math.sin(w), armR: 8 - 16 * Math.sin(w), lean: 6, look: 0.4, mood: 'flat', squash: 0.98 });
      // 水たまりを通るとしぶき
      pud.forEach(([px], j) => {
        const u = (t - (px - 20) / 360 * 4.4);
        for (let i = 0; i < 3; i++) {
          const s = splash[j * 3 + i], q = seg(u, 0, 0.4);
          tf(s, px + (i - 1) * 10 * q * 2, FY + 4 - 20 * hump(q) * (1 - i * 0.2));
          s.setAttribute('opacity', q > 0 && q < 1 ? 1 : 0);
        }
        const r = seg(u, 0, 0.6);
        k.set(rings[j], { rx: 30 * r, ry: 5 * r, opacity: 1 - r });
      });
      const dq = (t * 1.6) % 1;
      tf(drip, x + 22, FY - 70 + 30 * dq); drip.setAttribute('opacity', hump(dq));
    }
  };
}
