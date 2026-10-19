// tire：車で道を走っていると、後ろのタイヤがパンクしてぺしゃんこになり、止まってしまう（例文 I got a flat tire on the way.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { auto, blinkAt, tree, mark, popIn, drop } from './vehicle.js';

export const meta = { duration: 4.4, beats: [[0, '出かける途中'], [1.5, 'プシュー！'], [3.0, 'パンクした']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = 190, GY = 262;
  k.backdrop({ floorY: FY });
  el('path', { d: `M 0 ${FY} Q 100 ${FY - 50} 200 ${FY - 20} T 400 ${FY - 30} V ${FY} H 0 Z`, fill: '#DCEFD9' });
  el('rect', { x: 0, y: FY, width: 400, height: 110, fill: '#B9C2CF' });
  el('rect', { x: 0, y: FY, width: 400, height: 6, fill: '#D6DCE5' });
  const world = g({});
  const trees = [0, 1, 2, 3].map((i) => tree(k, 0, FY, 0.7));
  trees.forEach((tr) => world.appendChild(tr.t));
  const dashes = [0, 1, 2, 3, 4, 5, 6].map(() => el('rect', { y: GY + 18, width: 34, height: 5, rx: 2, fill: '#fff' }));
  const nail = el('path', { d: 'M -3 0 L 0 -8 L 3 0 Z', fill: pal.sub });
  const car = auto(k, { color: pal.coral, dark: pal.coralDark, driver: { color: pal.mint, dark: pal.mintDark }, ds: 0.52 });
  const hiss = [0, 1, 2].map(() => el('path', { d: 'M 0 0 q 6 -4 12 0', stroke: pal.sub, 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' }));
  const q = mark(k, 'x'); const sw = drop(k);
  // 進んだ距離：一定速度 → パンク後に減速して止まる
  const V = 150, T1 = 1.5, T2 = 2.9;
  const D = (t) => V * Math.min(t, T1) + V * (T2 - T1) / 2 * (1 - Math.pow(1 - seg(t, T1, T2), 2));
  const CX = 180, S = 1.35;
  return {
    update(t) {
      const d = D(t);
      trees.forEach((tr, i) => k.tf(tr.t, ((i * 130 + 60 - d * 0.6) % 520 + 520) % 520 - 60, FY, 0, 0.7));
      dashes.forEach((n, i) => k.set(n, { x: ((i * 64 - d) % 448 + 448) % 448 - 40 }));
      // くぎ：後輪が踏む位置
      const nx = CX - 38 * S + (V * T1 - d) + 0;
      k.set(nail, { transform: `translate(${nx.toFixed(1)} ${GY})`, opacity: nx > -20 ? 1 : 0 });
      const f = easeOut(seg(t, T1, T1 + 0.8));
      const bump = t < T1 ? Math.sin(t * 40) * 0.3 : 0;
      car.set(CX, GY, d * 4.2, bump, -3.2 * f + wobble(seg(t, T2, T2 + 0.8), 2, 5) * 0.8, S);
      const [w, wx] = car.wheels[0];
      w.setAttribute('transform', `translate(${wx} ${(-14 + 5 * f).toFixed(2)}) scale(${(1 + 0.18 * f).toFixed(3)} ${(1 - 0.36 * f).toFixed(3)}) rotate(${(d * 4.2).toFixed(1)})`);
      hiss.forEach((h, i) => { const p = seg(t, T1 + i * 0.15, T1 + 0.6 + i * 0.15); k.tf(h, CX - 52 * S - 20 * p, GY - 18 - i * 8 - 6 * p); h.setAttribute('opacity', p > 0 && p < 1 ? 1 - p : 0); });
      car.d.pose({ look: t > T1 + 0.2 ? -0.8 : 0.7, mood: t > T2 ? 'sad' : t > T1 ? 'open' : 'smile', blink: blinkAt(t), lean: 6 * hump(seg(t, T2 - 0.2, T2 + 0.5)) });
      const xp = seg(t, T2 + 0.1, T2 + 0.5); k.tf(q, CX - 38 * S, GY - 48, 0, popIn(xp) * 1.3 + 0.001);
      const sp = seg(t, 3.2, 4.2); k.tf(sw, CX + 30, GY - 116 + 12 * sp, 0, sp > 0 ? 1 : 0.001); sw.setAttribute('opacity', 1 - sp * 0.5);
      void clamp; void lerp; void easeInOut;
    }
  };
}
