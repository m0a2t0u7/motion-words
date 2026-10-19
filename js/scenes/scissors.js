// scissors：「はさみ取って」友だちが手渡し、まめがはさみで紙をまっすぐ切って2枚にする（例文 Can you pass me the scissors so I can cut this paper?）
import { seg, lerp, easeInOut, easeOut, clamp } from '../ease.js';
import { held, reach, hp, homeBg, backTable } from './bag.js';
import { give } from './charger.js';

// はさみ（原点＝持ち手、+y が刃先）。open(0..1)
export function scissorsProp(k, parent) {
  const g = k.g({}, parent), { el, pal } = k;
  const mk = (s) => { const a = k.g({}, g); el('path', { d: `M 0 0 L ${s * 2} 26 L ${-s * 1} 26 Z`, fill: '#C9D1DC', stroke: '#8E99A8', 'stroke-width': 1 }, a); el('circle', { cx: s * 5, cy: -6, r: 5, fill: 'none', stroke: s > 0 ? pal.red : pal.coralDark, 'stroke-width': 3 }, a); return a; };
  const A = mk(1), B = mk(-1);
  el('circle', { cx: 0, cy: 2, r: 1.8, fill: pal.ink }, g);
  return { g, open(q) { k.tf(A, 0, 0, -14 * q); k.tf(B, 0, 0, 14 * q); } };
}

export const meta = { duration: 4.4, beats: [[0, 'はさみ取って'], [1.0, '手渡す'], [2.4, '紙を切る']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1.1, FY = 236;
  homeBg(k, { FY, winX: 250, winW: 80 });
  const TY = backTable(k, 10, 130, 192, FY);
  const halfA = el('rect', { x: 40, y: TY - 4, width: 40, height: 4, fill: pal.yellow });
  const halfB = el('rect', { x: 80, y: TY - 4, width: 40, height: 4, fill: pal.yellow });
  const sheetV = el('rect', { x: 40, y: TY - 56, width: 70, height: 52, rx: 2, fill: '#FFE7A0', stroke: pal.yellowDark, 'stroke-width': 1.5 });
  const cut = el('line', { x1: 75, y1: TY - 56, x2: 75, y2: TY - 56, stroke: pal.ink, 'stroke-width': 1.5, 'stroke-dasharray': '3 2' });
  const L = el('rect', { x: 40, y: TY - 56, width: 35, height: 52, rx: 2, fill: '#FFE7A0', stroke: pal.yellowDark, 'stroke-width': 1.5 });
  const R = el('rect', { x: 75, y: TY - 56, width: 35, height: 52, rx: 2, fill: '#FFE7A0', stroke: pal.yellowDark, 'stroke-width': 1.5 });
  halfA.remove(); halfB.remove();
  const sc = scissorsProp(k);
  const up = give(k, {
    S, FY, bx: 170, cx: 300, item: sc.g, g0: 0.9, g1: 1.6, bubbleW: 74,
    ask: (g) => { const s2 = scissorsProp(k, g); k.tf(s2.g, -12, -12, 0, 0.8); s2.open(0.6); k.text(18, 0, '?', { 'font-size': 20, fill: pal.blueDark }, g); },
    carry: (t, c) => {
      const p = seg(t, 2.4, 3.4);
      if (t > 2.1) {
        c.b.pose({ facing: -1, lean: 6 });
        c.b.pose({ armR: reach(c.b, S, 'R', 75, lerp(TY - 70, TY - 8, t < 2.4 ? 0 : p)) });
      }
      sc.open(t > 2.4 && t < 3.4 ? Math.abs(Math.sin((t - 2.4) * 12)) : 0.15);
      const h = held(k, c.b, S, sc.g, 'R', t > 2.1 ? 180 : 0, t > 1.6 ? 28 : 28);
      if (t < 1.6) { const ch = hp(c.c, S, 'R'); tf(sc.g, ch.x, ch.y, 0, S); }
      void h;
      k.set(cut, { y2: TY - 56 + 52 * p, opacity: t > 2.4 && t < 3.45 ? 1 : 0 });
      const s = easeOut(seg(t, 3.45, 3.9));
      sheetV.setAttribute('opacity', t < 3.45 ? 1 : 0);
      [L, R].forEach((n, i) => { n.setAttribute('opacity', t < 3.45 ? 0 : 1); k.tf(n, (i ? 8 : -8) * s, 0, (i ? 4 : -4) * s); });
      return true;
    }
  });
  return { update: up };
}
