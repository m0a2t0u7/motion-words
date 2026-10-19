// purse：腕に提げたハンドバッグを開け、携帯とティッシュを順に取り出してテーブルに置く（例文 She took her phone and some tissues out of her purse.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { hp, reach, P, blinkAt, face, homeBg, backTable } from './bag.js';
import { frontL } from './dig.js';
import { phone } from './look-over.js';

export function tissues(k, parent) {
  const g = k.g({}, parent);
  k.el('rect', { x: -10, y: -6, width: 20, height: 12, rx: 3, fill: '#BFE3F7', stroke: '#8FC6E6', 'stroke-width': 1.2 }, g);
  k.el('path', { d: 'M -5 -6 Q 0 -14 5 -6', fill: '#fff', stroke: k.pal.line, 'stroke-width': 1 }, g);
  return g;
}
// ハンドバッグ（原点＝持ち手の上）。back / front に分けて中身を挟む
export function purseParts(k, col = '#C878C8', dark = '#A35AA3') {
  const back = k.g({}), front = k.g({}), { el } = k;
  el('path', { d: 'M -10 2 Q 0 -10 10 2', stroke: dark, 'stroke-width': 3, fill: 'none' }, back);
  el('path', { d: 'M -20 6 L 20 6 L 18 24 L -18 24 Z', fill: dark }, back);
  el('path', { d: 'M -21 12 L 21 12 L 19 34 Q 0 37 -19 34 Z', fill: col }, front);
  el('circle', { cx: 0, cy: 16, r: 2.6, fill: k.pal.yellow }, front);
  return { back, front };
}

export const meta = { duration: 4.4, beats: [[0, 'バッグを開ける'], [1.1, '携帯を出す'], [2.6, 'ティッシュも']] };

export function create(k) {
  const { tf } = k, S = 1.2, FY = 236, BX = 175;
  homeBg(k, { FY, winX: 40, winW: 90, wall: '#F3EEF6' });
  const TOP = backTable(k, 230, 380, 188, FY);
  const pu = purseParts(k);
  const b = k.buddy({ x: BX, y: FY, scale: S });
  const fl = frontL(b, S);
  tf(pu.back, 0, 0);
  pu.back.parentNode.appendChild(pu.back);
  const ph = phone(k).g, ts = tissues(k);
  pu.front.parentNode.appendChild(pu.front);
  const P1 = { x: 262, y: TOP - 4 }, P2 = { x: 300, y: TOP - 6 };
  return {
    update(t) {
      P(b, { x: BX, look: 0.8, lean: 4, blink: blinkAt(t), mood: t > 3.8 ? 'grin' : 'smile' });
      fl.set(52);
      const ph0 = fl.pos(28);
      const px = ph0.x + 4, py = ph0.y - 4;
      tf(pu.back, px, py, 0, S); tf(pu.front, px, py, 0, S);
      // 右手：バッグの中 → 引き上げる → テーブルに置く（2回）
      const run = (a) => {
        const dn = seg(t, a, a + 0.35), up = seg(t, a + 0.45, a + 0.8), mv = seg(t, a + 0.8, a + 1.3);
        return { dn, up, mv };
      };
      const r1 = run(0.3), r2 = run(1.8);
      const inside = { x: px + 2, y: py + 24 * S }, top = { x: px + 4, y: py - 18 };
      const pick = (r, dst) => {
        if (r.mv > 0) return { x: lerp(top.x, dst.x, easeInOut(r.mv)), y: lerp(top.y, dst.y - 12, easeInOut(r.mv)) + 12 * easeIn2(seg(r.mv, 0.7, 1)) };
        if (r.up > 0) return { x: lerp(inside.x, top.x, easeOut(r.up)), y: lerp(inside.y, top.y, easeOut(r.up)) };
        return { x: lerp(top.x + 20, inside.x, easeInOut(r.dn)), y: lerp(top.y, inside.y, easeInOut(r.dn)) };
      };
      const easeIn2 = (p) => p * p;
      const tgt = t < 1.75 ? pick(r1, P1) : t < 3.3 ? pick(r2, P2) : { x: lerp(P2.x, px + 30, easeInOut(seg(t, 3.3, 3.8))), y: lerp(P2.y - 6, py + 6, easeInOut(seg(t, 3.3, 3.8))) };
      b.pose({ armR: reach(b, S, 'R', tgt.x, tgt.y) });
      face(b, 4, 2);
      fl.set(52);
      const h = hp(b, S, 'R');
      const held1 = t > 0.6 && t < 1.6, held2 = t > 2.1 && t < 3.1;
      tf(ph, held1 ? h.x : t < 0.6 ? inside.x : P1.x, held1 ? h.y + 2 : t < 0.6 ? inside.y + 4 : P1.y - 2, held1 ? 0 : t < 0.6 ? 0 : 90);
      tf(ts, held2 ? h.x : t < 2.1 ? inside.x + 4 : P2.x, held2 ? h.y + 6 : t < 2.1 ? inside.y + 6 : P2.y);
    }
  };
}
