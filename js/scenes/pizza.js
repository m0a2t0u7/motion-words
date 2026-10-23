// pizza：夕方の部屋で、まめが「今夜はピザを頼もう！」と提案。友だちも大喜びし、まめが電話でピザを注文する（例文 Let's order a pizza tonight.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt, sofa } from './run-after.js';
import { roomBg } from './look-over.js';
import { hp } from './dig.js';
import { smartphone } from './out-of-touch.js';
import { balloon } from './animal.js';

export function pizzaG(k, parent, r = 18) {
  const g = k.g({}, parent), { el } = k;
  el('circle', { r, fill: '#E9B65F' }, g); el('circle', { r: r - 3, fill: '#F7D56B' }, g);
  el('circle', { r: r - 4, fill: '#E8574A', opacity: 0.35 }, g);
  [[-6, -6], [6, -4], [0, 7], [-8, 5], [8, 6]].forEach(([x, y]) => el('circle', { cx: x * r / 18, cy: y * r / 18, r: 2.8 * r / 18, fill: '#C9403A' }, g));
  for (let i = 0; i < 3; i++) el('line', { x1: 0, y1: 0, x2: Math.cos(i * 1.05) * r, y2: Math.sin(i * 1.05) * r, stroke: '#E0A93A', 'stroke-width': 1 }, g);
  for (let i = 0; i < 3; i++) el('line', { x1: 0, y1: 0, x2: -Math.cos(i * 1.05) * r, y2: -Math.sin(i * 1.05) * r, stroke: '#E0A93A', 'stroke-width': 1 }, g);
  return g;
}

export const meta = { duration: 4.6, beats: [[0, '今夜は…'], [1.0, 'ピザにしよう'], [2.6, '電話で注文']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'home', 240, 'evening');
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: '#E7DCCD' });
  const lamp = g({}); el('rect', { x: 352, y: FY - 120, width: 4, height: 120, fill: pal.sub }, lamp); el('path', { d: `M 336 ${FY - 118} L 372 ${FY - 118} L 364 ${FY - 140} L 344 ${FY - 140} Z`, fill: pal.yellow }, lamp);
  el('circle', { cx: 354, cy: FY - 120, r: 40, fill: '#FFE7A0', opacity: 0.25 });
  const me = k.buddy({ x: 140, y: FY, scale: S });
  const fr = k.buddy({ x: 260, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const ph = smartphone(k);
  const idea = balloon(k, 64, 50, -1); pizzaG(k, idea.c, 16);
  const call = balloon(k, 70, 50, -1); const pz = pizzaG(k, call.c, 13); tf(pz, -12, 0); k.text(16, 0, 'x1', { 'font-size': 14, fill: pal.coralDark }, call.c);
  const rings = [0, 1].map(() => el('path', { d: 'M 0 -8 Q 6 0 0 8', stroke: pal.sub, 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }));
  return {
    update(t) {
      const prop = seg(t, 0.8, 1.1), yay = t > 1.6 && t < 2.6;
      const tel = easeInOut(seg(t, 2.4, 2.9));
      P(me, { x: 140, armL: t > 0.8 && t < 2.4 ? 110 + 10 * Math.sin(t * 8) : 8, armR: lerp(8, 160, tel), look: t < 2.6 ? 0.8 : 0.3, mood: t > 0.8 && t < 1.6 && Math.sin(t * 20) > 0 ? 'open' : t > 2.9 && Math.sin(t * 16) > 0.2 ? 'open' : 'grin', blink: blinkAt(t), lift: 5 * hump(seg(t, 0.8, 1.1)) });
      const h = hp(me, S, 'R', 28);
      tf(ph, lerp(h.x + 8, 140 + 22 * S, tel), lerp(h.y - 4, FY - 66 * S, tel), lerp(0, -20, tel), 0.8 + 0.1 * tel);
      ph.setAttribute('opacity', t > 2.2 ? 1 : 0);
      idea.show(prop * (1 - seg(t, 2.2, 2.4)), 150, FY - 104);
      P(fr, { x: 260, facing: -1, look: 0.7, armL: yay ? 150 + 16 * Math.sin(t * 12) : 8, armR: yay ? 150 - 16 * Math.sin(t * 12) : 8, lift: yay ? 8 * Math.abs(Math.sin(t * 7)) : 0, mood: t > 1.5 ? 'grin' : 'smile', blink: blinkAt(t, 1) });
      call.show(seg(t, 3.0, 3.3), 150, FY - 104);
      rings.forEach((r, i) => { const q = ((t * 1.5 + i / 2) % 1); tf(r, 140 + 40 + 10 * q + i * 6, FY - 66, 0, 0.8 + 0.4 * q); r.setAttribute('opacity', t > 2.9 ? 0.8 * (1 - q) : 0); });
    }
  };
}
