// lift up：しゃがんで箱をつかみ、両手で持ち上げる（例文 She lifted up the box with both hands.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { hp, grip, decor } from './hand-over.js';

export const meta = { duration: 4.0, beats: [[0, '箱の前に立つ'], [1.2, 'つかむ'], [2.7, '持ち上げた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 250, mood: 'indoor' });
  decor(k, FY);
  const b = k.buddy({ x: 130, y: FY, scale: 1.05, color: pal.coral, dark: pal.coralDark });
  const S = 1.05;
  const grab = { squash: 0.78, lean: 20, armR: 72, armL: 12 };
  b.pose(grab);
  const h0 = hp(b, S);
  const OFF = { x: 17, y: -1 };
  const bx0 = h0.x + OFF.x, by0 = h0.y + OFF.y;
  const sh = k.shadow(0, FY, 24, 5);
  const box = g({});
  el('rect', { x: -21, y: -18, width: 42, height: 36, rx: 3, fill: '#D9A86C' }, box);
  el('rect', { x: -21, y: 8, width: 42, height: 10, rx: 3, fill: '#C48E52' }, box);
  el('rect', { x: -5, y: -18, width: 10, height: 36, fill: '#F2D9A8' }, box);
  el('path', { d: 'M -21 -18 L -21 -22 M 21 -18 L 21 -22', stroke: '#C48E52', 'stroke-width': 1 }, box);
  const gr = grip(k, pal.coral, pal.coralDark, S);
  return {
    update(t) {
      const dn = easeInOut(seg(t, 0.55, 1.2)), up = easeInOut(seg(t, 1.6, 2.7));
      const squash = lerp(lerp(1, grab.squash, dn), 1, up) - 0.03 * hump(seg(t, 1.2, 1.6));
      const lean = lerp(lerp(2, grab.lean, dn), -3, up);
      const armR = lerp(lerp(14, grab.armR, dn), 86, up);
      b.pose({ squash, lean, armR, armL: lerp(12, 12, dn), look: 0.5, mood: t < 1.2 ? 'flat' : t < 2.7 ? 'open' : 'grin', blink: t > 0.3 && t < 0.4 ? 1 : 0 });
      const h = hp(b, S);
      const held = t >= 1.2;
      const bx = held ? h.x + OFF.x : bx0, by = held ? h.y + OFF.y : by0;
      const bump = 1 + 0.03 * wobble(seg(t, 2.6, 3.4), 2, 4) * (t > 2.6 ? 1 : 0);
      tf(box, bx, by, 0, 1, bump);
      const air = Math.max(0, (FY - 18) - by) / 50;
      k.set(sh, { cx: bx, rx: 24 * (1 - air * 0.3), opacity: 1 - air * 0.4 });
      gr(h);
    }
  };
}
