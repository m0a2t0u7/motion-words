// weak：風邪が治ったあとで力が入らず、ふらふらしてソファに座り込む（例文 She felt weak after the flu.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, walkTo, sofa } from './run-after.js';
import { roomBg } from './look-over.js';

export const meta = { duration: 4.2, beats: [[0, 'ふらつく'], [1.6, 'よろよろ歩く'], [3.3, '座り込む']] };

export function create(k) {
  const { el, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  const sf = sofa(k, 290, FY - 2, 140);
  const b = k.buddy({ x: 50, y: FY + 4, scale: 1, color: '#A9D8BC', dark: '#7FB896' });
  sf.front();
  const drop = el('path', { d: 'M 0 -7 Q 6 0 0 5 Q -6 0 0 -7 Z', fill: pal.water || '#8AD0F0' });
  const xf = (u) => lerp(50, 262, easeInOut(seg(u, 0.4, 3.3)));
  return {
    update(t) {
      const w = walkTo(xf, t, 50);
      const sit = easeOut(seg(t, 3.2, 3.8)), sway = Math.sin(t * 5) * (1 - sit);
      // 歩幅は小さく、体は大きく揺れる。座るとソファの手前に沈む
      P(b, { ...w, y: lerp(FY + 4, FY - 4, sit), squash: lerp(0.94, 0.8, sit), lean: lerp(w.lean + 6 + sway * 7, 0, sit), armL: lerp(w.armL * 0.4 + 4, 8, sit), armR: lerp(w.armR * 0.4 + 4, 8, sit), walk: w.walk * 0.7, mood: 'sad', look: 0.2, blink: Math.abs(Math.sin(t * 2)) > 0.9 ? 1 : 0, facing: 1 });
      const dp = (t * 0.9) % 1;
      drop.setAttribute('opacity', sit < 0.5 ? 0.9 * (1 - dp) : 0);
      tf(drop, w.x + 22, FY - 80 + dp * 14);
    }
  };
}
