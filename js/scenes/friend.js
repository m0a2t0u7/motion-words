// friend：親友と駆け寄ってハイタッチし、肩を組んで並ぶ（例文 She is my best friend.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { arms, keys, heartP, pops, P, blinkAt, C } from './jam.js';
import { parkBg, tree } from './run-after.js';
import { gait } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '駆け寄る'], [1.4, 'ハイタッチ'], [2.6, 'いちばんの友達']] };

export function create(k) {
  const { el, pal } = k, FY = 236;
  k.backdrop({ floorY: FY, mood: 'outdoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#CDE8C9' });
  tree(k, 50, FY, 1.1); tree(k, 360, FY, 0.9);
  const me = k.buddy({ x: 60, y: FY, scale: 1.1 });
  const fr = k.buddy({ x: 340, y: FY, scale: 1.05, facing: -1, ...C(k, 'coral') });
  const A = arms(k, me, 1.1, { back: ['L'] }), B = arms(k, fr, 1.05, { col: pal.coral, dark: pal.coralDark });
  const xm = keys([[0, 60], [1.3, 160], [2.4, 160], [2.8, 172]]), xf = keys([[0, 340], [1.3, 244], [2.4, 244], [2.8, 236]]);
  const hs = [0, 1, 2].map(() => heartP(k));
  const star = el('path', { d: 'M 0 -12 L 3 -4 L 12 -4 L 5 2 L 8 11 L 0 6 L -8 11 L -5 2 L -12 -4 L -3 -4 Z', fill: pal.yellow });
  return {
    update(t) {
      const g1 = gait(xm, t, 60), g2 = gait(xf, t, 340);
      const five = hump(seg(t, 1.3, 1.9));
      const hugP = easeInOut(seg(t, 2.4, 2.9));
      P(me, { x: g1.x, walk: g1.walk, lean: g1.lean, look: 0.6, blink: blinkAt(t), mood: 'grin', lift: five * 6 });
      P(fr, { x: g2.x, walk: g2.walk, lean: g2.lean, facing: hugP > 0.5 ? 1 : -1, look: hugP > 0.5 ? -0.6 : 0.6, blink: blinkAt(t, 1), mood: 'grin', lift: five * 6 });
      const mid = (g1.x + g2.x) / 2;
      if (t < 2.4) { A.to('R', lerp(g1.x + 34, mid - 2, five), lerp(200, 110, five)); B.to('R', lerp(g2.x - 34, mid + 2, five), lerp(200, 110, five)); A.to('L', g1.x - 20, 204); B.to('L', g2.x + 20, 204); }
      else {
        // 肩を組む：互いの外側の肩へ手を回す
        A.to('R', lerp(g1.x + 34, g2.x + 10, hugP), lerp(200, FY - 74, hugP)); A.to('L', g1.x - 20, 204);
        B.to('R', lerp(g2.x + 20, g2.x + 34, hugP), lerp(204, 140 - 10 * Math.sin(t * 9) * (t > 3), hugP));
        B.to('L', lerp(g2.x - 20, g1.x - 6, hugP), lerp(204, FY - 74, hugP));
      }
      k.tf(star, mid, 96, t * 60, pops(seg(t, 1.5, 1.8)) * (1 - seg(t, 2.2, 2.4)) + 0.001);
      hs.forEach((h, i) => { const q = seg(t, 3.0 + i * 0.2, 3.6 + i * 0.2); k.tf(h, mid - 24 + i * 24, 108 - 14 * q - (i % 2) * 8, 0, pops(q)); });
    }
  };
}
