// handle：まめがカップの取っ手を持って持ち上げると取っ手が取れ、カップはテーブルに落ちる（例文 The handle of the cup is broken.）
import { seg, lerp, easeInOut, easeOut, easeIn, wobble, hump } from '../ease.js';
import { table, reach, hp } from './dig.js';
import { P, blinkAt } from './run-after.js';

export const meta = { duration: 4.2, beats: [[0, '取っ手を持つ'], [1.3, '取れた！'], [2.6, '取っ手が壊れた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const TY = table(k, 196);
  el('rect', { x: 40, y: 44, width: 90, height: 66, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const S = 1.0;
  const me = k.buddy({ x: 150, y: 236, scale: S });
  const CX = 262, CY = 186;
  // カップ（原点＝底の中央）
  const cup = g({});
  const csh = k.shadow(CX, CY + 1, 22, 3);
  el('path', { d: 'M -18 -40 L 18 -40 L 15 -4 Q 14 0 10 0 L -10 0 Q -14 0 -15 -4 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, cup);
  el('rect', { x: -17, y: -30, width: 34, height: 7, fill: pal.blue, opacity: 0.8 }, cup);
  el('ellipse', { cx: 0, cy: -40, rx: 18, ry: 4, fill: pal.coffee }, cup);
  // 取っ手の付け根の折れ跡
  const stubs = g({}, cup);
  el('path', { d: 'M -18 -33 l -4 1 l 1 3 M -16 -12 l -4 -1 l 1 -3', stroke: pal.sub, 'stroke-width': 2, fill: 'none' }, stubs);
  // 取っ手（原点＝つかむ所）
  const hd = g({});
  el('path', { d: 'M 6 -11 Q -8 -12 -8 0 Q -8 11 6 10', fill: 'none', stroke: '#fff', 'stroke-width': 6, 'stroke-linecap': 'round' }, hd);
  el('path', { d: 'M 6 -11 Q -8 -12 -8 0 Q -8 11 6 10', fill: 'none', stroke: pal.line, 'stroke-width': 1.5 }, hd);
  el('path', { d: 'M 5 -14 l 3 3 l -2 2 M 5 13 l 3 -3 l -2 -2', stroke: pal.sub, 'stroke-width': 1.6, fill: 'none' }, hd);
  const crack = g({});
  el('path', { d: 'M 0 -12 L 3 -4 L 12 -6 L 5 0 L 10 8 L 1 4 L -4 11 L -3 2 L -12 0 L -3 -4 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 }, crack);
  const splash = [0, 1, 2, 3].map(() => el('path', { d: 'M 0 -4 Q 3 0 0 3 Q -3 0 0 -4 Z', fill: pal.coffee }));
  const HX = CX - 24, HY = CY - 22; // 取っ手の位置（カップに付いているとき）
  return {
    update(t) {
      const r = easeInOut(seg(t, 0.2, 0.8)), up = easeOut(seg(t, 0.85, 1.25)), snapT = 1.25;
      const broke = t > snapT;
      const look = easeInOut(seg(t, 1.9, 2.5));
      P(me, { x: 150, lean: 8 * r * (1 - look) - 8 * hump(seg(t, 1.25, 1.7)), look: 0.6, mood: t < 1.25 ? 'smile' : t < 3.0 ? 'open' : 'flat',
        blink: blinkAt(t), lift: 0 });
      // 手の目標：取っ手 → 少し持ち上げ → 目の前で見る
      let tx = HX - 4, ty = HY - 16 * up;
      if (broke) { const back = easeOut(seg(t, 1.25, 1.5)); tx = lerp(HX - 4, HX - 16, back); ty = lerp(HY - 16, HY - 26, back); }
      if (look > 0) { tx = lerp(tx, 196, look); ty = lerp(ty, 108, look); }
      me.pose({ armR: lerp(8, reach(me, S, 'R', tx, ty), r) });
      const h = hp(me, S, 'R');
      if (t < 0.85) tf(hd, HX, HY); else tf(hd, h.x + 4, h.y, -20 * look);
      // カップ：一緒に少し上がる → 取っ手が取れて落ちる
      const fall = easeIn(seg(t, snapT, snapT + 0.22));
      const lift = broke ? (16 * up) * (1 - fall) : 16 * up;
      const bounce = broke ? wobble(seg(t, snapT + 0.22, snapT + 0.9), 2.5, 5) : 0;
      tf(cup, CX, CY - lift - Math.abs(bounce) * 3, (broke ? 6 * bounce : -4 * up), 1 + 0.04 * bounce, 1 - 0.05 * bounce);
      csh.setAttribute('opacity', 1 - lift / 30);
      stubs.setAttribute('opacity', broke ? 1 : 0);
      const cp = seg(t, snapT, snapT + 0.4);
      tf(crack, HX + 6, HY - 16, 0, Math.max(0.001, hump(cp) * 1.2));
      crack.setAttribute('opacity', cp > 0 && cp < 1 ? 1 : 0);
      splash.forEach((d, i) => {
        const p = seg(t, snapT + 0.22, snapT + 0.7), dir = i < 2 ? -1 : 1;
        tf(d, CX + dir * (6 + 14 * p * (1 + (i % 2))), CY - 42 - 22 * hump(p) + 10 * p);
        d.setAttribute('opacity', p > 0 && p < 1 ? 1 : 0);
      });
    }
  };
}
