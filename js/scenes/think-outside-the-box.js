// think outside the box：枠（四角いチョーク線）の中では高い所のごほうびに届かない。枠の外にある踏み台を持ってきて、届く（We need to think outside the box to solve this.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, hump } from '../ease.js';

export const meta = { duration: 4.6, beats: [[0, '枠の中では届かない'], [1.5, '枠の外へ'], [3.9, '踏み台で届く']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236, mood: 'indoor' });
  // 壁のフックにぶら下がるごほうび（星）
  el('rect', { x: 116, y: 0, width: 4, height: 100, fill: pal.sub });
  const prize = g({});
  tf(prize, 118, 114);
  el('path', { d: 'M 0 -15 L 5 -5 L 16 -5 L 7 3 L 10 14 L 0 8 L -10 14 L -7 3 L -16 -5 L -5 -5 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, prize);
  // 床の四角い枠
  el('polygon', { points: '56,244 196,244 214,284 38,284', fill: 'rgba(95,205,184,0.10)', stroke: pal.sub, 'stroke-width': 2.4, 'stroke-dasharray': '7 5', 'stroke-linejoin': 'round' });
  // 踏み台
  const st = g({});
  k.shadow(0, 0, 28, 5, st);
  el('rect', { x: -24, y: -38, width: 48, height: 38, rx: 4, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 3 }, st);
  el('rect', { x: -24, y: -38, width: 48, height: 8, rx: 3, fill: pal.woodDark }, st);
  const me = k.buddy({ x: 118, y: 252 });
  const bulb = g({});
  el('circle', { r: 11, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2.4 }, bulb);
  el('rect', { x: -5, y: 10, width: 10, height: 6, rx: 2, fill: pal.sub }, bulb);
  for (let i = 0; i < 5; i++) { const a = (-90 + (i - 2) * 40) * Math.PI / 180; el('line', { x1: Math.cos(a) * 16, y1: Math.sin(a) * 16, x2: Math.cos(a) * 22, y2: Math.sin(a) * 22, stroke: pal.yellowDark, 'stroke-width': 3, 'stroke-linecap': 'round' }, bulb); }
  return {
    update(t) {
      let x = 118, y = 252, face = 1, armR = 8, armL = 8, walk = 0, lift = 0, sq = 1, lean = 0, look = 0.3, mood = 'smile';
      let sx = 318, sy = 252, sr = 0;
      const jump = (a, b) => hump(seg(t, a, b));
      if (t < 1.2) { // 枠の中で2回ジャンプ（届かない）
        lift = 26 * jump(0.15, 0.6) + 24 * jump(0.65, 1.1); armR = armL = 150 * (jump(0.1, 0.65) > 0 || jump(0.6, 1.15) > 0 ? 1 : 0.3);
        sq = 1 - 0.07 * (hump(seg(t, 0.0, 0.15)) + hump(seg(t, 0.6, 0.68))); look = 0; mood = t > 0.7 ? 'sad' : 'open';
        armR = armL = lerp(8, 160, seg(t, 0.05, 0.3)) * (lift > 1 ? 1 : 0.6);
      } else if (t < 1.8) { // ひらめき（電球）
        mood = 'open'; look = 0.9; armR = 70 * easeOut(seg(t, 1.3, 1.6)); armL = 8;
      } else if (t < 2.7) { // 枠の外へ歩く
        const p = easeInOut(seg(t, 1.8, 2.7)); x = lerp(118, 262, p); walk = p * 18; armR = 8 + Math.sin(walk) * 16; armL = 8 - Math.sin(walk) * 16; lean = 3; mood = 'smile';
      } else if (t < 3.4) { // 踏み台を持ち上げ、向きを変えて戻る
        const p = easeInOut(seg(t, 3.0, 3.4)) ;
        x = lerp(262, 238, easeInOut(seg(t, 3.0, 3.8))) ; face = t < 2.95 ? 1 : -1;
        const gp = easeOut(seg(t, 2.7, 3.0)); armR = lerp(8, 82, gp); walk = t > 3.0 ? (t - 3.0) * 12 : 0; lean = 3; sq = 1 - 0.04 * hump(seg(t, 2.7, 3.0));
        const hx = x + face * 52; sx = t < 2.95 ? 300 : hx; sy = 252 - 14 * gp * (t > 2.9 ? 1 : 0.0) - (t > 2.95 ? 0 : 0);
        sx = t < 2.7 ? 318 : t < 2.95 ? lerp(318, 262 + 52 * 0 + 40, seg(t, 2.7, 2.95)) : hx; sy = 252 - 20 * gp;
      } else if (t < 3.9) { // 戻って踏み台を置く
        const wp = easeInOut(seg(t, 3.4, 3.9)); x = lerp(238 - 0.0, 158, wp) ; face = -1; armR = 82 * (1 - easeOut(seg(t, 3.7, 3.9))) + 8 * easeOut(seg(t, 3.7, 3.9));
        walk = wp > 0 && wp < 1 ? wp * 14 : 0; lean = 3 * (1 - wp);
        sx = x - 52 * (1 - seg(t, 3.7, 3.9)) - 38 * seg(t, 3.7, 3.9); sy = 252 - 20 * (1 - seg(t, 3.7, 3.9));
      } else { // 踏み台に飛び乗って手を伸ばす
        const p = easeInOut(seg(t, 3.9, 4.35)); sx = 120; sy = 252; face = -1;
        x = lerp(158, 120, p); y = lerp(252, 214, p) ; lift = 22 * hump(seg(t, 3.9, 4.35)); armR = armL = 170 * easeOut(seg(t, 4.1, 4.5)) + 8; mood = 'grin'; look = 0; sq = 1 - 0.06 * hump(seg(t, 4.25, 4.45)) ; lean = 0;
      }
      tf(st, sx, sy);
      me.pose({ x, y, facing: face, armR, armL, walk, lift, squash: sq, lean, look, mood, blink: 0 });
      const bp = backOut(seg(t, 1.25, 1.55)) * (1 - seg(t, 2.4, 2.6));
      tf(bulb, 128, 126, 0, Math.max(0, bp), Math.max(0, bp));
      tf(prize, 118, 114 + 2 * Math.sin(t * 3), Math.sin(t * 3) * 3);
    }
  };
}
