// a storm in a teacup：ティーカップの中だけで嵐が荒れ狂うが、まめは落ち着いて眺めている。実際は小さなこと（The argument was a storm in a teacup.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, 'カップの中'], [1.4, '嵐で大騒ぎ'], [3.2, '実は小さな']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 232, mood: 'indoor' });
  el('rect', { x: 0, y: 200, width: 400, height: 8, fill: pal.wood });
  el('rect', { x: 0, y: 206, width: 400, height: 3, fill: pal.woodDark });
  // 受け皿とカップ
  el('ellipse', { cx: 170, cy: 202, rx: 96, ry: 12, fill: '#fff', stroke: '#DDE3EA', 'stroke-width': 2 });
  k.shadow(170, 212, 96, 6);
  el('path', { d: 'M 238 150 q 36 -6 34 22 q -2 24 -40 24', fill: 'none', stroke: '#fff', 'stroke-width': 12, 'stroke-linecap': 'round' });
  el('path', { d: 'M 238 150 q 36 -6 34 22 q -2 24 -40 24', fill: 'none', stroke: '#DDE3EA', 'stroke-width': 3, 'stroke-linecap': 'round' });
  el('path', { d: 'M 100 152 L 240 152 Q 236 200 170 202 Q 104 200 100 152 Z', fill: '#fff', stroke: '#DDE3EA', 'stroke-width': 2.5 });
  el('path', { d: 'M 112 168 Q 120 188 140 194', fill: 'none', stroke: pal.blue, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.45 });
  // 中身（紅茶と嵐）
  el('ellipse', { cx: 170, cy: 152, rx: 70, ry: 15, fill: '#fff', stroke: '#DDE3EA', 'stroke-width': 2.5 });
  const tea = el('ellipse', { cx: 170, cy: 153, rx: 62, ry: 11, fill: pal.coffee });
  const ripple = [0, 1, 2].map(() => el('ellipse', { cx: 170, cy: 153, fill: 'none', stroke: '#B88560', 'stroke-width': 2 }));
  const splash = [0, 1, 2, 3, 4].map(() => el('circle', { r: 3.5, fill: pal.coffee }));
  const storm = g({});
  [[-26, 4, 17], [-4, -6, 22], [20, 2, 18]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#6F7A8E' }, storm));
  el('rect', { x: -40, y: 4, width: 76, height: 14, rx: 7, fill: '#6F7A8E' }, storm);
  const bolt = el('path', { d: 'M 4 14 L -6 32 L 2 32 L -4 48 L 14 26 L 6 26 L 12 14 Z', fill: pal.yellow }, storm);
  const rain = [...Array(6)].map(() => el('line', { stroke: pal.blue, 'stroke-width': 2, 'stroke-linecap': 'round' }));
  const wind = [0, 1].map(() => el('path', { d: 'M 0 0 q 14 -8 28 0 q 8 4 12 -3', fill: 'none', stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round' }));
  const b = k.buddy({ x: 320, y: FY, scale: 0.8, facing: -1, color: pal.coral, dark: pal.coralDark });
  return {
    update(t) {
      const on = smooth(seg(t, 0.6, 1.3)) * (1 - smooth(seg(t, 3.0, 3.8)));
      const sw = Math.sin(t * 15) * 3;
      tf(storm, 170 + sw * on, 118 - 4 * on, 0, 0.4 + 0.6 * on, 0.4 + 0.6 * on);
      storm.setAttribute('opacity', on);
      k.set(bolt, { opacity: Math.sin(t * 17) > 0.2 ? 1 : 0 });
      ripple.forEach((r, i) => {
        const p = (t * 1.4 + i / 3) % 1;
        k.set(r, { rx: 8 + 54 * p, ry: 2 + 9 * p, opacity: on * (1 - p) });
      });
      splash.forEach((s, i) => {
        const p = (t * 1.6 + i * 0.21) % 1;
        const x = 170 + (i - 2) * 22 + Math.sin(t * 6 + i) * 6;
        k.set(s, { cx: x, cy: 150 - 34 * 4 * p * (1 - p) * on, opacity: on });
      });
      rain.forEach((r, i) => {
        const p = (t * 2.2 + i * 0.17) % 1;
        const x = 140 + i * 12;
        k.set(r, { x1: x, y1: 138 + p * 8 - 14 * (1 - p), x2: x - 2, y2: 144 + p * 8, opacity: on });
      });
      wind.forEach((w, i) => {
        const p = (t * 1.2 + i * 0.5) % 1;
        tf(w, 110 + p * 70, 110 + i * 16, 0, 0.7, 0.7);
        w.setAttribute('opacity', on * hump(p));
      });
      tf(tea, 0, 0, 0, 1, 1);
      const calm = easeOut(seg(t, 3.2, 3.8));
      b.pose({
        look: 0.7, armL: 8, armR: lerp(8, 70, calm), lean: 0,
        mood: 'flat', blink: 0.4 * hump(seg(t, 1.4, 2.2)), squash: 1 - 0.02 * calm
      });
    }
  };
}
