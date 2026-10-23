// honey：まめがはちみつのびんから、ハニーディッパーでとろりとはちみつをすくい、紅茶のカップへたらす（例文 I put honey in my tea.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { hp, reach } from './dig.js';
import { mugG } from './flour.js';
import { cloth } from './spinach.js';

export function dipperG(k, parent) {
  const g = k.g({}, parent);
  k.el('rect', { x: -2, y: -10, width: 4, height: 34, rx: 2, fill: '#C9A577' }, g);
  const head = k.g({}, g);
  [0, 5, 10].forEach((y) => k.el('ellipse', { cx: 0, cy: 26 + y, rx: 7, ry: 3, fill: '#D9AE6B', stroke: '#B88A47', 'stroke-width': 1 }, head));
  const coat = k.el('path', { d: 'M -7 26 L 7 26 L 6 40 Q 0 46 -6 40 Z', fill: '#F2B21E', opacity: 0 }, g);
  return { g, coat };
}

export const meta = { duration: 4.4, beats: [[0, 'はちみつ'], [1.2, 'とろーり'], [3.0, '紅茶に入れた']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.0;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 250, y: 44, width: 110, height: 76, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const me = k.buddy({ x: 120, y: FY - 2, scale: S });
  const TY = 212; cloth(k, 40, 360, TY, FY, '#FFFDF4', '#F2B21E');
  const M = mugG(k, undefined, '#FFFFFF', '#D9883E'); tf(M.g, 220, TY, 0, 1.4);
  // はちみつのびん（右）
  const jar = g({}); tf(jar, 300, TY);
  el('path', { d: 'M -20 0 L -22 -34 Q -22 -40 -16 -40 L 16 -40 Q 22 -40 22 -34 L 20 0 Z', fill: '#F2B21E', opacity: 0.9 }, jar);
  el('rect', { x: -18, y: -48, width: 36, height: 9, rx: 3, fill: '#E3C49B' }, jar);
  el('path', { d: 'M -10 -22 l 5 -9 h 10 l 5 9 l -5 9 h -10 Z', fill: 'none', stroke: '#fff', 'stroke-width': 2, opacity: 0.8 }, jar);
  const lid = g({}); el('rect', { x: -20, y: -6, width: 40, height: 8, rx: 3, fill: '#C9A577' }, lid); tf(lid, 336, TY);
  const D = dipperG(k);
  const drip = el('path', { stroke: '#F2B21E', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' });
  const drop = el('ellipse', { rx: 3, ry: 4, fill: '#F2B21E' });
  const steam = [0, 1].map(() => el('path', { d: 'M 0 0 q -4 -6 0 -12 q 4 -6 0 -12', stroke: '#fff', 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }));
  const sw = el('path', { d: 'M -10 0 q 5 -3 10 0 q 5 3 10 0', stroke: '#F2B21E', 'stroke-width': 2, fill: 'none' });
  return {
    update(t) {
      const dip = easeInOut(seg(t, 0.3, 0.8)), lift = easeInOut(seg(t, 0.9, 1.5)), stir = t > 3.0 && t < 3.9;
      P(me, { x: 120, y: FY - 2, look: 0.6, mood: t > 3.4 ? 'grin' : 'smile', blink: blinkAt(t), lean: 6 });
      const inJar = { x: 300, y: TY - 70 }, over = { x: 222, y: TY - 100 }, rest = { x: 190, y: TY - 70 };
      let tg = t < 0.9 ? { x: lerp(rest.x, inJar.x, dip), y: lerp(rest.y, inJar.y, dip) } : { x: lerp(inJar.x, over.x, lift), y: lerp(inJar.y, over.y, lift) - 20 * hump(lift) };
      if (stir) tg = { x: 222 + Math.cos(t * 10) * 8, y: TY - 80 };
      me.pose({ armR: reach(me, S, 'R', tg.x, tg.y) });
      const h = hp(me, S, 'R', 28);
      tf(D.g, h.x, h.y, 0, S);
      D.coat.setAttribute('opacity', t > 0.8 && t < 3.0 ? 1 - 0.7 * seg(t, 1.5, 3.0) : 0);
      const pour = t > 1.5 && t < 3.0;
      const bot = h.y + 44, cupTop = TY - 34;
      k.set(drip, { d: `M ${h.x} ${bot} Q ${h.x + Math.sin(t * 4) * 2} ${(bot + cupTop) / 2} ${h.x} ${cupTop}`, opacity: pour ? 1 : 0, 'stroke-width': 3 - 1.5 * seg(t, 2.2, 3.0) });
      const dq = ((t - 1.5) * 1.6) % 1; k.set(drop, { cx: h.x, cy: lerp(bot, cupTop, dq * dq), opacity: pour ? 1 : 0 });
      const mix = seg(t, 1.6, 3.4); M.liq.setAttribute('fill', mix > 0.5 ? '#E9A23C' : '#D9883E');
      tf(sw, 220, TY - 33, (t * 200) % 360, 0.9); sw.setAttribute('opacity', stir ? 0.9 : 0);
      steam.forEach((s, i) => { const p = ((t * 0.6 + i / 2) % 1); tf(s, 212 + i * 14, TY - 40 - 16 * p); s.setAttribute('opacity', 0.7 * hump(p)); });
    }
  };
}
