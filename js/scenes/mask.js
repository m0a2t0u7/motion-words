// mask：病室の入口でマスクを着けてから、入院中の友だちのベッドへ行って手を振る（例文 Please wear a mask when you visit your friend in the hospital.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, reach, hp, gait, mask, lying, bed, cross } from './hospital.js';

export const meta = { duration: 4.4, beats: [[0, '病室の前'], [0.9, 'マスクを着ける'], [2.4, '友だちに会う']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 246, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#EEF6F5' });
  el('rect', { x: 0, y: FY - 50, width: 400, height: 50, fill: '#E2EFEE' });
  // 病室の入口（左）
  el('rect', { x: 0, y: 70, width: 88, height: FY - 70, fill: '#D9E1EA' });
  el('rect', { x: 84, y: 64, width: 10, height: FY - 64, fill: '#B8C3D2' });
  el('rect', { x: 12, y: 40, width: 54, height: 20, rx: 4, fill: '#fff', stroke: '#B8C3D2', 'stroke-width': 2 });
  cross(k, 39, 50, 7, pal.mintDark);
  // 窓・点滴スタンド
  el('rect', { x: 200, y: 40, width: 80, height: 60, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 368, y1: 70, x2: 368, y2: FY, stroke: '#9AA6B6', 'stroke-width': 3 });
  el('line', { x1: 356, y1: 70, x2: 380, y2: 70, stroke: '#9AA6B6', 'stroke-width': 3 });
  el('rect', { x: 360, y: 72, width: 14, height: 22, rx: 4, fill: '#DDF1FB', stroke: '#9FD3EC', 'stroke-width': 1.5 });
  el('path', { d: 'M 367 94 Q 360 140 330 160', fill: 'none', stroke: '#C9D3E0', 'stroke-width': 1.5 });
  // ベッドの友だち
  const X0 = 180, B = bed(k, X0, FY, 170, '#BFE3F5');
  const fr = lying(k, { color: pal.coral, dark: pal.coralDark });
  const gx = X0 + 60, gy = B.MT - 15;
  tf(fr.grp, gx, gy, 90, 0.62);
  B.front(X0 + 6, gx + 26, gy - 16);
  const me = k.buddy({ x: 44, y: FY, scale: 0.92 });
  const mk = mask(k, me);
  // 手に持つマスク
  const hm = g({});
  el('path', { d: 'M -10 -6 Q 0 -8 10 -6 L 10 6 Q 0 9 -10 6 Z', fill: '#fff', stroke: '#C9D3E0', 'stroke-width': 1.5 }, hm);
  el('path', { d: 'M -10 -2 Q -16 0 -10 3 M 10 -2 Q 16 0 10 3', fill: 'none', stroke: '#C9D3E0', 'stroke-width': 1.4 }, hm);
  const xf = (t) => lerp(44, 158, easeInOut(seg(t, 2.1, 3.3)));
  return {
    update(t) {
      const p = gait(xf, t, 44);
      const up = easeInOut(seg(t, 0.6, 1.3)), on = t > 1.3, down = easeInOut(seg(t, 1.4, 1.8));
      const wave = t > 3.3 ? 140 + 22 * Math.sin((t - 3.3) * 10) : 0;
      P(me, { x: p.x, walk: p.walk, lean: p.lean, look: 0.6, mood: 'smile', armL: p.armL,
        armR: t > 3.3 ? lerp(8, wave, seg(t, 3.3, 3.5)) : t < 1.4 ? lerp(40, 160, up) : lerp(160, p.armR, down) });
      const h = hp(me, 0.92, 'R', 26);
      tf(hm, h.x, h.y - 4, 0, 0.9);
      hm.setAttribute('opacity', on ? 0 : 1);
      mk.setAttribute('opacity', on ? 1 : 0);
      // 友だち：気づいて笑う
      const see = seg(t, 3.0, 3.4);
      P(fr.b, { mood: see > 0.5 ? 'grin' : 'smile', blink: see > 0 ? 0 : 0.8 * (t % 2 > 1.85 ? 1 : 0) + (t < 2.6 ? 0.6 : 0), look: 0 });
    }
  };
}
