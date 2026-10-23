// island：まめと友だちがボートをこいで海をわたり、ヤシの木のある島に着く（例文 We took a boat to the island.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { sunG, cloudG, water } from './nature.js';
import { palm } from './climate.js';
import { hp } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, 'ボートに乗る'], [1.0, '島へ向かう'], [3.4, '島に着いた']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.62;
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: k.gradient([[0, '#A9DCF8'], [1, '#EAF7FD']]) });
  tf(sunG(k, 16).g, 70, 44); tf(cloudG(k, 70, 26), 210, 40);
  const SY = 170;
  el('rect', { x: 0, y: SY, width: 400, height: 130, fill: k.gradient([[0, '#6CC0EC'], [1, '#3D9BD6']]) });
  const wv = water(k, SY + 6, { col: 'none', dark: '#fff', dx: 14 });
  // 島（右）
  el('path', { d: `M 270 ${SY + 34} Q 290 ${SY - 26} 360 ${SY - 22} Q 410 ${SY - 18} 420 ${SY + 34} Z`, fill: '#F3DDA8' });
  el('path', { d: `M 300 ${SY - 6} Q 340 ${SY - 34} 400 ${SY - 20} L 400 ${SY} Q 350 ${SY - 10} 300 ${SY} Z`, fill: '#8CCB8F' });
  tf(palm(k, undefined, 0.9).g, 348, SY - 14);
  el('path', { d: `M 262 ${SY + 34} q 20 -6 40 0 q 30 6 120 0`, stroke: '#fff', 'stroke-width': 3, fill: 'none', opacity: 0.7 });
  // ボート
  const bt = g({});
  const a = k.buddy({ x: 0, y: 0, scale: S, parent: bt });
  const b = k.buddy({ x: 0, y: 0, scale: S, color: pal.coral, dark: pal.coralDark, parent: bt });
  const oar = el('line', { stroke: '#A8794A', 'stroke-width': 4, 'stroke-linecap': 'round' }, bt);
  const blade = el('ellipse', { rx: 7, ry: 3, fill: '#A8794A' }, bt);
  el('path', { d: 'M -64 -14 L 64 -14 Q 58 8 40 12 L -44 12 Q -60 6 -64 -14 Z', fill: '#F2685B' }, bt);
  el('path', { d: 'M -64 -14 L 64 -14 L 62 -8 L -62 -8 Z', fill: '#fff' }, bt);
  const spl = [0, 1, 2].map(() => el('circle', { r: 2.4, fill: '#fff' }));
  const xf = (t) => lerp(70, 250, easeInOut(seg(t, 0.4, 3.3)));
  return {
    update(t) {
      wv(t);
      const x = xf(t), arr = seg(t, 3.3, 4.0), bump = wobble(arr, 2, 5) * 3;
      const bob = Math.sin(t * 3) * 2 * (1 - arr), y = SY + 30 + bob;
      tf(bt, x + bump, y, Math.sin(t * 2.4) * 2 * (1 - arr));
      const row = seg(t, 0.4, 3.3) > 0 && t < 3.3, ph = t * 6.5;
      const ra = row ? 60 + 40 * Math.sin(ph) : 30;
      P(a, { x: 16, y: -12, armR: ra, armL: ra, lean: row ? 8 * Math.sin(ph) : 0, mood: t > 3.4 ? 'grin' : 'smile', blink: blinkAt(t), look: 0.7 });
      P(b, { x: -34, y: -12, armR: t > 3.5 ? 150 + Math.sin(t * 10) * 20 : 20, mood: t > 3.4 ? 'grin' : 'smile', blink: blinkAt(t, 1), look: 0.8 });
      // オール：まめの手から斜め後ろの水へ
      const st = a.state, hx = st.x + (27 + Math.sin(ra * Math.PI / 180) * 26) * S, hy = st.y + (-56 + Math.cos(ra * Math.PI / 180) * 26) * S;
      const tx = hx - 40 - 14 * Math.sin(ph) * (row ? 1 : 0), ty = 16;
      k.set(oar, { x1: hx, y1: hy, x2: tx, y2: ty }); k.tf(blade, tx, ty, Math.atan2(ty - hy, tx - hx) * 57.3);
      spl.forEach((n, i) => { const q = (ph / (Math.PI * 2) + i * 0.3) % 1; k.set(n, { cx: x + tx - 4 - i * 4, cy: y + 14 - 10 * hump(q), opacity: row ? 0.8 * (1 - q) : 0 }); });
    }
  };
}
