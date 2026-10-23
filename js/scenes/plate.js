// plate：「お皿をテーブルに並べてね」と頼まれ、重ねた皿を1枚ずつ食卓に置いていく（例文 Put the plates on the table, please.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { arms, dinner, plateP, iconSay, P, blinkAt, C } from './jam.js';
import { homeBg } from './furniture.js';
import { gait } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '並べてね'], [1.0, '1枚ずつ置く'], [3.6, '並んだ']] };

export function create(k) {
  const S = 1.25;
  const FY = homeBg(k, { winX: 150, winW: 90 });
  const mom = k.buddy({ x: 348, y: FY, scale: 1.15, facing: -1, ...C(k, 'coral') });
  const b = k.buddy({ x: 60, y: FY, scale: S });
  dinner(k, 90, 300, 200);
  const spots = [136, 200, 264];
  const stack = [0, 1, 2].map(() => plateP(k, undefined, 22));
  const A = arms(k, b, S, { back: ['L'] });
  const ask = iconSay(k, 74, 34, 1, (g) => { k.text(0, 1, 'Please!', { 'font-size': 14 }, g); });
  // 立ち位置（各皿の左）：歩く → 止まって置く
  const stops = [[0, 60], [0.9, 108], [1.6, 108], [2.0, 172], [2.6, 172], [3.0, 236]];
  const xf = (t) => { for (let i = 1; i < stops.length; i++) if (t <= stops[i][0]) { const [a, x0] = stops[i - 1], [c, x1] = stops[i]; return lerp(x0, x1, easeInOut(seg(t, a, c))); } return 236; };
  const putT = [1.1, 2.1, 3.1];
  return {
    update(t) {
      const g = gait(xf, t, 60);
      P(b, { x: g.x, walk: g.walk, lean: g.lean + 6, look: 0.5, blink: blinkAt(t), mood: t > 3.6 ? 'grin' : 'smile' });
      P(mom, { look: 0.5, armL: 20, armR: t < 1 ? 50 : 10, blink: blinkAt(t, 1), mood: t > 3.6 ? 'grin' : t < 1 ? 'open' : 'smile', facing: -1 });
      // 左手：皿の束を体の前で支える
      const sx = g.x + 50, sy = 188;
      A.to('L', sx - 8, sy + 6);
      let left = 3;
      stack.forEach((p, i) => {
        const tp = putT[i];
        // i 番目は上から i 枚目（一番上から置く）
        const q = seg(t, tp - 0.15, tp + 0.35);
        if (t >= tp + 0.35) { k.tf(p, spots[i], 202); left--; return; }
        const yStack = sy - (2 - i) * 6;
        if (t < tp - 0.15) { k.tf(p, sx, yStack); return; }
        const e = easeInOut(q);
        k.tf(p, lerp(sx, spots[i], e), lerp(yStack, 202, e) - 10 * hump(q));
      });
      // 右手：置いている皿の縁を持つ（置いていない時は束に添える）
      const cur = putT.findIndex((tp) => t >= tp - 0.15 && t < tp + 0.5);
      if (cur >= 0) {
        const tp = putT[cur], e = easeInOut(seg(t, tp - 0.15, tp + 0.35)), back = easeInOut(seg(t, tp + 0.35, tp + 0.5));
        const px = lerp(sx, spots[cur], e), py = lerp(sy - (2 - cur) * 6, 202, e) - 10 * hump(seg(t, tp - 0.15, tp + 0.35));
        A.to('R', lerp(px + 18, sx + 16, back), lerp(py - 3, sy, back));
      } else A.to('R', left > 0 ? sx + 18 : g.x + 30, left > 0 ? sy - 2 : 196);
      ask.show(seg(t, 0, 0.3) * (1 - seg(t, 1.2, 1.4)), 318, 96);
    }
  };
}
