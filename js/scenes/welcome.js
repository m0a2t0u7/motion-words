// welcome：訪ねてきた二人を、迎える二人が両腕を広げ満面の笑みで迎える（例文 They welcomed us with a big smile.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { gait } from './dig.js';
import { heart } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '訪ねてくる'], [1.6, '両腕を広げる'], [3.2, '満面の笑み']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 旗の飾りとドア
  el('path', { d: 'M 20 44 Q 200 78 380 44', stroke: pal.sub, 'stroke-width': 2, fill: 'none' });
  [0.12, 0.26, 0.4, 0.54, 0.68, 0.82].forEach((u, i) => {
    const x = 20 + 360 * u, y = 44 + 2 * 34 * u * (1 - u) * 1.9 * 0.5 + 0;
    el('path', { d: `M ${x - 9} ${y - 1} L ${x + 9} ${y - 1} L ${x} ${y + 18} Z`, fill: [pal.coral, pal.yellow, pal.blue, pal.mint, pal.violet, pal.coral][i] });
  });
  el('rect', { x: 296, y: 110, width: 70, height: 126, rx: 4, fill: '#CFE0F0' });
  el('rect', { x: 302, y: 116, width: 58, height: 120, rx: 3, fill: '#FFE7B8' });
  el('ellipse', { cx: 200, cy: 262, rx: 170, ry: 14, fill: '#F1D9CF' });
  const guests = [k.buddy({ x: -30, y: FY, facing: 1 }), k.buddy({ x: -80, y: FY, facing: 1, color: pal.blue, dark: pal.blueDark, scale: 0.85 })];
  const hosts = [k.buddy({ x: 270, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark }), k.buddy({ x: 330, y: FY, facing: -1, color: pal.violet, dark: '#7E63DB' })];
  const P = (b, o) => b.pose({ armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'smile', blink: 0, lift: 0, ...o });
  const hs = [0, 1, 2, 3].map(() => heart(k, k.root));
  const gx = [(t) => lerp(-30, 130, easeInOut(seg(t, 0.2, 2.2))), (t) => lerp(-80, 78, easeInOut(seg(t, 0.2, 2.2)))];
  const hx = [(t) => lerp(270, 205, easeInOut(seg(t, 1.5, 2.6))), (t) => lerp(330, 270, easeInOut(seg(t, 1.6, 2.7)))];
  return {
    update(t) {
      const op = easeOut(seg(t, 1.5, 2.1));
      guests.forEach((b, i) => {
        const p = gait(gx[i], t, i ? -80 : -30, 14, 0.11);
        P(b, { x: p.x, walk: p.walk, armL: p.armL, armR: p.armR, lean: p.lean, look: 0.5, mood: t > 2.6 ? 'grin' : 'smile' });
      });
      hosts.forEach((b, i) => {
        const p = gait(hx[i], t, i ? 330 : 270, 14, 0.11);
        const bob = Math.sin(t * 5 + i) * 4 * op;
        P(b, { x: p.x, walk: p.walk, armL: lerp(p.armL, 110, op) + bob, armR: lerp(p.armR, 110, op) - bob, lean: lerp(p.lean, 4, op), look: -0.4, mood: t > 1.4 ? 'grin' : 'smile', squash: 1 + 0.02 * Math.sin(t * 6 + i) * op });
      });
      hs.forEach((h, i) => { const q = seg(t, 2.8 + i * 0.2, 3.9 + i * 0.1); tf(h, 150 + i * 28, 130 - 26 * q - (i % 2) * 8, 0, hump(q) * 1.1 + 0.001); });
    }
  };
}
