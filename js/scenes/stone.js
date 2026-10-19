// stone：彼が河原の小石を拾い、振りかぶって川へ投げる。石はポチャンと沈み、波紋が広がる（例文 He threw a stone into the river.）
import { seg, lerp, easeInOut, easeOut, easeIn, clamp, hump } from '../ease.js';
import { scene, hills, hp, P, blinkAt } from './nature.js';

export const meta = { duration: 4.2, beats: [[0, '石を拾う'], [1.4, '投げる'], [2.4, 'ポチャン']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const { FY } = scene(k, { FY: 250, ground: '#D9D3C7', edge: '#C9C2B4' });
  hills(k, 200);
  // 川（奥）
  el('path', { d: 'M 0 196 Q 200 186 400 196 V 236 Q 200 228 0 236 Z', fill: '#7CC8EE' });
  const flow = el('path', { d: 'M 0 214 h 400', stroke: '#fff', 'stroke-width': 2, 'stroke-dasharray': '14 22', opacity: 0.7 });
  [[30, FY + 14], [70, FY + 30], [340, FY + 20], [380, FY + 34]].forEach(([x, y]) => el('ellipse', { cx: x, cy: y, rx: 8, ry: 5, fill: '#B8B0A2' }));
  const rip = [0, 1, 2].map(() => el('ellipse', { cx: 300, cy: 214, rx: 0, ry: 0, fill: 'none', stroke: '#fff', 'stroke-width': 2.5 }));
  const spl = [0, 1, 2, 3].map(() => el('circle', { r: 3, fill: '#BFE6FA' }));
  const b = k.buddy({ x: 110, y: FY, scale: S, color: pal.blue, dark: pal.blueDark });
  const st = el('ellipse', { rx: 6, ry: 4.5, fill: '#8C8579' });
  const T = 1.55, LAND = 2.25;
  return {
    update(t) {
      flow.setAttribute('stroke-dashoffset', (-t * 30).toFixed(1));
      const pick = hump(seg(t, 0.1, 0.9)), wind = easeInOut(seg(t, 0.9, 1.4)), thr = easeOut(seg(t, 1.4, 1.65));
      P(b, { lean: 24 * pick - 8 * wind + 16 * thr, squash: 1 - 0.08 * pick, armR: lerp(lerp(20, 10, pick), 175, wind) - 105 * thr, armL: 20 + 40 * wind, look: 0.6, mood: t > LAND ? 'grin' : 'smile', blink: blinkAt(t) });
      const h = hp(b, S, 'R', 28);
      if (t < 0.5) tf(st, 150, FY + 2);
      else if (t < T) tf(st, h.x, h.y);
      else if (t < LAND) { const p = seg(t, T, LAND); tf(st, lerp(h.x, 300, p), lerp(h.y, 212, easeIn(p)) - 70 * hump(p)); }
      else tf(st, 0, -50, 0, 0.001);
      rip.forEach((r, i) => { const p = seg(t, LAND + i * 0.25, LAND + 1.3 + i * 0.25); k.set(r, { rx: 6 + 40 * easeOut(p), ry: 2 + 8 * easeOut(p), opacity: p > 0 ? 1 - p : 0 }); });
      spl.forEach((s, i) => { const p = seg(t, LAND, LAND + 0.45); tf(s, 300 + (i - 1.5) * 8 * p * 2, 212 - 22 * hump(p) * (1 - Math.abs(i - 1.5) * 0.3), 0, p > 0 && p < 1 ? 1 : 0.001); });
    }
  };
}
