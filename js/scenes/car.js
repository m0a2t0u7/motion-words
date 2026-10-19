// car：家の前で、運転席のまめがキーを回すが、車がブルッとするだけでエンジンがかからない（例文 My car won't start.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { road, auto, puffs, keyZoom, reach, P, blinkAt, mark, drop, popIn } from './vehicle.js';

export const meta = { duration: 4.4, beats: [[0, 'キーを回す'], [1.3, 'かからない'], [3.0, '困った…']] };

export function create(k) {
  const { el, pal } = k;
  const FY = 196, GY = road(k, FY, { city: false });
  // 家とガレージ前
  el('rect', { x: 20, y: 70, width: 150, height: FY - 70, fill: '#F6EDE2' });
  el('path', { d: 'M 8 76 L 95 26 L 182 76 Z', fill: pal.coral });
  el('rect', { x: 40, y: 100, width: 40, height: 34, rx: 4, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 110, y: 120, width: 34, height: FY - 120, rx: 3, fill: pal.wood });
  el('rect', { x: 250, y: 150, width: 140, height: FY - 150, rx: 10, fill: '#BFE3C8' });
  const car = auto(k, { color: pal.blue, dark: pal.blueDark, driver: { color: pal.mint, dark: pal.mintDark }, ds: 0.52 });
  const ex = puffs(k, 3);
  const z = keyZoom(k, -60, 150);
  const sw = drop(k), q = mark(k, 'x');
  const CX = 190, S = 1.45;
  // 2回キーを回す。回すたびに車体が少し震えて止まる
  const tries = [[0.6, 1.0], [1.8, 2.3]];
  return {
    update(t) {
      let jud = 0, ang = 40;
      tries.forEach(([a, b], i) => {
        const r = seg(t, a, a + 0.25) * (1 - seg(t, b, b + 0.25));
        ang = Math.max(ang, lerp(40, 75, easeInOut(r)));
        const p = seg(t, a + 0.2, b + 0.2);
        jud += (p > 0 && p < 1 ? Math.sin(t * 70) * 1.6 * (1 - p) : 0) * (i ? 0.6 : 1);
      });
      car.set(CX, GY, 0, jud, 0, S);
      ex(CX - 66 * S, GY - 26, t, (b) => (b > 0.75 && b < 1.0) || (b > 2.0 && b < 2.2), 0.3);
      const turning = t > 0.4 && t < 2.7;
      const rq = easeInOut(seg(t, 0.2, 0.6)) * (1 - easeInOut(seg(t, 2.6, 3.0)));
      const slump = easeOut(seg(t, 2.8, 3.5));
      car.d.pose({ armR: lerp(10, reach(car.d, 0.52, 'R', 34, -22), rq), armL: 8, look: lerp(0.6, 0, slump), mood: t > 2.6 ? 'sad' : t > 1.2 ? 'flat' : 'smile', blink: blinkAt(t, 0.7), lean: 6 * rq + 8 * slump, squash: 1 - 0.05 * slump });
      z.set(300, 70, seg(t, 0.2, 0.5) * (1 - seg(t, 2.7, 3.0)), ang, turning);
      // 汗と×
      const sp = seg(t, 3.0, 4.0);
      k.tf(sw, CX + 24, GY - 120 + 14 * sp, 0, sp > 0 ? 1 : 0.001); sw.setAttribute('opacity', 1 - sp * 0.6);
      const xp = seg(t, 2.9, 3.3); k.tf(q, CX + 92, GY - 110, 0, popIn(xp) * 1.6 + 0.001);
      void hump; void clamp; void wobble;
    }
  };
}
