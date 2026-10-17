// food for thought：友だちのアイデアが考える材料になり、まめが考え込む（例文 Your idea gave me food for thought.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, wobble } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, 'アイデアを聞く'], [1.4, '受け取る'], [2.8, 'じっくり考える']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const a = k.buddy({ x: 305, y: FY, scale: 1.05, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const b = k.buddy({ x: 110, y: FY, scale: 1.05 });
  const base = { armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'smile', blink: 0, lift: 0 };
  // 電球（アイデア）
  const bulb = g({});
  const glow = el('circle', { r: 26, fill: '#FFF3B8', opacity: 0 }, bulb);
  el('path', { d: 'M -9 12 Q -16 4 -14 -6 Q -12 -18 0 -18 Q 12 -18 14 -6 Q 16 4 9 12 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, bulb);
  el('rect', { x: -7, y: 12, width: 14, height: 7, rx: 2, fill: '#B9C3D2' }, bulb);
  // 小皿（食べ物のたとえ）
  const dish = g({});
  el('ellipse', { cx: 0, cy: 0, rx: 28, ry: 6, fill: '#FFFFFF', stroke: '#CBD3DE', 'stroke-width': 2.5 }, dish);
  el('ellipse', { cx: 0, cy: -1, rx: 17, ry: 3, fill: '#EEF2F7' }, dish);
  // 考え吹き出し
  const think = g({});
  el('circle', { cx: 36, cy: 34, r: 4, fill: '#FFFFFF', stroke: '#CBD3DE', 'stroke-width': 2 }, think);
  el('circle', { cx: 26, cy: 18, r: 6, fill: '#FFFFFF', stroke: '#CBD3DE', 'stroke-width': 2 }, think);
  el('ellipse', { cx: 0, cy: -14, rx: 54, ry: 34, fill: '#FFFFFF', stroke: '#CBD3DE', 'stroke-width': 2.5 }, think);
  const dots = [0, 1, 2].map((i) => el('circle', { cx: -26 + i * 10, cy: -14, r: 3.4, fill: pal.sub }, think));
  k.root.appendChild(dish);
  k.root.appendChild(bulb);
  const rays = g({});
  for (let i = 0; i < 8; i++) el('line', { x1: 0, y1: -30, x2: 0, y2: -40, stroke: pal.yellowDark, 'stroke-width': 3, 'stroke-linecap': 'round', transform: `rotate(${i * 45})` }, rays);

  return {
    update(t) {
      // 友だちが電球をそっと差し出す
      const offer = easeOut(seg(t, 0.2, 1.0));
      a.pose({ ...base, armR: lerp(8, 95, offer) - 10 * hump(seg(t, 1.0, 1.6)), armL: 8, look: 0.6, mood: 'smile', lean: 3 * offer });
      const hA = a.handPos('R');
      // 電球：友だちの手→まめの上の吹き出しへ
      const fly = easeInOut(seg(t, 1.3, 2.5));
      const bx = lerp(hA.x - 10, 118, fly), by = lerp(hA.y - 22, 68, fly) - 28 * hump(fly);
      tf(bulb, bx, by, lerp(-8, 0, fly), 1 + 0.35 * fly, 1 + 0.35 * fly);
      tf(dish, bx, by + (19 + 6 * fly) * (1 + 0.35 * fly), 0, 1 + 0.35 * fly, 1 + 0.35 * fly);
      glow.setAttribute('opacity', 0.9 * easeOut(seg(t, 2.4, 3.2)) * (0.8 + 0.2 * Math.sin(t * 6)));
      // まめ：受けとって、考え込む
      const hm = easeOut(seg(t, 1.6, 2.2));
      const think_ = seg(t, 2.4, 3.0);
      b.pose({ ...base, armR: lerp(8, 145, hm) , armL: 8, look: -0.4 * (1 - hm) + 0.2, mood: t < 1.5 ? 'open' : 'flat', lean: -3 * hm + 3 * Math.sin(t * 2) * think_, blink: think_ > 0 ? 0.3 : 0 });
      const tp = backOut(seg(t, 2.5, 3.0), 1.8);
      tf(think, 118, 82, 0, tp, tp);
      think.setAttribute('opacity', tp > 0 ? 1 : 0);
      dots.forEach((d, i) => d.setAttribute('opacity', fly >= 1 ? 0 : 1));
      tf(rays, 118, 62, 0, 1, 1);
      rays.setAttribute('opacity', t > 3.0 ? 0 : 0);
    }
  };
}
