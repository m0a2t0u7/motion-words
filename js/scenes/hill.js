// hill：丘のてっぺんに家がある。まめが坂道を登って家の前に着き、ふり返って手をふる（例文 Our house is at the top of the hill.）
import { seg, lerp, easeInOut, easeOut, clamp } from '../ease.js';
import { scene, sunG, cloudG, treeG, P, blinkAt, gait } from './nature.js';

export const meta = { duration: 4.2, beats: [[0, '丘のふもと'], [1.0, '坂を登る'], [3.0, 'てっぺんの家']] };

export function create(k) {
  const { el, tf, pal } = k, S = 0.6;
  scene(k, { FY: 300, top: '#A9D6F5', bot: '#EEF8FD' });
  const sun = sunG(k, 16); tf(sun.g, 350, 46);
  tf(cloudG(k, 70, 24), 90, 50);
  const top = 120, hx = 230;
  const hillY = (x) => top + (300 - top) * Math.pow((x - hx) / 230, 2);
  let d = 'M -10 300';
  for (let x = -10; x <= 410; x += 10) d += ` L ${x} ${Math.min(300, hillY(x)).toFixed(1)}`;
  el('path', { d: d + ' L 410 300 Z', fill: '#8CCB8F' });
  let p = 'M 20 300';
  for (let x = 20; x <= hx; x += 10) p += ` L ${x} ${(hillY(x) + 4).toFixed(1)}`;
  el('path', { d: p, stroke: '#EADBC2', 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round' });
  // てっぺんの家
  el('rect', { x: hx - 6, y: top - 52, width: 70, height: 54, fill: '#FFF6EA' });
  el('path', { d: `M ${hx - 14} ${top - 48} L ${hx + 29} ${top - 82} L ${hx + 72} ${top - 48} Z`, fill: pal.coral });
  el('rect', { x: hx + 36, y: top - 34, width: 18, height: 34, rx: 2, fill: pal.woodDark });
  el('rect', { x: hx + 6, y: top - 38, width: 20, height: 16, rx: 2, fill: '#CDEBFA' });
  tf(treeG(k, 0.6).g, hx + 100, hillY(hx + 100) + 2);
  const b = k.buddy({ x: 30, y: hillY(30), scale: S });
  const xf = (t) => lerp(30, hx - 22, easeInOut(seg(t, 0.2, 3.0)));
  return {
    update(t) {
      const w = gait(xf, t, 30, 14, 0.2);
      const wave = easeOut(seg(t, 3.1, 3.4));
      P(b, { x: w.x, y: hillY(w.x), walk: w.walk, lean: 14 * w.m, facing: wave > 0.5 ? -1 : 1, armL: w.armL, armR: lerp(w.armR, 150 + 15 * Math.sin(t * 12), wave), look: wave > 0.5 ? 0.3 : 0.5, mood: wave > 0.3 ? 'grin' : 'smile', blink: blinkAt(t) });
    }
  };
}
