// ring a bell：友だちが口にした名前に、頭の中でベルが鳴る。聞き覚えはあるが、理由は思い出せないまま（That name rings a bell, but I can't remember why.）
import { seg, lerp, easeOut, backOut, hump } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '名前を聞く'], [1.2, '頭でベルが鳴る'], [3.0, '思い出せない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236, mood: 'indoor' });
  const me = k.buddy({ x: 130, y: 238 });
  const fr = k.buddy({ x: 300, y: 238, facing: -1, color: pal.coral, dark: pal.coralDark });
  // 友だちの吹き出し：名前カード
  const say = g({});
  el('rect', { x: -34, y: -20, width: 68, height: 38, rx: 12, fill: '#fff', stroke: pal.line, 'stroke-width': 2.5 }, say);
  el('path', { d: 'M 8 18 L 14 28 L 22 18 Z', fill: '#fff' }, say);
  k.text(0, -1, 'M. Ito', { 'font-size': 17, fill: pal.ink }, say);
  // 頭の中の雲：ベルと「?」
  const cloud = g({});
  el('path', { d: 'M -46 12 a 22 20 0 0 1 12 -38 a 26 24 0 0 1 48 -6 a 22 22 0 0 1 34 18 a 18 18 0 0 1 -8 26 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 2.5 }, cloud);
  el('circle', { cx: -30, cy: 34, r: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, cloud);
  el('circle', { cx: -40, cy: 50, r: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, cloud);
  const bell = g({}, cloud);
  tf(bell, -14, -6);
  const bi = g({}, bell);
  el('path', { d: 'M -14 14 Q -14 -14 0 -16 Q 14 -14 14 14 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, bi);
  el('rect', { x: -17, y: 13, width: 34, height: 5, rx: 2.5, fill: pal.yellowDark }, bi);
  el('circle', { cx: 0, cy: 22, r: 4, fill: pal.yellowDark }, bi);
  el('circle', { cx: 0, cy: -19, r: 3, fill: pal.yellowDark }, bi);
  const rings = [-1, 1].map((s) => el('path', { d: `M ${s * 24} -6 q ${s * 7} 8 0 16 M ${s * 32} -12 q ${s * 10} 14 0 28`, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, cloud));
  const qm = k.text(28, -2, '?', { 'font-size': 30, fill: pal.violet }, cloud);
  return {
    update(t) {
      const sp = backOut(seg(t, 0.2, 0.6)) * (1 - seg(t, 1.6, 1.9));
      tf(say, 270, 112, 0, Math.max(0, sp), Math.max(0, sp));
      fr.pose({ mood: t < 1.9 ? 'open' : 'smile', armR: 8, armL: 8, look: -0.4, squash: 1 + 0.03 * Math.sin(t * 14) * hump(seg(t, 0.2, 1.6)) });
      const cp = backOut(seg(t, 1.1, 1.5));
      tf(cloud, 150, lerp(80, 62, easeOut(seg(t, 1.1, 1.5))), 0, cp, cp);
      const ring = hump(seg(t, 1.3, 2.9));
      tf(bi, 0, -14, Math.sin(t * 40) * 14 * ring, 1, 1);
      rings.forEach((r) => r.setAttribute('opacity', ring > 0.05 ? 0.3 + 0.7 * Math.max(0, Math.sin(t * 28)) : 0));
      const qp = backOut(seg(t, 2.3, 2.7));
      tf(qm, 28 + 0, -2 + Math.sin(t * 4) * 2, Math.sin(t * 3) * 10, qp, qp);
      const th = easeOut(seg(t, 2.4, 3.0));
      me.pose({
        armR: lerp(8, -65, th), armL: 8, lean: lerp(0, -5, th) + 2, look: lerp(0.5, -0.2, th),
        mood: t < 1.2 ? 'smile' : t < 2.4 ? 'open' : 'flat', blink: hump(seg(t, 2.9, 3.1))
      });
    }
  };
}
