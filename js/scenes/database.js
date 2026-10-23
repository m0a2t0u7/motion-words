// database：名前カードを1枚、データベース（円柱の印の保管庫）の差し込み口へ入れると、名前が並んで保存される（例文 All customer names are stored in the database.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { roomBg, desk, hp, reach } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, '名前カード'], [1.6, '差し込む'], [3.2, '保存された']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.0;
  const FY = roomBg(k, 'home', 240);
  // 低い台の上のカードの山
  desk(k, 150, 60, 200);
  const b = k.buddy({ x: 110, y: FY, scale: S });
  const card = (parent) => {
    const c = g({}, parent);
    el('rect', { x: -15, y: -10, width: 30, height: 20, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, c);
    el('circle', { cx: -7, cy: -2, r: 3.4, fill: pal.coral }, c);
    el('line', { x1: -1, y1: -3, x2: 10, y2: -3, stroke: pal.sub, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, c);
    el('line', { x1: -1, y1: 3, x2: 8, y2: 3, stroke: pal.line, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, c);
    return c;
  };
  [0, 1].forEach((i) => tf(card(), 180 + i * 6, 190 - i * 5));
  const mv = card(), cardRest = [180, 190];
  // 保管庫
  const sv = g({}); tf(sv, 300, 0);
  const slotY = 172;
  const cardIn = g({}); tf(cardIn, 0, 0);
  el('rect', { x: -48, y: 90, width: 96, height: 150, rx: 8, fill: '#C6D1E0', stroke: '#9FB0C7', 'stroke-width': 3 }, sv);
  el('rect', { x: -38, y: 100, width: 76, height: 56, rx: 5, fill: '#25324A' }, sv);
  const rows = [0, 1, 2].map((i) => {
    const r = g({}, sv);
    el('circle', { cx: -26, cy: 116 + i * 16, r: 4, fill: pal.mint }, r);
    el('rect', { x: -16, y: 113 + i * 16, width: [40, 30, 36][i], height: 6, rx: 3, fill: '#9FE3C4' }, r);
    return r;
  });
  el('rect', { x: -34, y: slotY - 4, width: 68, height: 8, rx: 4, fill: '#25324A' }, sv);
  const cyl = g({}, sv); tf(cyl, 0, 208);
  el('path', { d: 'M -18 -14 V 12 C -18 24 18 24 18 12 V -14', fill: pal.blue }, cyl);
  el('ellipse', { cx: 0, cy: -14, rx: 18, ry: 7, fill: '#8FBBFF' }, cyl);
  el('path', { d: 'M -18 -2 C -18 8 18 8 18 -2 M -18 8 C -18 18 18 18 18 8', fill: 'none', stroke: '#fff', 'stroke-width': 2, opacity: 0.8 }, cyl);
  const chk = g({}); el('circle', { r: 11, fill: pal.green }, chk);
  el('path', { d: 'M -5 0 l 4 4 l 7 -8', fill: 'none', stroke: '#fff', 'stroke-width': 3.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, chk);
  const xm = (t) => lerp(110, 192, easeInOut(seg(t, 0.8, 1.6)));
  return {
    update(t) {
      const w = walkTo(xm, t, 110);
      const take = seg(t, 0.2, 0.7), ins = easeInOut(seg(t, 1.8, 2.5));
      const o = { x: w.x, walk: w.walk, lean: w.lean + ins * 4, armL: w.armL, look: 0.5, mood: t > 3 ? 'grin' : 'smile', blink: blinkAt(t) };
      P(b, { ...o, armR: 8 });
      const s = hp(b, S, 'R', 0);
      const ty = t < 1.6 ? lerp(180, 190, 0.5) : lerp(190, slotY, easeInOut(seg(t, 1.6, 1.9)));
      const a = reach(b, S, 'R', s.x + 30, t < 0.8 ? 190 : ty);
      P(b, { ...o, armR: w.m > 0.2 && t > 0.8 && t < 1.7 ? lerp(w.armR, a, 0.7) : lerp(w.armR, a, easeOut(seg(t, 0.1, 0.7))) });
      const h = hp(b, S, 'R');
      const held = t > 0.4 && ins < 1;
      const slotX = 300 - 34 + 6;
      const cx = held ? h.x + 8 + ins * 38 : cardRest[0], cy = held ? h.y : cardRest[1];
      tf(mv, cx, cy);
      mv.setAttribute('opacity', t > 2.6 ? 0 : 1);
      rows.forEach((r, i) => r.setAttribute('opacity', seg(t, 2.6 + i * 0.25, 2.8 + i * 0.25) > 0 ? 1 : 0.18));
      tf(chk, 300, 70, 0, t < 3.2 ? 0.001 : backOut(seg(t, 3.2, 3.7)));
    }
  };
}
