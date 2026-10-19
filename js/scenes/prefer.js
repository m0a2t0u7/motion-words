// prefer：テーブルに紅茶とコーヒー。まめは両方を見比べ、コーヒーは手で少し押しやり、紅茶のカップを取って飲む（例文 I prefer tea to coffee.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { hp, reach } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { roomBg } from './look-over.js';
import { desk } from './get-on-with.js';
import { heart } from './weigh.js';

function teacup(k, parent) {
  const g = k.g({}, parent), pal = k.pal;
  k.el('path', { d: 'M -12 -14 L 12 -14 Q 11 0 0 0 Q -11 0 -12 -14 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, g);
  k.el('ellipse', { cx: 0, cy: -14, rx: 12, ry: 3, fill: '#D98B3A' }, g);
  k.el('path', { d: 'M 12 -11 Q 19 -9 11 -4', stroke: pal.line, 'stroke-width': 2.5, fill: 'none' }, g);
  k.el('path', { d: 'M -4 -14 L -6 -2', stroke: pal.sub, 'stroke-width': 1 }, g);
  k.el('rect', { x: -9, y: -4, width: 6, height: 6, rx: 1, fill: pal.yellow }, g);
  return g;
}
function mug(k, parent) {
  const g = k.g({}, parent), pal = k.pal;
  k.el('rect', { x: -11, y: -22, width: 22, height: 22, rx: 3, fill: pal.ink }, g);
  k.el('ellipse', { cx: 0, cy: -22, rx: 11, ry: 2.5, fill: '#4A2E1E' }, g);
  k.el('path', { d: 'M 11 -17 Q 19 -15 11 -6', stroke: pal.ink, 'stroke-width': 3, fill: 'none' }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '紅茶とコーヒー'], [1.2, '見比べる'], [2.4, '紅茶を選ぶ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  const S = 1.15;
  const me = k.buddy({ x: 130, y: FY, scale: S });
  const top = desk(k, 80, 280, FY);
  // 皿の上の紅茶（手前）とポット、コーヒー（奥）
  el('ellipse', { cx: 196, cy: top - 1, rx: 20, ry: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 });
  const pot = g({}); tf(pot, 324, top);
  el('path', { d: 'M -16 0 Q -20 -24 0 -26 Q 20 -24 16 0 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, pot);
  el('path', { d: 'M -16 -14 L -28 -24', stroke: pal.line, 'stroke-width': 4, 'stroke-linecap': 'round' }, pot);
  el('circle', { cx: 0, cy: -28, r: 3, fill: pal.line }, pot);
  const tc = teacup(k); const mg = mug(k);
  const ms = k.shadow(250, top + 1, 12, 2);
  const steam = [0, 1].map(() => el('path', { d: 'M 0 0 q -4 -5 0 -10 q 4 -5 0 -10', stroke: '#E8EEF4', 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' }));
  const hr = heart(k, k.root, pal.red);
  return {
    update(t) {
      // 見比べ：コーヒーを見る（0.4-1.0, 渋い顔）→ 紅茶を見る（1.0-1.6, にっこり）
      const lk = t < 1.0 ? lerp(0, 1, easeInOut(seg(t, 0.3, 0.6))) : lerp(1, 0.2, easeInOut(seg(t, 1.0, 1.3)));
      // 手：コーヒーを奥へ押しやる（1.5-2.1）→ 紅茶を持ち上げて口へ（2.3-3.2）
      const toM = easeInOut(seg(t, 1.5, 1.8)), push = easeInOut(seg(t, 1.8, 2.1));
      const mx = lerp(236, 264, push);
      const toT = easeInOut(seg(t, 2.2, 2.5)), sip = easeInOut(seg(t, 2.6, 3.1));
      let tg = { x: lerp(180, mx - 14, toM), y: lerp(top + 4, top - 12, toM) };
      if (t > 2.15) tg = { x: lerp(mx - 14, 196, toT), y: lerp(top - 12, top - 10, toT) };
      if (t > 2.55) tg = { x: lerp(196, 160, sip), y: lerp(top - 10, FY - 54, sip) };
      P(me, { lean: 8 + 4 * hump(push) - 6 * sip, look: lk, mood: t < 1.0 && t > 0.5 ? 'flat' : t > 3.1 ? 'grin' : 'smile', blink: t > 3.1 && t < 3.9 ? 1 : blinkAt(t, 0.9), armL: 10, squash: 1 + 0.02 * hump(seg(t, 3.1, 3.5)) });
      me.pose({ armR: t < 1.45 ? 8 : reach(me, S, 'R', tg.x, tg.y) });
      tf(mg, mx, top); tf(ms, mx - 250, 0);
      const h = hp(me, S, 'R', 30);
      if (t > 2.5) tf(tc, h.x + 4, h.y + 8, -20 * sip); else tf(tc, 196, top - 2);
      steam.forEach((s, i) => { const q = (t * 0.9 + i / 2) % 1; const b = t > 2.5 ? { x: h.x + 4, y: h.y - 6 } : { x: 196, y: top - 18 }; tf(s, b.x - 4 + i * 8, b.y - 12 * q); s.setAttribute('opacity', hump(q) * 0.9); });
      const hq = seg(t, 3.2, 3.6);
      tf(hr, 122, 112 - 4 * Math.sin(t * 4) * hq, 0, Math.max(0.001, easeOut(hq) * 1.8));
    }
  };
}
