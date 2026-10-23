// degree：卒業帽をかぶり、歴史の本の横で学位記を手に持つ（例文 He has a degree in history.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, desk, hp } from './look-over.js';
import { grip } from './hand-over.js';

export const meta = { duration: 4.2, beats: [[0, '帽子を持つ'], [1.4, 'かぶる'], [3.2, '学位記']] };

function cap(k, parent) {
  const c = k.g({}, parent);
  k.el('path', { d: 'M -17 0 L -15 -9 Q 0 -13 15 -9 L 17 0 Z', fill: k.pal.ink }, c);
  k.el('path', { d: 'M -30 -10 L 0 -22 L 30 -10 L 0 2 Z', fill: k.pal.ink, stroke: '#3A4256', 'stroke-width': 1.5 }, c);
  k.el('path', { d: 'M 0 -10 L 22 -6 L 22 6', fill: 'none', stroke: k.pal.yellow, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, c);
  k.el('circle', { cx: 22, cy: 8, r: 3.2, fill: k.pal.yellow }, c);
  return c;
}

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'home', 240);
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const headCap = cap(k, b.body); tf(headCap, 0, -90);
  const handCap = cap(k);
  desk(k, 245, 145, 200);
  // 歴史の本（柱のしるし）
  const bk = g({}); tf(bk, 270, 200);
  el('rect', { x: -22, y: -34, width: 44, height: 34, rx: 3, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 2 }, bk);
  el('rect', { x: -22, y: -26, width: 44, height: 4, fill: pal.yellow }, bk);
  [-10, 0, 10].forEach((x) => el('rect', { x: x - 2, y: -20, width: 4, height: 14, fill: '#fff' }, bk));
  el('rect', { x: -14, y: -22, width: 28, height: 2, fill: '#fff' }, bk);
  // 学位記（巻物）
  const sc = g({});
  el('rect', { x: -26, y: -7, width: 52, height: 14, rx: 7, fill: '#FFF8E1', stroke: pal.yellowDark, 'stroke-width': 2 }, sc);
  el('rect', { x: -26, y: -7, width: 8, height: 14, rx: 4, fill: pal.yellow }, sc);
  el('rect', { x: 18, y: -7, width: 8, height: 14, rx: 4, fill: pal.yellow }, sc);
  el('rect', { x: -8, y: -3, width: 20, height: 3, rx: 1.5, fill: pal.red }, sc);
  const gr = grip(k, pal.mint, pal.mintDark, S), gl = grip(k, pal.mint, pal.mintDark, S);
  return {
    update(t) {
      const up = easeInOut(seg(t, 0.2, 0.9)), on = easeInOut(seg(t, 1.2, 1.9)), pick = easeInOut(seg(t, 2.4, 3.2));
      const sq = hump(seg(t, 1.9, 2.2)) * 0.05;
      P(b, { armR: lerp(lerp(20, 90, up), 8, on), armL: lerp(8, 70, pick), lean: 2, squash: 1 - sq, mood: t > 2.6 ? 'grin' : 'smile', blink: blinkAt(t) });
      const h = hp(b, S, 'R'), l = hp(b, S, 'L');
      gr(h); gl(l);
      // 帽子：手→頭
      const hx = lerp(h.x + 14, 150, on), hy = lerp(h.y - 8, FY - 91 * S, on);
      tf(handCap, hx, hy, lerp(0, 0, on), 0.9, 0.9);
      handCap.setAttribute('opacity', on < 1 ? 1 : 0);
      headCap.setAttribute('opacity', on >= 1 ? 1 : 0);
      // 巻物：机の上→左手
      tf(sc, lerp(335, l.x - 10, pick), lerp(193, l.y - 2, pick), lerp(0, -12, pick));
    }
  };
}
