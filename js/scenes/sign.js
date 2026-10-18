// sign：書類の署名欄に、まめがペンで自分の名前をさらさらと書く（例文 Please sign your name here.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { hp, reach } from './dig.js';

export const meta = { duration: 4.8, beats: [[0, '署名欄'], [1.2, '名前を書く'], [3.6, '署名できた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 40, y: 44, width: 70, height: 60, rx: 8, fill: '#DDEFFA' });
  el('line', { x1: 75, y1: 44, x2: 75, y2: 104, stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 0, y: 200, width: 400, height: 14, fill: '#F2DDBB' });
  el('rect', { x: 0, y: 200, width: 400, height: 2, fill: '#fff', opacity: 0.6 });
  // 書類（机の上）
  const D = g({});
  el('path', { d: 'M 176 201 L 190 172 L 330 172 L 344 201 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 1.6 }, D);
  [180, 184.5, 189].forEach((y, i) => el('line', { x1: 198 - i * 1.5, x2: 318 + i * 1.5 - (i === 2 ? 40 : 0), y1: y, y2: y, stroke: pal.line, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, D));
  k.text(204, 195, '×', { 'font-size': 11, fill: pal.sub }, D);
  el('line', { x1: 212, y1: 197, x2: 282, y2: 197, stroke: pal.sub, 'stroke-width': 1.6 }, D);
  const sig = el('path', { d: 'M 216 194 q 5 -12 8 -2 q 2 5 5 -1 q 4 -9 7 0 q 3 6 7 -4 q 2 -4 4 2 q 3 5 10 -3 q 5 -3 8 3', fill: 'none', stroke: pal.blue, 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, D);
  const S = 1.0;
  const me = k.buddy({ x: 176, y: FY, scale: S });
  el('rect', { x: 0, y: 214, width: 400, height: 40, fill: pal.wood });
  el('rect', { x: 0, y: 214, width: 400, height: 3, fill: pal.woodDark, opacity: 0.4 });
  const hand = el('circle', { r: 6.5 * S, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.4 });
  const pen = g({});
  el('rect', { x: -1.8, y: -22, width: 3.6, height: 20, rx: 1.8, fill: pal.violet }, pen);
  el('path', { d: 'M -1.8 -2 L 0 3 L 1.8 -2 Z', fill: pal.ink }, pen);
  const chk = g({}); tf(chk, 322, 150, 0, 0.001);
  el('circle', { r: 11, fill: pal.green }, chk);
  el('path', { d: 'M -4.6 0 L -1.4 3.6 L 5 -3.6', stroke: '#fff', 'stroke-width': 2.8, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, chk);
  const len = sig.getTotalLength();

  return {
    update(t) {
      const wp = easeInOut(seg(t, 1.2, 3.4));
      const reachP = easeInOut(seg(t, 0.3, 1.1)), away = easeInOut(seg(t, 3.5, 4.1));
      sig.setAttribute('stroke-dashoffset', 1 - wp);
      const P = sig.getPointAtLength(len * Math.max(0.001, wp));
      const PX = 216 + (P.x - 216) * 1, PY = P.y;
      // 手：ペン先が書いている点に来る位置
      const tx = PX + 5, ty = PY - 17;
      const bx = lerp(176, 168 + (PX - 216) * 0.9, easeInOut(seg(t, 1.2, 3.4)));
      me.pose({ x: bx, armL: 8, lean: 3, look: 0.6, mood: t > 3.6 ? 'grin' : 'smile', squash: 1, armR: 30 });
      const a = lerp(30, reach(me, S, 'R', tx, ty), reachP);
      me.pose({ armR: lerp(a, 24, away) });
      const h = hp(me, S, 'R', 26);
      k.set(hand, { cx: h.x, cy: h.y });
      tf(pen, lerp(h.x - 4, h.x - 5, 0), h.y + 17 - 0, 18);
      tf(chk, 322, 150 - 4 * (1 - easeOut(seg(t, 3.7, 4.1))), 0, backOut(seg(t, 3.7, 4.2)) + 0.001);
    }
  };
}
