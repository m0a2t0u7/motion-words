// science：理科は私の好きな科目。まめが実験器具を見て目を輝かせ、ハートが出る（Science is my favorite subject.）
import { seg, lerp, easeInOut, hump, backOut, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, desk } from './look-over.js';
import { hp } from './dig.js';

export const meta = { duration: 4.0, beats: [[0, '理科の机'], [1.3, 'フラスコを持つ'], [2.7, '大好き']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.0;
  const FY = roomBg(k, 'home', 240);
  const b = k.buddy({ x: 140, y: FY, scale: S });
  desk(k, 90, 270, 200);
  // 机の上：顕微鏡風と地球儀
  const gl = g({}); tf(gl, 320, 196);
  el('rect', { x: -4, y: -14, width: 8, height: 14, fill: pal.woodDark }, gl);
  el('circle', { cx: 0, cy: -34, r: 22, fill: pal.blue, stroke: pal.blueDark, 'stroke-width': 2 }, gl);
  el('path', { d: 'M -14 -42 Q -4 -52 4 -44 Q 0 -34 -8 -32 Q -16 -34 -14 -42 Z M 6 -26 Q 16 -30 18 -22 Q 12 -18 6 -26 Z', fill: pal.green }, gl);
  const fl = g({});
  el('path', { d: 'M -5 -34 L -5 -16 L -16 6 Q -18 12 -12 12 L 12 12 Q 18 12 16 6 L 5 -16 L 5 -34 Z', fill: '#E8F4FA', stroke: pal.blueDark, 'stroke-width': 2 }, fl);
  el('path', { d: 'M -12 0 L 12 0 L 16 6 Q 18 12 12 12 L -12 12 Q -18 12 -16 6 Z', fill: pal.mint }, fl);
  const bubs = [0, 1, 2].map(() => el('circle', { r: 2.5, fill: '#fff', stroke: pal.mintDark, 'stroke-width': 1 }, fl));
  const hearts = [0, 1, 2].map(() => k.text(0, 0, '♥', { 'font-size': 20, fill: pal.red }));
  return {
    update(t) {
      const up = easeInOut(seg(t, 1.0, 1.9));
      P(b, { armR: lerp(20, 130, up), armL: lerp(20, 60, up) * 0.4 + 8, lean: lerp(4, -2, up), squash: 1 + 0.03 * Math.sin(t * 5) * seg(t, 2.6, 4), look: 0.4, mood: t > 2.4 ? 'grin' : t > 1 ? 'open' : 'smile', blink: blinkAt(t) });
      const h = hp(b, S, 'R');
      const onDesk = up <= 0 ? 1 : 0;
      tf(fl, lerp(240, h.x, up), lerp(188, h.y - 12, up), lerp(0, -12, up));
      const gr = el; bubs.forEach((c, i) => { const u = (t * 0.8 + i / 3) % 1; k.set(c, { cx: Math.sin(u * 6 + i) * 4, cy: 8 - u * 22, opacity: Math.sin(u * Math.PI) * seg(t, 1.0, 1.4) }); });
      hearts.forEach((hh, i) => {
        const u = clamp((t - 2.5 - i * 0.2) / 1.2);
        tf(hh, 150 + i * 28, lerp(120, 70, u) - i * 6, 0, backOut(clamp(u * 3)));
        hh.setAttribute('opacity', u > 0 ? 1 - seg(u, 0.8, 1) * 0 : 0);
      });
    }
  };
}
