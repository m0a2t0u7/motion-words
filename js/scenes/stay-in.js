// stay in：外は雨。まめは出かけずに家の中でのんびり過ごす（例文 It's raining, so let's stay in today.）
import { seg, lerp, easeInOut, easeOut, wobble } from '../ease.js';

export const meta = { duration: 3.8, beats: [[0, '外は雨'], [1.2, '家にいると決める'], [2.4, 'のんびり']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 252, mood: 'outdoor' });
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#DCE6F0', opacity: 0.7 });
  // 家（断面）
  el('path', { d: 'M 40 100 L 200 28 L 360 100 Z', fill: pal.coral, stroke: pal.coral, 'stroke-width': 8, 'stroke-linejoin': 'round' });
  el('rect', { x: 56, y: 100, width: 288, height: 152, fill: '#FFF6EC' });
  el('rect', { x: 56, y: 226, width: 288, height: 26, fill: pal.wood });
  // 窓
  el('rect', { x: 76, y: 124, width: 70, height: 60, rx: 6, fill: '#CFE0EE', stroke: '#fff', 'stroke-width': 4 });
  // ドアと傘
  el('rect', { x: 290, y: 130, width: 40, height: 96, rx: 4, fill: pal.blue });
  el('circle', { cx: 321, cy: 180, r: 3.5, fill: pal.yellow });
  const um = g({});
  el('path', { d: 'M -18 0 A 18 18 0 0 1 18 0 Z', fill: pal.red }, um);
  el('line', { x1: 0, y1: 0, x2: 0, y2: 30, stroke: pal.ink, 'stroke-width': 3 }, um);
  tf(um, 270, 196, -10);
  // ソファとまめ
  el('rect', { x: 150, y: 190, width: 100, height: 36, rx: 12, fill: pal.violet });
  const b = k.buddy({ x: 198, y: 210, scale: 0.8 });
  el('rect', { x: 150, y: 206, width: 100, height: 22, rx: 8, fill: '#8C72E0' });
  const cup = g({});
  el('rect', { x: -7, y: -12, width: 14, height: 13, rx: 3, fill: '#fff', stroke: '#D5DBE5', 'stroke-width': 2 }, cup);
  const steam = [0, 1].map((i) => el('path', { d: `M ${-3 + i * 6} -16 q 4 -6 0 -12`, fill: 'none', stroke: pal.sub, 'stroke-width': 2, 'stroke-linecap': 'round' }, cup));
  // 雨
  const drops = [];
  for (let i = 0; i < 26; i++) drops.push(el('line', { stroke: pal.blue, 'stroke-width': 2, 'stroke-linecap': 'round', x1: 0, y1: 0, x2: -3, y2: 10, opacity: 0.8 }));
  // 窓の中も雨
  const rainClip = k.clip((c) => el('rect', { x: 80, y: 128, width: 62, height: 52 }, c));
  const wd = g({ 'clip-path': rainClip });
  const wdr = [0, 1, 2, 3, 4].map((i) => el('line', { x1: 0, y1: 0, x2: -2, y2: 7, stroke: pal.blue, 'stroke-width': 2, 'stroke-linecap': 'round' }, wd));
  return {
    update(t) {
      drops.forEach((d, i) => {
        const x = (i * 53) % 420 - 10, spd = 220 + (i % 5) * 30;
        const y = ((t * spd + i * 37) % 300);
        const inHouse = x > 50 && x < 350 && y > 60 && y < 252;
        tf(d, x, y);
        d.setAttribute('opacity', inHouse ? 0 : 0.8);
      });
      wdr.forEach((d, i) => tf(d, 88 + i * 12, ((t * 180 + i * 29) % 60) + 124));
      const sit = easeOut(seg(t, 1.1, 1.8));
      const decide = seg(t, 0.5, 1.2) * (1 - seg(t, 1.2, 1.4));
      b.pose({ armR: lerp(8, 70, seg(t, 0.4, 0.9)) * (1 - seg(t, 1.0, 1.5)) + 8, armL: lerp(8, 40, seg(t, 2.0, 2.5)), look: lerp(-0.6, 0.4, seg(t, 0.9, 1.5)), mood: t < 1.0 ? 'flat' : 'smile', lean: 0, squash: 1 + 0.015 * Math.sin(t * 2) });
      const h = b.handPos('L');
      tf(cup, lerp(h.x + 8, h.x + 8, 0), h.y + 6);
      const holding = seg(t, 1.8, 2.5);
      cup.setAttribute('opacity', holding);
      steam.forEach((s, i) => s.setAttribute('opacity', 0.5 + 0.5 * Math.sin(t * 4 + i * 2)));
      b.mouth.setAttribute('fill', b.mouth.getAttribute('fill'));
    }
  };
}
