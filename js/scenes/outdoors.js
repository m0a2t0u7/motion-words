// outdoors：子どもたちが公園でボールを追って元気に遊ぶ（例文 The children love playing outdoors.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, run, parkBg, tree } from './run-after.js';

export const meta = { duration: 3.8, beats: [[0, '公園に出る'], [1.2, '走って遊ぶ'], [3.2, '楽しそう']] };

export function create(k) {
  const { el, pal } = k;
  const FY = parkBg(k, 238);
  el('circle', { cx: 340, cy: 54, r: 22, fill: '#FFE08A' });
  tree(k, 56, FY - 4, 0.85); tree(k, 372, FY - 6, 0.6);
  const ball = k.g({}); k.shadow(0, 8, 9, 2.4, ball);
  el('circle', { r: 8, fill: pal.coral }, ball);
  el('path', { d: 'M -8 0 H 8 M 0 -8 V 8', stroke: '#fff', 'stroke-width': 2 }, ball);
  const a = k.buddy({ scale: 0.68, y: FY + 6 });
  const c = k.buddy({ scale: 0.62, y: FY + 2, color: pal.coral, dark: pal.coralDark });
  const bx = (t) => lerp(124, 350, easeOut(seg(t, 0.3, 3.5)));
  const ax = (t) => bx(t) - 36, cx = (t) => bx(t) - 84;
  return {
    update(t) {
      const x = bx(t);
      k.tf(ball, x, FY - 2 - 5 * Math.abs(Math.sin(x * 0.08)), x * 6);
      const ra = run(ax, t, 88), rc = run(cx, t, 40);
      const jump = hump(seg(t, 3.2, 3.8));
      P(a, { ...ra, mood: 'grin', look: 0.7, blink: blinkAt(t), lift: ra.lift + 8 * jump });
      P(c, { ...rc, mood: 'open', look: 0.7, blink: blinkAt(t, 1), lift: rc.lift + 8 * jump });
    }
  };
}
