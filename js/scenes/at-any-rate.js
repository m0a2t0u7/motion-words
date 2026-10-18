// at any rate：どこから塗るかで2人の意見が割れたまま。まめが「とにかく始めよう」とローラーを持ち、壁を塗り始める（例文 At any rate, let's start now.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, held, reach, say, cue } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '意見が割れる'], [1.9, 'とにかく'], [3.0, '今すぐ始める']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  // 塗る前の壁
  el('rect', { x: 236, y: 40, width: 150, height: FY - 46, fill: '#E9E4DA', stroke: '#D9D2C4', 'stroke-width': 2 });
  const paint = el('rect', { x: 246, y: FY - 10, width: 34, height: 0, fill: pal.mint });
  // 塗料トレイ（床）
  el('path', { d: `M 150 ${FY} L 156 ${FY - 10} L 196 ${FY - 10} L 202 ${FY} Z`, fill: '#B8C2CF' });
  el('rect', { x: 158, y: FY - 10, width: 36, height: 4, fill: pal.mint });
  const roller = g({});
  el('rect', { x: -1.8, y: 0, width: 3.6, height: 22, fill: pal.sub }, roller);
  el('rect', { x: -14, y: 22, width: 28, height: 10, rx: 4, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 1.5 }, roller);
  const A = k.buddy({ x: 130, y: FY, scale: 0.9 });
  const C = k.buddy({ x: 60, y: FY, scale: 0.9, color: pal.coral, dark: pal.coralDark });
  const arrow = (parent, d) => el('path', { d: d > 0 ? 'M -12 0 L 10 0 M 3 -7 L 10 0 L 3 7' : 'M 12 0 L -10 0 M -3 -7 L -10 0 L -3 7', stroke: pal.ink, 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, parent);
  const bc = say(k, 44, 30, 1), ba = say(k, 44, 30, -1);
  arrow(bc.g, -1); arrow(ba.g, 1);
  const go = cue(k, "Let's start!", 104, 30, -1, 14);
  const ax = (t) => lerp(130, 206, easeInOut(seg(t, 2.6, 3.2)));
  return {
    update(t) {
      const argue = t < 1.9;
      const tC = argue && Math.sin(t * 5) > 0, tA = argue && !tC;
      bc.show(argue ? seg(t, 0.15, 0.35) * (tC ? 1 : 0.0) : 0, 92, 108);
      ba.show(argue ? seg(t, 0.15, 0.35) * (tA ? 1 : 0.0) : 0, 158, 108);
      P(C, { facing: t < 2.6 ? 1 : 1, look: 0.6, mood: tC ? 'open' : t > 3.0 ? 'smile' : 'flat', armR: argue ? 40 + 40 * (tC ? 1 : 0) : 8, lean: tC ? 5 : 0 });
      // まめ：首をふる→両手で「まあいいや」→ローラーで塗りはじめる
      const shrug = hump(seg(t, 1.9, 2.5));
      const x = ax(t), walking = t > 2.6 && t < 3.2;
      const roll = seg(t, 3.25, 4.4), ry = 0.5 - 0.5 * Math.cos(roll * Math.PI * 4);
      const pick = easeOut(seg(t, 2.35, 2.6));
      let armR = argue ? 30 + 20 * (tA ? 1 : 0) : lerp(8 + 130 * shrug, 40, pick);
      P(A, { x, walk: (x - 130) * 0.107, facing: t < 2.0 ? -1 : 1, look: 0.6, mood: tA ? 'open' : t > 2.2 && t < 2.6 ? 'open' : t > 2.6 ? 'grin' : 'flat', armL: 8 + 130 * shrug, armR, lean: walking ? 3 : 0 });
      go.show(seg(t, 2.0, 2.25) * (1 - seg(t, 3.1, 3.3)), 160, 104);
      if (t > 3.2) {
        const tx = 263, ty = lerp(FY - 40, 100, ry);
        A.pose({ armR: reach(A, 0.9, 'R', tx - 14, ty + 4), lift: 6 * ry });
      }
      const h = held(k, A, 0.9, roller, 'R', 0, 30);
      if (t > 3.2) tf(roller, h.x, h.y, -90, 0.9); else if (t < 2.5) tf(roller, 176, FY - 10, -70, 0.9); else tf(roller, h.x, h.y, -60, 0.9);
      // ローラーの通ったところが塗れる
      const topY = lerp(FY - 30, 98, Math.min(1, roll * 2.2));
      k.set(paint, { y: t > 3.25 ? topY : FY - 10, height: t > 3.25 ? FY - 30 - topY + 20 : 0 });
    }
  };
}
