// snake：日なたの平たい岩の上で、ヘビが長い体をのばしてじっと日光浴している。まめは少しはなれて見ている（例文 A snake was lying in the sun.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { scene, sunG, cloudG } from './nature.js';

export const meta = { duration: 4.2, beats: [[0, '日なた'], [1.2, 'ヘビがねそべる'], [2.8, 'ぽかぽか']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const { FY } = scene(k, { FY: 236, top: '#FFE6BC', bot: '#FFF7E8', ground: '#D9D59A', edge: '#C9C482' });
  const sun = sunG(k, 26); tf(sun.g, 320, 54); tf(cloudG(k, 60, 22), 80, 50);
  const beam = el('path', { d: 'M 300 80 L 160 206 L 340 206 Z', fill: '#FFE27A', opacity: 0.25 });
  // 岩
  k.shadow(250, FY + 4, 120, 7);
  el('path', { d: `M 130 ${FY} Q 140 ${FY - 30} 200 ${FY - 34} L 310 ${FY - 36} Q 370 ${FY - 30} 380 ${FY} Z`, fill: '#B9A58A' });
  el('path', { d: `M 160 ${FY - 26} Q 260 ${FY - 40} 360 ${FY - 26}`, stroke: '#CDBBA2', 'stroke-width': 4, fill: 'none' });
  const body = el('path', { stroke: '#7DBB4E', 'stroke-width': 13, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const pat = el('path', { stroke: '#4E8F2E', 'stroke-width': 4, fill: 'none', 'stroke-dasharray': '4 9', 'stroke-linecap': 'round' });
  const hd = g({}); el('ellipse', { cx: 0, cy: 0, rx: 11, ry: 8, fill: '#7DBB4E' }, hd);
  const eye = el('path', { d: 'M 2 -3 q 2.5 2 5 0', stroke: pal.ink, 'stroke-width': 1.8, fill: 'none' }, hd);
  const tongue = el('path', { d: 'M 10 2 l 8 0 l 3 -2 M 18 2 l 3 2', stroke: '#E8574A', 'stroke-width': 1.6, fill: 'none' }, hd);
  const me = k.buddy({ x: 60, y: FY + 30, scale: 0.85 });
  return {
    update(t) {
      tf(sun.rays, 0, 0, t * 14); beam.setAttribute('opacity', 0.18 + 0.08 * Math.sin(t * 2));
      // ほとんど動かない：ゆっくり呼吸する程度
      const br = Math.sin(t * 1.6) * 1.2, Y = FY - 42;
      let d = '';
      for (let i = 0; i <= 28; i++) { const x = 190 + i * 5.2, y = Y + Math.sin(i * 0.5) * (6 + br); d += `${i ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)} `; }
      k.set(body, { d }); k.set(pat, { d });
      tf(hd, 344, Y + Math.sin(28 * 0.5) * (6 + br) - 2, -4);
      const fl = Math.sin(t * 9) > 0.5 && t > 1.0 ? 1 : 0; tongue.setAttribute('opacity', fl);
      const w = walkTo((tt) => lerp(20, 80, easeInOut(seg(tt, 0.1, 1.0))), t, 20);
      P(me, { x: w.x, y: FY + 30, walk: w.walk, armL: w.armL, armR: t > 2.6 ? 150 : w.armR, lean: w.lean, look: 0.8, mood: t > 2.6 ? 'smile' : 'open', blink: blinkAt(t) });
      if (t > 2.6) me.pose({ armR: 160, lean: -2 });
    }
  };
}
