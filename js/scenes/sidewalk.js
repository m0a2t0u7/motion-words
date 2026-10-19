// sidewalk：車道わきの歩道に子どもたちがしゃがみ、チョークで太陽と花の絵を描いていく（例文 Kids were drawing on the sidewalk.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { road, auto, P, blinkAt, held, reach } from './vehicle.js';

export const meta = { duration: 4.4, beats: [[0, '歩道で'], [1.0, 'チョークで描く'], [3.4, '絵ができた']] };

export function create(k) {
  const { el, pal } = k;
  const FY = 150;
  k.backdrop({ floorY: FY });
  [[0, 70], [90, 100], [200, 80], [300, 110]].forEach(([x, h]) => el('rect', { x, y: FY - h, width: 84, height: h, rx: 4, fill: '#F3E6DC' }));
  // 広い歩道（タイル）と、手前の車道
  el('rect', { x: 0, y: FY, width: 400, height: 100, fill: '#E6EAF0' });
  for (let x = 0; x < 400; x += 40) el('line', { x1: x, y1: FY, x2: x - 10, y2: FY + 100, stroke: '#D3DAE3', 'stroke-width': 1.5 });
  el('rect', { x: 0, y: FY + 100, width: 400, height: 6, fill: '#C9D1DC' });
  el('rect', { x: 0, y: FY + 106, width: 400, height: 50, fill: '#B9C2CF' });
  const car = auto(k, { color: pal.blue, dark: pal.blueDark });
  // チョークの絵（少しずつ線が伸びる）
  const sun = el('path', { d: 'M 120 214 m -18 0 a 18 9 0 1 0 36 0 a 18 9 0 1 0 -36 0 M 92 214 h -12 M 148 214 h 12 M 120 202 v -8 M 100 205 l -8 -5 M 140 205 l 8 -5', stroke: pal.yellowDark, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': 1 });
  const flw = el('path', { d: 'M 280 226 v -18 M 280 208 m -8 0 a 8 5 0 1 0 16 0 a 8 5 0 1 0 -16 0 M 280 220 q 10 -6 14 0', stroke: pal.coralDark, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': 1 });
  const kids = [[78, 1, pal.mint, pal.mintDark, 120, 212], [330, -1, pal.coral, pal.coralDark, 282, 214]].map(([x, f, c, d, tx, ty]) => {
    const b = k.buddy({ x, y: 200, scale: 0.72, facing: f, color: c, dark: d });
    const ch = k.el('rect', { x: -3, y: -2, width: 6, height: 14, rx: 2, fill: f > 0 ? pal.yellow : '#FFB3A6' });
    return { b, ch, tx, ty, x };
  });
  return {
    update(t) {
      car.set(lerp(-120, 520, t / 4.4), 292, t * 300, 0, 0, 0.9);
      const p = easeInOut(seg(t, 0.8, 3.4));
      k.set(sun, { 'stroke-dashoffset': 1 - p }); k.set(flw, { 'stroke-dashoffset': 1 - easeInOut(seg(t, 1.0, 3.3)) });
      kids.forEach(({ b, ch, tx, ty }, i) => {
        const w = Math.sin(t * 11 + i) * 10 * (t > 0.8 && t < 3.4 ? 1 : 0);
        P(b, { squash: 0.86, lean: 22, look: 0.9, mood: t > 3.4 ? 'grin' : 'smile', blink: blinkAt(t, i) });
        b.pose({ armR: reach(b, 0.72, 'R', tx + w, ty - 4) });
        held(k, b, 0.72, ch, 'R');
        if (t > 3.5) b.pose({ armL: 8 + 120 * hump(seg(t, 3.5, 4.4)) });
      });
    }
  };
}
