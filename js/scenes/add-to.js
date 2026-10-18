// add to：タイヤがパンクして困っている2人に、雨まで降ってきて、さらに困る（例文 The rain added to our problems.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { streetBg } from './weigh.js';
import { car } from './work-around.js';
import { rain } from './work-on.js';

export const meta = { duration: 4.4, beats: [[0, 'パンクで困る'], [1.8, '雨が降り出す'], [3.6, 'さらに困った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 236);
  const sky = el('rect', { x: 0, y: 0, width: 400, height: 236, fill: '#5A6480', opacity: 0 });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#D5DBE3' });
  const puddles = [[90, 30], [300, 40], [200, 24]].map(([x, w]) => el('ellipse', { cx: x, cy: FY + 30, rx: 0, ry: 0, fill: '#9FC3E6', opacity: 0.8 }));
  const C = car(k, pal.yellow, []);
  tf(C.g, 220, FY + 6, 2.5, 1.15); C.wheel(0);
  // パンクしたタイヤ（前輪をつぶす）
  el('ellipse', { cx: 254, cy: FY + 1, rx: 13, ry: 6, fill: pal.ink });
  k.shadow(220, FY + 7, 60, 4);
  const cloud = g({});
  [[-30, 6, 22], [0, -4, 28], [30, 6, 22]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#8C96A8' }, cloud));
  const A = k.buddy({ x: 110, y: FY + 18, scale: 0.9, facing: 1 });
  const B = k.buddy({ x: 340, y: FY + 18, scale: 0.9, facing: -1, color: pal.coral, dark: pal.coralDark });
  const drops = rain(k, 34, 300);
  const sweat = [0, 1].map(() => el('path', { d: 'M 0 -6 Q 4 0 0 4 Q -4 0 0 -6 Z', fill: pal.water }));
  return {
    update(t) {
      const r = seg(t, 1.6, 2.4);
      sky.setAttribute('opacity', 0.28 * r);
      tf(cloud, lerp(200, 200, r), lerp(-40, 40, easeOut(r)));
      drops(t, r > 0.3 ? 1 : 0);
      puddles.forEach((p, i) => k.set(p, { rx: [30, 40, 24][i] * easeOut(seg(t, 2.2 + i * 0.3, 3.8)), ry: 4 * easeOut(seg(t, 2.2 + i * 0.3, 3.8)) }));
      const down = easeInOut(seg(t, 2.2, 3.2));
      const sigh = Math.sin(t * 2.4);
      A.pose({ armR: lerp(40 + 10 * sigh, 160, easeInOut(seg(t, 2.4, 2.9))) , armL: lerp(10, 150, easeInOut(seg(t, 2.5, 3.0))), lean: lerp(4, 12, down), look: r > 0.5 ? -0.3 : 0.7, mood: 'sad', squash: lerp(1, 0.9, down) + 0.02 * sigh });
      B.pose({ armR: lerp(30, 165, easeInOut(seg(t, 2.3, 2.8))), armL: lerp(20, 150, easeInOut(seg(t, 2.45, 2.95))), lean: lerp(6, 12, down), look: r > 0.5 ? -0.3 : 0.6, mood: t > 2.2 ? 'open' : 'sad', squash: lerp(1, 0.9, down) - 0.02 * sigh });
      sweat.forEach((s, i) => { const b = i ? B : A; const q = ((t * 0.8 + i * 0.5) % 1); tf(s, b.state.x + (i ? -30 : 30), FY - 80 + 20 * q); s.setAttribute('opacity', t < 2 ? hump(q) : 0); });
    }
  };
}
