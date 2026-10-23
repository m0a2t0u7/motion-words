import { seg, lerp, easeInOut, easeOut, easeIn, backOut, wobble, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
// 手先が(tx,ty)を向く腕の角度（シーン内だけで使う）
const aim = (x, y, f, s, tx, ty) => (Math.atan2((tx - (x + 27 * f * s)) * f, ty - (y - 56 * s)) * 180) / Math.PI;
// rough：壁を手でなぞるとざらざらする（例文 The wall felt rough under my hand.）
export const meta = { duration: 3.8, beats: [[0, '壁に近づく'], [1.1, 'なぞる'], [2.6, 'ざらざら']] };
export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const WX = 250;
  el('rect', { x: WX, y: 30, width: 150, height: FY - 30, fill: '#CDBFAE' });
  for (let i = 0; i < 40; i++) {
    const x = WX + 6 + ((i * 53) % 138), y = 40 + ((i * 37) % 180), r = 2 + (i % 3);
    el('polygon', { points: `${x},${y - r} ${x + r * 1.4},${y + r * 0.6} ${x - r * 1.2},${y + r}`, fill: i % 2 ? '#A99985' : '#E4D8C6' });
  }
  const me = k.buddy({ x: 100, y: FY, scale: 1.1 });
  const zig = k.el('path', { d: 'M 0 0 l4 -5 l4 5 l4 -5 l4 5', stroke: pal.coralDark, 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' });
  return {
    update(t) {
      const near = easeInOut(seg(t, 0, 0.9)), sl = seg(t, 1.0, 2.8), f = Math.sin(sl * Math.PI * 3);
      const x = lerp(110, WX - 27 * 1.1 - 26 * 1.1, near);
      const ty = lerp(150, 196, easeInOut(sl)) + (sl > 0 && sl < 1 ? Math.sin(t * 40) * 1.4 : 0);
      const a = aim(x, FY, 1, 1.1, WX - 1, ty);
      P(me, { x, armR: a, armL: 14, lean: 5 * near, look: 0.6, mood: t > 2.2 ? 'flat' : 'smile', blink: blinkAt(t) });
      tf(zig, WX - 46, 140 + 22 * f * 0, 0, 1, 1); zig.setAttribute('opacity', t > 1.9 ? 1 : 0);
      tf(zig, WX - 54 + Math.sin(t * 30) * 1.5, 120);
    }
  };
}
