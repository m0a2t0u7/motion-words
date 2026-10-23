// certificate：先生（コーラル）が講座の修了証を手渡し、まめが受け取って掲げる（例文 She received a certificate after the course.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, hp } from './look-over.js';
import { grip } from './hand-over.js';

export const meta = { duration: 4.2, beats: [[0, '差し出す'], [1.6, '受け取る'], [3.2, '修了証']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  const t2 = k.buddy({ x: 300, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 140, y: FY, scale: S });
  const cert = g({});
  el('rect', { x: -26, y: -19, width: 52, height: 38, rx: 3, fill: '#FFF8E1', stroke: pal.yellowDark, 'stroke-width': 2.5 }, cert);
  el('rect', { x: -18, y: -12, width: 28, height: 4, rx: 2, fill: pal.sub }, cert);
  el('rect', { x: -18, y: -4, width: 22, height: 3, rx: 1.5, fill: pal.line }, cert);
  el('rect', { x: -18, y: 2, width: 22, height: 3, rx: 1.5, fill: pal.line }, cert);
  el('circle', { cx: 15, cy: 8, r: 7, fill: pal.red }, cert);
  el('path', { d: 'M 11 13 L 9 22 L 15 18 L 21 22 L 19 13 Z', fill: pal.coralDark }, cert);
  const sp = [0, 1, 2, 3].map(() => el('path', { d: 'M 0 -7 L 2 -2 L 7 0 L 2 2 L 0 7 L -2 2 L -7 0 L -2 -2 Z', fill: pal.yellow }));
  const gM = grip(k, pal.mint, pal.mintDark, S), gC = grip(k, pal.coral, pal.coralDark, S);
  return {
    update(t) {
      const ext = easeInOut(seg(t, 0.3, 1.1)), take = easeInOut(seg(t, 1.5, 2.3)), hold = easeInOut(seg(t, 2.8, 3.5));
      P(t2, { armR: lerp(20, 80, ext) * (1 - take) + 25 * take, armL: 8, lean: 3, mood: 'smile', blink: blinkAt(t, 1) });
      P(b, { armR: lerp(25, 78, easeInOut(seg(t, 1.2, 1.9))) + hold * 85 * 0 + hold * 40 * 0, armL: 8, lean: 3 - hold * 3, mood: t > 2.6 ? 'grin' : 'smile', blink: blinkAt(t), look: 4 });
      const hc = hp(t2, S, 'R'), hm = hp(b, S, 'R');
      gC(hc);
      gM(hm);
      // 渡す間は先生の手、受け取ったらまめの手の位置
      const cx = lerp(hc.x - 18, hm.x + 18, take), cy = lerp(hc.y - 6, hm.y - 10, take);
      tf(cert, cx, cy, lerp(0, -4, take), lerp(1, 1.15, hold), lerp(1, 1.15, hold));
      sp.forEach((s, i) => {
        const p = seg(t, 3.0 + i * 0.12, 3.8 + i * 0.12);
        const a = i * 1.6 + 0.4;
        tf(s, cx + Math.cos(a) * 44, cy + Math.sin(a) * 30, 0, hump(p) * 0.9 + 0.001, hump(p) * 0.9 + 0.001);
      });
    }
  };
}
