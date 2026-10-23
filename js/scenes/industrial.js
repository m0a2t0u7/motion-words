// industrial：まめが、工場がたくさん並ぶ工業地域を歩く（例文 This is an industrial area with many factories.）
import { seg, lerp, hump } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';

export const meta = { duration: 4.0, beats: [[0, '工業地域へ'], [1.2, '工場が並ぶ'], [3.0, '煙が上がる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'outdoor' });
  const smoke = [];
  [30, 150, 270].forEach((x, i) => {
    const h = 70 + (i % 2) * 18;
    el('rect', { x, y: FY - 6 - h, width: 110, height: h, fill: ['#B8C7D9', '#CFC3B2', '#BDD3C6'][i], stroke: pal.line, 'stroke-width': 2 });
    el('path', { d: `M ${x} ${FY - 6 - h} l 28 -22 v 22 l 27 -22 v 22 l 27 -22 v 22 l 28 -22 v 22`, fill: ['#A5B6CB', '#BFB29F', '#A9C4B5'][i], stroke: pal.line, 'stroke-width': 2, 'stroke-linejoin': 'round' });
    el('rect', { x: x + 82, y: FY - 6 - h - 46, width: 16, height: 46 + 4, fill: pal.sub });
    el('rect', { x: x + 78, y: FY - 6 - h - 52, width: 24, height: 8, fill: pal.coralDark });
    for (let c = 0; c < 3; c++) el('rect', { x: x + 10 + c * 22, y: FY - 6 - h + 22, width: 15, height: 12, rx: 2, fill: '#fff' });
    el('rect', { x: x + 40, y: FY - 6 - 28, width: 30, height: 28, fill: pal.sub, opacity: 0.5 });
    for (let j = 0; j < 3; j++) smoke.push({ c: el('circle', { r: 9, fill: '#fff', opacity: 0.8 }), x: x + 90, y: FY - 6 - h - 54, j });
  });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  const b = k.buddy({ x: -30, y: FY + 12, scale: 0.8 });
  const xf = (t) => lerp(-30, 430, seg(t, 0.1, 3.9));
  return {
    update(t) {
      const w = walkTo(xf, t, -30);
      P(b, { x: w.x, walk: w.walk, armL: w.armL, armR: w.armR, lean: w.lean, facing: 1, look: 0.5, mood: 'smile', blink: blinkAt(t) });
      smoke.forEach((s) => {
        const u = ((t * 0.35 + s.j / 3) % 1);
        k.set(s.c, { cx: s.x + u * 14 + Math.sin(u * 6) * 3, cy: s.y - u * 40, r: 5 + u * 10, opacity: (1 - u) * 0.8 * seg(t, 0.2, 0.8) });
      });
    }
  };
}
