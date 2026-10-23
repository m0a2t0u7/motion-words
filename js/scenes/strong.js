// strong：重いバーベルを持ち上げ、頭の上まで上げきる（例文 He is strong enough to lift it.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { hp } from './look-over.js';

export const meta = { duration: 4.2, beats: [[0, 'つかむ'], [1.5, '持ち上げる'], [3.2, '頭上で静止']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 244, mood: 'indoor' });
  const S = 1;
  const b = k.buddy({ x: 200, y: FY + 4, scale: S });
  // バーベル（中心が原点）。手に合わせて動かす
  const bar = g({}), sh = k.shadow(200, FY + 2, 60, 6);
  el('rect', { x: -76, y: -3, width: 152, height: 6, rx: 3, fill: '#8C96A6' }, bar);
  [-1, 1].forEach((s) => {
    el('rect', { x: s * 62 - 8, y: -26, width: 16, height: 52, rx: 5, fill: pal.ink }, bar);
    el('rect', { x: s * 74 - 5, y: -18, width: 10, height: 36, rx: 4, fill: pal.sub }, bar);
  });
  const sparks = [0, 1, 2].map(() => el('path', { d: 'M 0 0 L 0 -10', stroke: pal.yellowDark, 'stroke-width': 3, 'stroke-linecap': 'round' }));
  return {
    update(t) {
      const crouch = 1 - easeInOut(seg(t, 1.3, 2.2));          // 1=しゃがむ
      const press = easeOut(seg(t, 2.2, 3.2));                  // 頭の上へ
      const strain = hump(seg(t, 1.2, 1.5)) * 0.5 + Math.sin(t * 40) * 0.6 * hump(seg(t, 1.5, 2.4));
      const arm = lerp(0, 180, press) + lerp(0, 0, press);
      const sq = lerp(1, 0.8, crouch) - 0.04 * hump(seg(t, 0.9, 1.5));
      P(b, { y: FY + 4, squash: sq, armL: arm, armR: arm, lean: 0, mood: t < 1.3 ? 'flat' : t < 3.2 ? 'open' : 'grin', look: 0, blink: blinkAt(t) + 0, lift: 0 });
      const l = hp(b, S, 'L', 31), r = hp(b, S, 'R', 31);
      const y = Math.min((l.y + r.y) / 2, FY - 24);
      tf(bar, (l.x + r.x) / 2, y + 0.8 * strain);
      const h = FY - y;
      tf(sh, 0, 0, 0, 1 - Math.min(h, 160) / 400, 1); sh.setAttribute('opacity', 0.9 - Math.min(h, 160) / 260);
      sparks.forEach((s, i) => { const on = seg(t, 3.2, 3.4) * (1 - seg(t, 3.8, 4.2)); s.setAttribute('opacity', on); tf(s, 200 + (i - 1) * 54, y - 40 - hump(seg(t, 3.2, 3.9)) * 8, (i - 1) * 35); });
    }
  };
}
