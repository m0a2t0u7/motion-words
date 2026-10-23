// damp：寒い地下室に入り、壁にさわるとしっとりぬれている。天井のパイプからしずくが落ち、まめは寒くて身をすくめる（例文 The basement is cold and damp.）
import { seg, lerp, easeInOut, easeOut } from '../ease.js';
import { P, blinkAt } from './run-after.js';

export const meta = { duration: 3.8, beats: [[0, '地下室へ'], [1.3, '壁にさわる'], [2.5, '寒くてしめっぽい']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = 240;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#4C6A8A', opacity: 0.42 });
  // 石の壁
  for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) el('rect', { x: c * 70 - (r % 2) * 35 + 2, y: 20 + r * 44, width: 66, height: 40, rx: 4, fill: '#9AA9B8', opacity: 0.55, stroke: '#7E8EA0', 'stroke-width': 1.5 });
  el('rect', { x: 150, y: 30, width: 220, height: 8, rx: 4, fill: pal.sub });
  const patch = el('ellipse', { cx: 245, cy: 160, rx: 4, ry: 3, fill: '#4A6788', opacity: 0 });
  const puddle = el('ellipse', { cx: 330, cy: FY + 10, rx: 4, ry: 2, fill: pal.water, opacity: 0.9 });
  const rip = el('ellipse', { cx: 330, cy: FY + 10, rx: 4, ry: 2, fill: 'none', stroke: '#fff', 'stroke-width': 1.5 });
  const drops = [0, 1].map(() => el('path', { d: 'M 0 -6 Q 4 0 0 4 Q -4 0 0 -6 Z', fill: pal.water }));
  const wd = [0, 1, 2, 3].map(() => el('path', { d: 'M 0 -5 Q 3 0 0 3 Q -3 0 0 -5 Z', fill: pal.water, opacity: 0 }));
  const b = k.buddy({ x: 190, y: FY + 8, scale: 1 });
  const cold = [0, 1].map(() => el('path', { d: 'M 0 0 q 4 -3 0 -6 q -4 -3 0 -6', stroke: '#fff', 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round', opacity: 0 }));
  return {
    update(t) {
      const wk = easeOut(seg(t, 0, 0.9)), touch = easeInOut(seg(t, 1.0, 1.5)), chill = easeInOut(seg(t, 2.0, 2.6));
      const sh = chill * Math.sin(t * 34) * 1.2;
      P(b, { x: lerp(110, 190, wk) + sh, walk: wk < 1 ? t * 9 : 0, armR: lerp(8, 98, touch) * (1 - chill) + 60 * chill, armL: 8 + chill * 55, lean: 5 * chill, squash: 1 - 0.05 * chill, look: 0.8, mood: chill > 0.3 ? 'sad' : 'flat', blink: blinkAt(t) });
            const w = easeOut(seg(t, 1.4, 3.0));
      tf(patch, 250, 175); patch.setAttribute('rx', 4 + 52 * w); patch.setAttribute('ry', 3 + 42 * w); patch.setAttribute('opacity', 0.55 * seg(t, 1.3, 1.6));
      wd.forEach((d, i) => { const u = (t * 0.6 + i * 0.27) % 1; tf(d, 215 + i * 26, 140 + (i % 2) * 20 + u * 24); d.setAttribute('opacity', w * (1 - u) * 0.8); });
      drops.forEach((d, i) => { const u = (t * 0.75 + i * 0.5) % 1; tf(d, 330, 40 + easeIn2(u) * (FY + 6 - 40)); d.setAttribute('opacity', u < 0.97 ? 1 : 0); });
      const pu = (t * 0.75) % 1;
      puddle.setAttribute('rx', 14 + 26 * seg(t, 0, 3.8)); rip.setAttribute('rx', 4 + 22 * pu); rip.setAttribute('ry', 2 + 5 * pu); rip.setAttribute('opacity', 1 - pu);
      cold.forEach((c, i) => { const u = (t * 0.8 + i / 2) % 1; tf(c, b.state.x - 30 + i * 60, 150 - u * 14); c.setAttribute('opacity', chill * (1 - u)); });
    }
  };
}
const easeIn2 = (p) => p * p;
