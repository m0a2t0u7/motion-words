// tuna：まめがツナ缶からスプーンでツナをすくってパンにのせ、もう1枚のパンをのせてツナサンドを作る（例文 I made a tuna sandwich.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { hp, reach } from './dig.js';
import { kitchen, spoonG } from './flour.js';
import { fishG } from './pond.js';

// 食パン1枚（原点＝下辺の中央、横から見た薄い板）
export function breadG(k, parent, w = 64) {
  const g = k.g({}, parent);
  k.el('rect', { x: -w / 2, y: -8, width: w, height: 8, rx: 3, fill: '#F7E3B5', stroke: '#D9A85E', 'stroke-width': 2 }, g);
  return g;
}
// まな板（原点＝上面の中央）
export function boardG(k, x, y, w = 110) {
  const g = k.g({}); k.tf(g, x, y);
  k.el('rect', { x: -w / 2, y: 0, width: w, height: 7, rx: 3, fill: '#E3C49B', stroke: '#C9A577', 'stroke-width': 1.5 }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, 'ツナ缶'], [0.8, 'パンにのせる'], [3.0, 'ツナサンド']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.05;
  const R = kitchen(k), TY = R.TY, MY = TY + 22;
  const me = k.buddy({ x: 130, y: MY, scale: S });
  R.front();
  boardG(k, 236, TY - 7);
  const BY = TY - 7;
  const low = breadG(k); tf(low, 236, BY);
  const tuna = el('path', { d: '', fill: '#F2D2B6', stroke: '#D9AE8E', 'stroke-width': 1.5 });
  const top = breadG(k);
  // ツナ缶（右）
  const can = g({}); tf(can, 326, TY);
  el('rect', { x: -20, y: -20, width: 40, height: 20, rx: 3, fill: '#5C7FD6' }, can);
  el('rect', { x: -20, y: -20, width: 40, height: 4, fill: '#AEB8C6' }, can);
  const f = fishG(k, '#fff', can, '#DCEBFF'); f.set(0, -9, 1, 0, 0.7);
  el('ellipse', { cx: 0, cy: -20, rx: 20, ry: 4, fill: '#F2D2B6' }, can);
  const lid = el('ellipse', { cx: 0, cy: 0, rx: 18, ry: 3.5, fill: '#C7CED8', stroke: '#9AA3B2' }); tf(lid, 352, TY - 2, -70);
  const sp = spoonG(k);
  const lump = el('ellipse', { rx: 5, ry: 3.5, fill: '#F2D2B6' });
  return {
    update(t) {
      const per = 0.9, n = clamp(Math.floor((t - 0.6) / per), 0, 1), q = clamp((t - 0.6) / per - n), scoop = t > 0.6 && t < 0.6 + per * 2;
      const c = { x: 326, y: TY - 30 }, b = { x: 236, y: BY - 34 };
      const tg = scoop ? (q < 0.4 ? { x: lerp(b.x, c.x, hump(q / 0.4 * 0.5 + 0.5) * 0 + easeInOut(q / 0.4)), y: c.y } : { x: lerp(c.x, b.x, easeInOut((q - 0.4) / 0.6)), y: lerp(c.y, b.y, easeInOut((q - 0.4) / 0.6)) - 20 * hump((q - 0.4) / 0.6) }) : { x: 236, y: TY - 70 };
      const put = easeInOut(seg(t, 2.6, 3.2));
      P(me, { x: 130, y: MY, look: 0.7, mood: t > 3.2 ? 'grin' : 'smile', blink: blinkAt(t), lean: 6 });
      if (t < 2.6) me.pose({ armR: reach(me, S, 'R', tg.x, tg.y) });
      else me.pose({ armR: reach(me, S, 'R', 236, lerp(TY - 90, BY - 30, put)) });
      const h = hp(me, S, 'R', 28);
      tf(sp.g, h.x, h.y, -20, S); sp.g.setAttribute('opacity', t < 2.5 ? 1 : 0);
      const tip = { x: h.x + 6, y: h.y + 18 };
      const carry = scoop && q > 0.35 && q < 0.95; tf(lump, tip.x, tip.y); lump.setAttribute('opacity', carry ? 1 : 0);
      const amt = clamp(seg(t, 1.3, 1.5) * 0.5 + seg(t, 2.2, 2.4) * 0.5);
      const w = 6 + 22 * amt, hgt = 3 + 7 * amt;
      k.set(tuna, { d: amt > 0 ? `M ${236 - w} ${BY - 8} Q ${236 - w * 0.6} ${BY - 8 - hgt} ${236} ${BY - 8 - hgt} Q ${236 + w * 0.6} ${BY - 8 - hgt} ${236 + w} ${BY - 8} Z` : '', opacity: amt > 0 ? 1 : 0 });
      tf(top, t < 2.6 ? 236 : lerp(h.x, 236, put), t < 2.6 ? 0 : lerp(h.y + 4, BY - 8 - 10, put)); top.setAttribute('opacity', t >= 2.6 ? 1 : 0);
    }
  };
}
