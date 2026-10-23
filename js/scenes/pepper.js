// pepper：食卓で、まめが手を出して「塩とコショウを取って」。友だちが塩とコショウの入れ物を2つ手わたす（例文 Please pass me the salt and pepper.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { hp, reach } from './dig.js';
import { plateG } from './flour.js';
import { cloth } from './spinach.js';
import { balloon } from './animal.js';

export function shaker(k, parent, col, letter, lc = '#fff') {
  const g = k.g({}, parent);
  k.el('path', { d: 'M -7 0 L -8 -18 Q 0 -26 8 -18 L 7 0 Z', fill: col, stroke: '#9AA3B2', 'stroke-width': 1.2 }, g);
  k.el('rect', { x: -7, y: -24, width: 14, height: 5, rx: 2, fill: '#C7CED8' }, g);
  [[-3, -26], [0, -26.5], [3, -26]].forEach(([x, y]) => k.el('circle', { cx: x, cy: y + 4, r: 0.8, fill: '#5E6778' }, g));
  k.text(0, -9, letter, { 'font-size': 9, fill: lc }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '取ってくれる？'], [1.4, '手わたす'], [3.0, '受け取った']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.0;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 150, y: 40, width: 100, height: 70, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const me = k.buddy({ x: 96, y: FY - 2, scale: S });
  const fr = k.buddy({ x: 304, y: FY - 2, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const TY = 212; cloth(k, 40, 360, TY, FY, '#FFFFFF', '#F2C14E');
  const p1 = g({}); tf(p1, 150, TY); plateG(k, p1, 60); el('ellipse', { cx: 0, cy: -8, rx: 16, ry: 6, fill: '#F2C14E' }, p1); el('ellipse', { cx: 0, cy: -10, rx: 7, ry: 3, fill: '#fff' }, p1);
  const salt = shaker(k, undefined, '#FFFFFF', 'S', pal.sub), pep = shaker(k, undefined, '#3A3F4B', 'P');
  const ask = balloon(k, 62, 40, -1); const a1 = shaker(k, ask.c, '#FFFFFF', 'S', pal.sub); tf(a1, -10, 12, 0, 0.8); const a2 = shaker(k, ask.c, '#3A3F4B', 'P'); tf(a2, 10, 12, 0, 0.8);
  return {
    update(t) {
      const out = easeOut(seg(t, 0.2, 0.6));
      ask.show(seg(t, 0.3, 0.6) * (1 - seg(t, 1.4, 1.6)), 118, FY - 112);
      // 友だち：塩とコショウを両手でつかんで差し出す
      const grab = easeInOut(seg(t, 1.0, 1.4)), pass = easeInOut(seg(t, 1.6, 2.6)), back = easeInOut(seg(t, 3.0, 3.5));
      P(fr, { x: 304, y: FY - 2, facing: -1, look: 0.6, mood: 'smile', blink: blinkAt(t, 1), lean: 8 * pass * (1 - back) });
      const sx0 = 262, px0 = 278, handoff = { x: 196, y: TY - 34 };
      const sp = { x: lerp(sx0, handoff.x - 6, pass), y: lerp(TY, handoff.y, pass) - 14 * hump(pass) };
      const pp = { x: lerp(px0, handoff.x + 10, pass), y: lerp(TY, handoff.y, pass) - 14 * hump(pass) };
      const holdF = t > 1.4 && t < 2.8;
      fr.pose({ armR: lerp(30, reach(fr, S, 'R', holdF ? sp.x : lerp(sx0, sp.x, 1), holdF ? sp.y - 8 : TY - 10), Math.max(grab, 0) * (1 - back)) });
      // まめ：手のひらを上にして待ち、受け取る
      P(me, { x: 96, y: FY - 2, look: 0.6, mood: t > 2.7 ? 'grin' : t > 0.2 && t < 1.2 && Math.sin(t * 20) > 0 ? 'open' : 'smile', blink: blinkAt(t) });
      me.pose({ armR: lerp(8, reach(me, S, 'R', handoff.x, handoff.y + 6), out), lean: 4 * out });
      const got = t > 2.7;
      const mh = hp(me, S, 'R', 28);
      const sP = got ? { x: mh.x - 4, y: mh.y + 2 } : sp, pP = got ? { x: mh.x + 12, y: mh.y + 2 } : pp;
      tf(salt, sP.x, sP.y); tf(pep, pP.x, pP.y);
      if (got) { const pull = easeInOut(seg(t, 3.2, 3.8)); me.pose({ armR: lerp(reach(me, S, 'R', handoff.x, handoff.y + 6), 60, pull) }); const h2 = hp(me, S, 'R', 28); tf(salt, h2.x - 4, h2.y + 2); tf(pep, h2.x + 12, h2.y + 2); }
    }
  };
}
