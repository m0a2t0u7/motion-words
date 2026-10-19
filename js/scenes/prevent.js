// prevent：ヘルメットをかぶってスケボーで転ぶが、ヘルメットが頭を守ってけがをしない（例文 Wearing a helmet can prevent injuries.）
import { seg, lerp, easeInOut, easeOut, easeIn, wobble, hump, clamp } from '../ease.js';
import { P, blinkAt, parkBg, tree } from './run-after.js';

// ヘルメット（まめの体に付ける。体座標、頭頂 y=-80）
export function helmet(k, b, col, dark) {
  const g = k.g({}, b.body);
  k.el('path', { d: 'M -33 -62 Q -34 -96 0 -97 Q 34 -96 33 -62 Q 18 -68 0 -68 Q -18 -68 -33 -62 Z', fill: col, stroke: dark, 'stroke-width': 2 }, g);
  k.el('path', { d: 'M -8 -95 L -6 -72 M 8 -95 L 6 -72', stroke: dark, 'stroke-width': 2.4, opacity: 0.6 }, g);
  k.el('ellipse', { cx: -14, cy: -86, rx: 7, ry: 4, fill: '#fff', opacity: 0.35 }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, 'ヘルメットをかぶる'], [1.6, '転ぶ！'], [3.2, 'けがなし']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = parkBg(k, 236);
  tree(k, 40, FY, 0.8); tree(k, 370, FY, 0.7);
  // 石（動かない）
  const SX = 300;
  k.shadow(SX, FY + 1, 14, 3);
  el('path', { d: `M ${SX - 12} ${FY} Q ${SX - 12} ${FY - 13} ${SX} ${FY - 14} Q ${SX + 13} ${FY - 12} ${SX + 12} ${FY} Z`, fill: '#9AA4B4' });
  const S = 0.9;
  const board = g({});
  const bsh = k.shadow(0, 2, 34, 4, board);
  el('rect', { x: -34, y: -11, width: 68, height: 6, rx: 3, fill: pal.violet }, board);
  [-22, 22].forEach((x) => el('circle', { cx: x, cy: -3, r: 4, fill: pal.ink }, board));
  const me = k.buddy({ x: 70, y: FY, scale: S });
  const hm = helmet(k, me, pal.red, '#C94B40');
  const bonk = g({});
  el('path', { d: 'M 0 -16 L 4 -5 L 16 -6 L 7 2 L 12 13 L 1 7 L -8 15 L -6 3 L -17 -2 L -5 -6 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, bonk);
  const ok = g({}); el('circle', { r: 13, fill: pal.green }, ok);
  el('path', { d: 'M -6 0 L -2 5 L 7 -5', stroke: '#fff', 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ok);
  const T0 = 1.25, T1 = 2.35;
  // スケボーの位置：加速 → 一定 → 石で止まる
  const bxf = (t) => t < T0 ? 110 : t < T1 ? lerp(110, SX - 46, (seg(t, T0, T1) ** 1.5)) : SX - 46 - 8 * easeOut(seg(t, T1, T1 + 0.4));
  return {
    update(t) {
      const put = easeInOut(seg(t, 0.2, 0.9));
      tf(hm, 0, -34 * (1 - put));
      const arms = t < 1.0 ? lerp(165, 165, put) : lerp(165, 8, easeOut(seg(t, 1.0, 1.25)));
      const bx = bxf(t);
      tf(board, bx, FY);
      let x = 70, lift = 0, lean = 0, armL = arms, armR = arms, mood = 'smile', sq = 1;
      if (t >= 1.0 && t < T1) { const on = easeInOut(seg(t, 1.0, T0)); x = lerp(70, bx, on); lift = 9 * on + 10 * hump(seg(t, 1.0, T0)); armL = lerp(armL, 40, seg(t, T0, T0 + 0.3)); armR = armL; lean = 4 * seg(t, T0, T1); }
      const fall = easeIn(seg(t, T1, T1 + 0.4)), up = easeInOut(seg(t, 3.0, 3.6));
      if (t >= T1) {
        x = SX - 46 + 46 * easeOut(seg(t, T1, T1 + 0.45));
        lean = lerp(4, 84, fall) * (1 - up); lift = lerp(9, 0, fall) + 14 * hump(seg(t, T1, T1 + 0.3));
        armL = armR = lerp(40, 120, fall) * (1 - up) + 8 * up; mood = t < 3.0 ? 'open' : 'grin';
        sq = 1 - 0.06 * wobble(seg(t, T1 + 0.4, T1 + 0.9), 2, 5);
      }
      if (t > 3.6) armR = lerp(8, 150, easeOut(seg(t, 3.6, 3.9)));
      P(me, { x, lift, lean, armL, armR, mood, squash: sq, look: 0.5, blink: t > T1 + 0.4 && t < 3.0 ? 0.8 : blinkAt(t) });
      // 頭が地面に当たる瞬間
      const hit = seg(t, T1 + 0.38, T1 + 0.8);
      const hx = x + Math.sin(lean * Math.PI / 180) * 84 * S;
      tf(bonk, hx + 6, FY - 20, 0, Math.max(0.001, hump(hit)));
      bonk.setAttribute('opacity', hit > 0 && hit < 1 ? 1 : 0);
      ok.setAttribute('opacity', t > 3.5 ? 1 : 0); tf(ok, x + 44, FY - 116 + 6 * (1 - easeOut(seg(t, 3.5, 3.9))), 0, Math.max(0.001, easeOut(seg(t, 3.5, 3.9))));
    }
  };
}
