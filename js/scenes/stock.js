// stock：棚の S・M の箱は残っているが、L の場所は空っぽ。のぞいて在庫切れと分かる（例文 That size is out of stock right now.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { roomBg, hp, reach } from './look-over.js';

export const meta = { duration: 4.0, beats: [[0, '棚に来る'], [1.6, 'Lを探す'], [2.8, '在庫切れ']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.0;
  const FY = roomBg(k, 'home', 240);
  // 棚
  el('rect', { x: 60, y: 120, width: 172, height: 120, fill: '#F2DDBB', stroke: pal.woodDark, 'stroke-width': 4 });
  el('line', { x1: 60, y1: 180, x2: 232, y2: 180, stroke: pal.woodDark, 'stroke-width': 4 });
  el('line', { x1: 60, y1: 238, x2: 232, y2: 238, stroke: pal.woodDark, 'stroke-width': 4 });
  const box = (x, y, col, lab) => {
    el('rect', { x: x - 18, y: y - 36, width: 36, height: 36, rx: 3, fill: col });
    el('rect', { x: x - 18, y: y - 36, width: 36, height: 7, fill: 'rgba(255,255,255,0.35)' });
    k.text(x, y - 11, lab, { 'font-size': 16, fill: '#fff', 'font-weight': 700 });
  };
  [[100, 180, pal.blue, 'S'], [148, 180, pal.mint, 'M'], [100, 238, pal.blue, 'S'], [148, 238, pal.mint, 'M']].forEach((a) => box(...a));
  k.text(196, 222, "L", { "font-size": 16, fill: pal.sub, 'font-weight': 700 });
  const b = k.buddy({ x: 330, y: FY, scale: S, facing: -1 });
  const xm = (t) => lerp(350, 270, easeOut(seg(t, 0, 1.4)));
  const cross = g({});
  el('circle', { r: 17, fill: pal.red }, cross);
  el('path', { d: 'M -7 -7 L 7 7 M 7 -7 L -7 7', stroke: '#fff', 'stroke-width': 4.5, 'stroke-linecap': 'round' }, cross);
  return {
    update(t) {
      const w = walkTo(xm, t, 350, -1);
      const rch = easeInOut(seg(t, 1.6, 2.1)), back = easeInOut(seg(t, 2.6, 3.1));
      const o = { x: w.x, facing: -1, walk: w.walk, lean: w.lean + rch * 4, armL: w.armL, look: lerp(0.2, -0.8, seg(t, 1.2, 1.6)), mood: t > 2.7 ? 'sad' : 'flat', blink: blinkAt(t) };
      P(b, { ...o, armR: w.armR });
      const s = hp(b, S, 'R', 0);
      const a = reach(b, S, 'R', s.x - 40, 214);
      const shrug = t > 2.6 ? lerp(a, 62, back) : lerp(w.armR, a, rch);
      P(b, { ...o, armR: shrug, armL: lerp(w.armL, 62, back), squash: 1 - 0.03 * hump(seg(t, 2.6, 3.2)) });
      tf(cross, 196, lerp(196, 188, easeOut(seg(t, 2.7, 3.2))), 0, t < 2.7 ? 0.001 : backOut(seg(t, 2.7, 3.2)));
    }
  };
}
