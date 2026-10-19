// airplane：飛行機が降りてきて滑走路に車輪をつけ、減速して無事に止まる。窓のまめがにっこり（例文 The airplane landed safely.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { plane } from './vehicle.js';

export const meta = { duration: 4.4, beats: [[0, '降りてくる'], [1.8, '着地'], [3.4, '無事に止まる']] };

export function create(k) {
  const { el, pal } = k;
  const FY = 230;
  k.backdrop({ floorY: FY });
  el('rect', { x: 300, y: 120, width: 14, height: FY - 120, fill: '#DCE3EE' }); el('rect', { x: 290, y: 104, width: 34, height: 20, rx: 4, fill: '#BFD3E6' });
  el('rect', { x: 0, y: FY, width: 400, height: 70, fill: '#8F99A8' });
  for (let i = 0; i < 8; i++) el('rect', { x: i * 56, y: FY + 30, width: 30, height: 5, fill: '#fff' });
  const p = plane(k);
  const puffs = [0, 1].map(() => el('ellipse', { rx: 10, ry: 5, fill: '#fff' }));
  const TD = 1.8;
  const X = (t) => t < TD ? lerp(-30, 120, t / TD) : 120 + 144 * (TD - 0) / TD * 0 + 160 * (1 - Math.pow(1 - seg(t, TD, 3.6), 2));
  return {
    update(t) {
      const x = X(t), q = seg(t, 0, TD);
      const y = t < TD ? lerp(FY - 120, FY, easeOut(q) * 0 + q) : FY - 3 * Math.abs(wobble(seg(t, TD, TD + 0.8), 1.5, 5));
      const rot = t < TD ? lerp(-10, -4, q) : lerp(-4, 0, easeOut(seg(t, TD, TD + 0.6)));
      p.set(x, y, rot, 1, 0.8);
      puffs.forEach((n, i) => { const a = seg(t, TD + i * 0.05, TD + 0.8); k.set(n, { cx: x - 20 + (i ? 75 : 0) - 30 * a, cy: FY - 4 - 6 * a, rx: 6 + 14 * a, opacity: a > 0 && a < 1 ? 0.9 * (1 - a) : 0 }); });
      void hump; void easeInOut;
    }
  };
}
