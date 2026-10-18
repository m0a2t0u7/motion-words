// take to：子犬がやって来ると、子どもたちはすぐに駆け寄ってなで、ハートが浮かぶ。子犬もしっぽを振る（例文 The children took to the puppy right away.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { gait, hp } from './dig.js';
import { heart } from './weigh.js';
import { puppy } from './get-on-with.js';

export const meta = { duration: 4.0, beats: [[0, '子犬が来た'], [1.2, 'すぐ駆け寄る'], [2.8, '大好きになった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('rect', { x: 0, y: 236, width: 400, height: 64, fill: '#DDF0DA' });
  el('rect', { x: 0, y: 236, width: 400, height: 3, fill: '#C7E5C3' });
  [[40, 0.9], [360, 1]].forEach(([x, s]) => { const tr = g({}); tf(tr, x, FY, 0, s); el('rect', { x: -5, y: -60, width: 10, height: 60, rx: 4, fill: pal.woodDark }, tr); el('circle', { cx: 0, cy: -80, r: 30, fill: '#7FD3A0' }, tr); });
  const dog = puppy(k);
  const kids = [k.buddy({ x: 60, y: FY + 6, scale: 0.62 }), k.buddy({ x: 20, y: FY + 10, scale: 0.6, color: pal.coral, dark: pal.coralDark })];
  const hearts = [0, 1, 2].map(() => { const h = g({}); heart(k, h); return h; });
  const xd = (t) => lerp(440, 250, easeOut(seg(t, 0.0, 1.0)));
  const xk = [(t) => lerp(60, 202, easeInOut(seg(t, 1.0, 1.6))), (t) => lerp(20, 300, easeInOut(seg(t, 1.1, 1.9)))];
  return {
    update(t) {
      const dx = xd(t), dm = t < 1.0;
      dog.pose({ x: dx, y: FY + 8, facing: t < 1.6 ? -1 : -1, hop: dm ? Math.abs(Math.sin(t * 12)) * 4 : hump(seg(t, 2.4, 2.7)) * 6, wag: t * (t > 1.6 ? 22 : 10), look: t > 1.8 ? -2 : 0 });
      kids.forEach((c, i) => {
        const p = gait(xk[i], t, i ? 20 : 60, 22, 0.16);
        const see = easeOut(seg(t, 0.7, 0.95));
        const pet = t > 1.9 ? Math.sin(t * 10 + i) * 14 : 0;
        const face = i === 1 && t > 1.85 ? -1 : 1;
        c.pose({ x: p.x, y: FY + (i ? 10 : 6), walk: p.walk, facing: face, lean: p.lean + (t > 1.9 ? 12 : 0), look: 0.6,
          armR: t > 1.9 ? 70 + pet : t > 0.9 ? 60 : p.armR, armL: t > 0.9 && t < 1.9 ? 60 : p.armL, mood: see > 0.5 ? 'grin' : 'smile',
          lift: hump(seg(t, 0.75, 1.0)) * 8, squash: 1 - 0.05 * Math.abs(Math.sin(t * 5)) * (t > 1.9 ? 1 : 0) });
      });
      hearts.forEach((h, i) => { const q = seg(t, 2.1 + i * 0.35, 3.3 + i * 0.35); tf(h, 230 + i * 30, 170 - q * 40, Math.sin(q * 6) * 10, easeOut(q) * 0.9); h.setAttribute('opacity', q > 0 ? 1 - seg(q, 0.75, 1) : 0); });
    }
  };
}
