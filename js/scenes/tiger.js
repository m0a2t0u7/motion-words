// tiger：トラが歩いてきて止まる。まめが指さすと、虫めがねの拡大で黒いしま模様がくっきり見える（例文 The tiger has black stripes.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { scene, treeG } from './nature.js';
import { beast } from './animal.js';
import { lens } from './body.js';
import { reach } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, 'トラが来る'], [1.6, 'よく見ると'], [2.8, '黒いしま']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const { FY } = scene(k, { FY: 236, top: '#D7EEDB', bot: '#F2FAF3', ground: '#C9E0A6', edge: '#B4D18A' });
  tf(treeG(k, 1.0, '#6FBF7F', '#5DB36F').g, 340, FY - 4); tf(treeG(k, 0.7, '#6FBF7F', '#5DB36F').g, 40, FY - 10);
  for (let i = 0; i < 6; i++) el('path', { d: `M ${i * 70 + 10} ${FY} q 10 -40 0 -60`, stroke: '#7FB46A', 'stroke-width': 4, fill: 'none' });
  const T = beast(k, 'tiger');
  const me = k.buddy({ x: 70, y: 286, scale: 0.8 });
  const L = lens(k, 40);
  const zoom = g({}, L.inner);
  el('rect', { x: -60, y: -60, width: 120, height: 120, fill: '#F49A3C' }, zoom);
  for (let i = -2; i <= 2; i++) el('path', { d: `M ${i * 22 - 6} -50 q 14 30 0 60 q 6 10 2 40`, stroke: '#2E2A2A', 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round' }, zoom);
  el('path', { d: 'M -60 30 Q 0 46 60 30 V 60 H -60 Z', fill: '#fff', opacity: 0.8 }, zoom);
  const xf = (t) => lerp(460, 230, easeOut(seg(t, 0, 1.6)));
  return {
    update(t) {
      const x = xf(t), mv = seg(t, 0, 1.6) < 1 ? 1 : 0;
      T.set({ x, y: FY + 6, s: 1.3, face: -1, ph: (460 - x) * 0.1, m: mv * (1 - seg(t, 1.3, 1.6)), tail: Math.sin(t * 3) * 12, head: t > 1.8 ? -4 : 0 });
      const pt = easeOut(seg(t, 1.6, 2.1));
      P(me, { x: 70, y: 286, look: 0.8, mood: t > 2.8 ? 'grin' : 'open', blink: blinkAt(t) });
      me.pose({ armR: lerp(8, reach(me, 0.8, 'R', x - 10, FY - 40), pt) });
      L.show(seg(t, 2.3, 2.8), 120, 90, x - 10, FY - 40);
      tf(zoom, 0, Math.sin(t * 1.4) * 2);
    }
  };
}
