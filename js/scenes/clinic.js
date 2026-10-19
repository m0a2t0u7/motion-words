// clinic：自分の家を出て、すぐ近くの小さな診療所まで歩き、ドアから入る（例文 I went to a clinic near my house.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, gait, cross } from './hospital.js';
import { door } from './queue-up.js';

export const meta = { duration: 4.4, beats: [[0, '家を出る'], [1.2, '近くの診療所へ'], [3.3, '診療所に入る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  el('rect', { x: 0, y: FY, width: 400, height: 10, fill: '#E3E8EE' });
  // 自分の家（左）
  el('rect', { x: 10, y: 110, width: 130, height: FY - 110, rx: 4, fill: '#F6DCC8' });
  el('path', { d: 'M 0 116 L 75 62 L 150 116 Z', fill: pal.coral, stroke: pal.coral, 'stroke-width': 8, 'stroke-linejoin': 'round' });
  el('rect', { x: 22, y: 136, width: 34, height: 30, rx: 4, fill: '#CFE9F7' });
  el('rect', { x: 70, y: FY - 70, width: 46, height: 70, fill: '#5A6480' });
  const hd = door(k, { x: 70, y: FY - 70, w: 46, h: 70, hinge: 'L', color: pal.blue });
  // 診療所（右、小さな平屋）
  el('rect', { x: 230, y: 116, width: 160, height: FY - 116, rx: 4, fill: '#DCE8F0' });
  el('rect', { x: 224, y: 108, width: 172, height: 12, rx: 3, fill: pal.mintDark });
  el('rect', { x: 250, y: 84, width: 104, height: 24, rx: 4, fill: '#fff', stroke: pal.mintDark, 'stroke-width': 2.5 });
  cross(k, 302, 96, 8, pal.mintDark);
  el('rect', { x: 340, y: 140, width: 38, height: 32, rx: 4, fill: '#CFE9F7' });
  el('rect', { x: 268, y: FY - 72, width: 50, height: 72, fill: '#6E7C96' });
  const inside = g({});
  const me = k.buddy({ x: 93, y: FY, scale: 0.78, parent: inside });
  const cd = door(k, { x: 268, y: FY - 72, w: 50, h: 72, hinge: 'R', color: '#BFE3F5' });
  // 道の点線（近い）
  const dots = [];
  for (let x = 124; x < 270; x += 14) dots.push(el('circle', { cx: x, cy: FY + 5, r: 2, fill: pal.sub, opacity: 0 }));
  const xf = (t) => lerp(93, 292, easeInOut(seg(t, 0.8, 3.3)));
  return {
    update(t) {
      hd.set(easeInOut(seg(t, 0.1, 0.6)) * (1 - easeInOut(seg(t, 1.4, 1.9))));
      cd.set(easeInOut(seg(t, 2.6, 3.0)) * (1 - easeInOut(seg(t, 3.7, 4.1))));
      const p = gait(xf, t, 93);
      P(me, { x: p.x, walk: p.walk, armL: p.armL, armR: p.armR, lean: p.lean, look: 0.6, mood: 'smile' });
      // 家のドアから出る（最初は少しだけ見える）→診療所の中へ消える
      const out = seg(t, 0.4, 0.9), inn = seg(t, 3.25, 3.6);
      me.g.setAttribute('opacity', (0.0 + out) * (1 - inn));
      dots.forEach((d, i) => d.setAttribute('opacity', 0.6 * seg(t, 0.9 + i * 0.12, 1.1 + i * 0.12)));
    }
  };
}
