// tear up：古い手紙を両手で引き裂き、さらに何度も裂いて細かい紙くずにする（例文 She tore up the old letter.）
import { seg, lerp, easeInOut, easeIn, easeOut, wobble, clamp } from '../ease.js';
import { reach } from './dig.js';

export const meta = { duration: 4.0, beats: [[0, '古い手紙'], [1.4, '引き裂く'], [3.0, '細かくなった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 290, y: 60, width: 80, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  // ごみ箱
  el('path', { d: 'M 284 196 L 340 196 L 334 240 L 290 240 Z', fill: '#B7C3D3' });
  el('rect', { x: 280, y: 192, width: 64, height: 6, rx: 3, fill: '#9AA8BC' });
  k.shadow(312, 241, 32, 4);
  const B = k.buddy({ x: 170, y: FY, scale: 1.0 });
  const cx = 170, cy = FY - 50;
  // 手紙の左右の半分
  const half = (s) => { const n = g({}); el('path', { d: s < 0 ? 'M -26 -18 L 0 -18 L -3 -8 L 2 2 L -2 10 L 0 18 L -26 18 Z' : 'M 0 -18 L 26 -18 L 26 18 L 0 18 L -2 10 L 2 2 L -3 -8 Z', fill: '#FBF5E6', stroke: '#D9CFB5', 'stroke-width': 1.2 }, n); [-8, 0, 8].forEach((y) => el('line', { x1: s < 0 ? -20 : 4, x2: s < 0 ? -6 : 20, y1: y, y2: y, stroke: pal.sub, 'stroke-width': 1.4, opacity: 0.6 }, n)); return n; };
  const L = half(-1), R = half(1);
  const bits = Array.from({ length: 12 }, (_, i) => el('rect', { x: -4, y: -3, width: 8, height: 6, fill: '#FBF5E6', stroke: '#D9CFB5', 'stroke-width': 0.8 }));
  return {
    update(t) {
      const r1 = easeOut(seg(t, 1.1, 1.4));               // 1回目
      const again = [1.8, 2.2, 2.6].map((s) => Math.sin(seg(t, s, s + 0.3) * Math.PI));
      const jig = again.reduce((a, b) => a + b, 0);
      const shred = t > 1.8;
      const gap = r1 * 22 * (shred ? 1 - seg(t, 1.6, 1.8) : 1) + jig * 10;
      const hold = 1 - seg(t, 3.0, 3.3);
      tf(L, cx - gap / 2, cy + r1 * 4, -r1 * 14, shred ? lerp(1, 0.4, seg(t, 1.8, 3.0)) : 1);
      tf(R, cx + gap / 2, cy + r1 * 4, r1 * 14, shred ? lerp(1, 0.4, seg(t, 1.8, 3.0)) : 1);
      L.setAttribute('opacity', hold); R.setAttribute('opacity', hold);
      const tug = wobble(seg(t, 0.8, 1.1), 3, 2) * 2;
      const hl = { x: cx - 24 - gap / 2, y: cy + 4 }, hr = { x: cx + 24 + gap / 2, y: cy + 4 };
      B.pose({ armL: hold > 0 ? reach(B, 1, 'L', hl.x + tug, hl.y) : lerp(60, 12, seg(t, 3.0, 3.3)), armR: hold > 0 ? reach(B, 1, 'R', hr.x - tug, hr.y) : lerp(60, 12, seg(t, 3.0, 3.3)), mood: t > 1.1 ? 'flat' : 'sad', look: 0, lean: 0, squash: 1 - 0.03 * jig });
      // 紙くずが舞い落ちて床へ
      bits.forEach((b, i) => {
        const s = 1.9 + (i % 6) * 0.18 + (i > 5 ? 0.6 : 0), u = seg(t, s, s + 1.0);
        const x = cx + (i % 2 ? 1 : -1) * (10 + i * 4) * easeOut(u) + Math.sin(u * 6 + i) * 6, y = lerp(cy, FY - 3 - (i % 3) * 2, easeIn(u));
        tf(b, x, y, u * (i % 2 ? 260 : -200) * (1 - seg(u, 0.95, 1)));
        b.setAttribute('opacity', u > 0 ? 1 : 0);
      });
    }
  };
}
