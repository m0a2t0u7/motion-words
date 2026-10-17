// keep an eye on：子どもたちが動き回るのを、まめがずっと目で追って見守る（例文 Please keep an eye on the kids.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '見守りはじめ'], [1.6, '目で追う'], [3.4, '見守り続ける']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 232, mood: 'outdoor' });
  el('ellipse', { cx: 80, cy: 60, rx: 34, ry: 12, fill: '#fff', opacity: 0.8 });
  el('ellipse', { cx: 320, cy: 44, rx: 30, ry: 10, fill: '#fff', opacity: 0.8 });
  const ad = k.buddy({ x: 70, y: FY + 10, scale: 1.1 });
  const kids = [
    k.buddy({ x: 200, y: FY + 14, scale: 0.55, color: pal.coral, dark: pal.coralDark }),
    k.buddy({ x: 280, y: FY + 14, scale: 0.55, color: pal.yellow, dark: pal.yellowDark })
  ];
  // ボール
  const ball = g({});
  el('circle', { r: 9, fill: pal.blue }, ball);
  el('path', { d: 'M -9 0 Q 0 -5 9 0', fill: 'none', stroke: '#fff', 'stroke-width': 2 }, ball);
  // 目のマーク（見守りの印）
  const eye = g({});
  el('path', { d: 'M -17 0 Q 0 -13 17 0 Q 0 13 -17 0 Z', fill: '#fff', stroke: pal.blueDark, 'stroke-width': 3 }, eye);
  const pupil = el('circle', { r: 5.5, fill: pal.blueDark }, eye);
  const gaze = el('line', { stroke: pal.blueDark, 'stroke-width': 2.5, 'stroke-dasharray': '4 6', 'stroke-linecap': 'round', opacity: 0.7 });
  return {
    update(t) {
      const s = t * 1.7;
      const k1x = 215 + 70 * Math.sin(s), k2x = 280 + 70 * Math.sin(s * 1.3 + 2);
      const jump1 = Math.abs(Math.sin(s * 3)) * 16, jump2 = Math.abs(Math.sin(s * 3.9 + 1)) * 16;
      kids[0].pose({ x: k1x, lift: jump1, walk: t * 10, facing: Math.cos(s) >= 0 ? 1 : -1, mood: 'grin', armR: 120, armL: 120 });
      kids[1].pose({ x: k2x, lift: jump2, walk: t * 8, facing: Math.cos(s * 1.3 + 2) >= 0 ? 1 : -1, mood: 'smile', armR: 90, armL: 40 });
      // 見守る側：目線がこどもを追う
      const focus = (k1x + k2x) / 2;
      const lk = Math.max(-1, Math.min(1, (focus - 100) / 120));
      const startUp = easeOut(seg(t, 0.0, 0.7));
      ad.pose({ look: lk, lean: lk * 3, mood: 'smile', armR: 8, armL: 8, blink: t % 2.6 > 2.45 ? 1 : 0, lift: 0 });
      // 目マーク
      const ep = backOut(seg(t, 0.4, 1.0), 2);
      tf(eye, 104 + lk * 8, 110, 0, ep, ep);
      k.set(pupil, { cx: lk * 7, cy: 0 });
      k.set(gaze, { x1: 124 + lk * 8, y1: 112, x2: focus - 8, y2: FY - 22 });
      gaze.setAttribute('opacity', t < 0.8 ? 0 : 0.7);
      // ボールが2人の間を行き来
      tf(ball, (k1x + k2x) / 2, FY - 6 - 22 * Math.abs(Math.sin(s * 2)) + 10, 0);
    }
  };
}
