import { seg, lerp, easeInOut, easeOut, easeIn, backOut, wobble, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
// 手先が(tx,ty)を向く腕の角度（シーン内だけで使う）
const aim = (x, y, f, s, tx, ty) => (Math.atan2((tx - (x + 27 * f * s)) * f, ty - (y - 56 * s)) * 180) / Math.PI;
// smooth：赤ちゃんの柔らかくてすべすべの肌をそっとなでる（例文 The baby's skin is soft and smooth.）
export const meta = { duration: 4.0, beats: [[0, '赤ちゃんと'], [1.2, 'そっとなでる'], [2.8, 'すべすべ']] };
export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('ellipse', { cx: 250, cy: FY + 14, rx: 120, ry: 20, fill: '#FBE3D6' });
  const SB = 0.8, bx = 250;
  const baby = k.buddy({ x: bx, y: FY + 8, scale: SB, facing: -1, color: pal.coral, dark: pal.coralDark });
  const me = k.buddy({ x: 100, y: FY, scale: 1.1 });
  const sp = [0, 1, 2].map(() => el('path', { d: 'M 0 -6 L 1.6 -1.6 L 6 0 L 1.6 1.6 L 0 6 L -1.6 1.6 L -6 0 L -1.6 -1.6 Z', fill: pal.yellow }));
  const cheek = { x: bx - 24, y: FY + 8 - 52 * SB };
  return {
    update(t) {
      const near = easeInOut(seg(t, 0.4, 1.3)), st = Math.sin(t * 5) * seg(t, 1.3, 3.0) * (1 - seg(t, 3.0, 3.4));
      const x = lerp(100, 172, near), ty = cheek.y + 8 * st, tx = cheek.x;
      const a = aim(x, FY, 1, 1.1, tx, ty);
      P(me, { x, armR: a, lean: 6 * near, look: 0.5, mood: 'smile', blink: blinkAt(t) });
      P(baby, { look: -0.4, mood: t > 1.4 ? 'grin' : 'smile', squash: 1, blink: blinkAt(t, 1) });
      const on = seg(t, 2.3, 2.6);
      sp.forEach((s, i) => { const f = hump(((t * 1.2 + i * 0.33) % 1)); tf(s, cheek.x - 22 + i * 14, cheek.y - 24 - i * 6, 0, f * on, f * on); });
    }
  };
}
