// bakery：7時になると、パン屋のシャッターが上がり、パン職人が開店する（例文 The bakery opens at seven.）
// 共有：shutter（巻き上げシャッター）、bread（パン）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { P, blinkAt, storefront, signBoard, hp, held } from './restaurant.js';
import { streetBg } from './weigh.js';
import { clock } from './run-after.js';

// シャッター（x, y, w, h の範囲を覆う）。set(開き 0..1)
export function shutter(k, x, y, w, h) {
  const g = k.g({}), c = k.clip((cp) => k.el('rect', { x, y, width: w, height: h }, cp));
  const inner = k.g({ 'clip-path': c }, g), slats = k.g({}, inner);
  k.el('rect', { x, y, width: w, height: h, fill: '#C3CAD4' }, slats);
  for (let yy = y + 6; yy < y + h; yy += 8) k.el('rect', { x, y: yy, width: w, height: 2, fill: '#A9B2BE' }, slats);
  const bar = k.el('rect', { x, y: y + h - 6, width: w, height: 6, fill: '#8C96A4' }, slats);
  k.el('rect', { x: x - 4, y: y - 8, width: w + 8, height: 10, rx: 3, fill: '#8C96A4' }, g);
  return { g, set(q) { k.tf(slats, 0, -h * q); } };
}
// パン（原点＝底の中央）
export function bread(k, kind, parent) {
  const g = k.g({}, parent);
  if (kind === 'loaf') { k.el('path', { d: 'M -16 0 Q -18 -16 0 -16 Q 18 -16 16 0 Z', fill: '#D99A55' }, g); [-7, 0, 7].forEach((x) => k.el('path', { d: `M ${x - 3} -12 l 5 -2`, stroke: '#B97834', 'stroke-width': 2, 'stroke-linecap': 'round' }, g)); }
  else if (kind === 'croissant') k.el('path', { d: 'M -16 0 Q -12 -14 0 -14 Q 12 -14 16 0 Q 8 -5 0 -5 Q -8 -5 -16 0 Z', fill: '#E7A94E', stroke: '#C98432', 'stroke-width': 1.5 }, g);
  else { k.el('ellipse', { cx: 0, cy: -7, rx: 13, ry: 8, fill: '#E3AE6C' }, g); k.el('ellipse', { cx: -3, cy: -10, rx: 5, ry: 2, fill: '#fff', opacity: 0.35 }, g); }
  return g;
}

export const meta = { duration: 4.4, beats: [[0, 'もうすぐ7時'], [1.4, '7時になった'], [2.8, 'パン屋が開く']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 240;
  streetBg(k, FY);
  const sf = storefront(k, { x: 60, w: 280, h: 190, FY, wall: '#FBEBD6', trim: '#B9773F', awn: ['#E7A94E', '#fff'], label: 'BAKERY', signFill: '#B9773F', doorW: 50, doorX: 268 });
  // 窓の中：棚とパン
  const wx = 72, wy = sf.wy, ww = 184, wh = FY - wy - 10;
  el('rect', { x: wx, y: wy, width: ww, height: wh, rx: 4, fill: '#FFF4E2', stroke: '#fff', 'stroke-width': 4 });
  [wy + 40, wy + 80].forEach((y, r) => { el('rect', { x: wx + 6, y, width: ww - 12, height: 5, fill: pal.woodDark }); [0, 1, 2, 3, 4].forEach((i) => tf(bread(k, ['loaf', 'croissant', 'bun'][(i + r) % 3]), wx + 24 + i * 34, y)); });
  el('rect', { x: sf.doorX + 6, y: sf.doorTop + 8, width: sf.doorW - 12, height: 40, rx: 3, fill: '#FFF4E2' });
  // 店の中のパン職人（ドアの窓から見える）
  const baker = k.buddy({ x: sf.doorX + 25, y: FY, scale: 0.8, facing: -1, color: pal.coral, dark: pal.coralDark });
  const hat = el('path', { d: 'M -22 -76 Q -26 -100 -8 -96 Q 0 -110 10 -96 Q 28 -100 22 -76 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, baker.body);
  const sh1 = shutter(k, wx - 4, wy - 4, ww + 8, wh + 8), sh2 = shutter(k, sf.doorX, sf.doorTop, sf.doorW, FY - sf.doorTop);
  const ck = clock(k, 304, 68, 16);
  const cust = k.buddy({ x: 120, y: FY + 18, scale: 1, facing: 1 });
  return {
    update(t) {
      const mins = lerp(-1, 0, easeOut(seg(t, 1.2, 1.5)));
      ck.set(7 + mins / 60, mins < 0 ? 59 : 0);
      const ring = t > 1.4 && t < 2.0 ? wobble(seg(t, 1.4, 2.0), 5, 3) * 8 : 0;
      ck.g.setAttribute('transform', `translate(304 68) rotate(${ring.toFixed(2)})`);
      const op = easeInOut(seg(t, 1.8, 3.0));
      sh1.set(op); sh2.set(easeInOut(seg(t, 1.9, 3.1)));
      baker.g.setAttribute('opacity', op > 0.6 ? 1 : 0);
      P(baker, { x: sf.doorX + 25, armR: lerp(8, 160, hump(seg(t, 3.0, 4.4)) > 0 ? 150 : 8), armL: 10, mood: 'grin', blink: blinkAt(t) });
      baker.pose({ armR: 8 + 150 * clamp(seg(t, 3.0, 3.3)) - 20 * Math.sin(t * 12) * clamp(seg(t, 3.0, 3.3)) });
      P(cust, { x: 150, y: FY + 18, look: t > 1.3 ? 0.4 : 0, lean: t < 1.3 ? -4 : 2, mood: t > 3 ? 'grin' : 'flat', blink: blinkAt(t, 0.7), armR: t > 2.9 ? lerp(8, 60, easeOut(seg(t, 2.9, 3.3))) : 8 });
      if (t < 1.3) cust.body.children[3].setAttribute('transform', 'translate(-4 -6)');
    }
  };
}
