// complain：スピーカーの騒音に耳をふさぎ、持ち主に向かって不満を訴える（例文 She complained about the noise.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '騒音に耐える'], [1.5, '訴える'], [3.0, '苦情を言った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 150, y: 40, width: 90, height: 56, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  // スピーカー（床に置く・動かない）
  const sp = g({}); tf(sp, 64, FY);
  k.shadow(0, 0, 30, 6, sp);
  el('rect', { x: -26, y: -86, width: 52, height: 84, rx: 8, fill: '#4B556A' }, sp);
  const cones = [[-50, 17], [-20, 11]].map(([y, r]) => { const c = g({}, sp); tf(c, 0, y); el('circle', { r, fill: '#2F3748', stroke: '#8590A6', 'stroke-width': 2.5 }, c); el('circle', { r: r * 0.4, fill: '#8590A6' }, c); return c; });
  const waves = [0, 1, 2].map(() => el('path', { d: 'M 0 -14 Q 12 0 0 14', fill: 'none', stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' }));
  const notes = [0, 1].map(() => k.text(0, 0, '♪', { 'font-size': 18, fill: pal.violet }));
  const C = k.buddy({ x: 190, y: FY, facing: 1, color: pal.coral, dark: pal.coralDark });
  const O = k.buddy({ x: 330, y: FY, facing: -1 });
  const P = (b, o) => b.pose({ armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'smile', blink: 0, lift: 0, ...o });
  const bb = g({}); tf(bb, 250, 100);
  el('rect', { x: -28, y: -18, width: 56, height: 36, rx: 14, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, bb);
  el('path', { d: 'M -10 17 L -16 28 L 0 17 Z', fill: '#fff' }, bb);
  const zig = el('path', { d: 'M -18 4 L -11 -8 L -4 4 L 3 -8 L 10 4 L 17 -8', stroke: pal.red, 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, bb);
  return {
    update(t) {
      const ear = 1 - easeInOut(seg(t, 1.3, 1.8)), pt = easeOut(seg(t, 1.6, 2.1));
      const talk = t > 1.8 && t < 3.6 && Math.sin(t * 20) > 0;
      const th = Math.abs(Math.sin(t * 24));
      cones.forEach((c, i) => tf(c, 0, i ? -20 : -50, 0, 1 + 0.07 * th * (i ? 1.4 : 1)));
      waves.forEach((w, i) => { const q = ((t * 1.4 + i / 3) % 1); tf(w, 84 + q * 38, FY - 64, 0, 0.7 + q * 0.8, 1 + q); w.setAttribute('opacity', 1 - q); });
      notes.forEach((n, i) => { const q = ((t * 0.9 + i * 0.5) % 1); tf(n, 90 + q * 26, FY - 100 - q * 30 - i * 12, 0, 1); n.setAttribute('opacity', 1 - q); });
      P(C, { armR: ear * 160 + (1 - ear) * 8, armL: lerp(ear * -160, 100, pt), mood: ear > 0.5 ? 'sad' : 'open', look: ear > 0.5 ? -0.5 : 0.6, lean: -3 * ear + 5 * pt, squash: 1 - 0.03 * ear * Math.abs(Math.sin(t * 24)), blink: ear * 0.7 });
      if (ear > 0.5) C.pose({ armL: 160 });
      P(O, { look: 0.6, mood: t > 2.3 ? 'sad' : 'smile', lean: -5 * seg(t, 2.0, 2.8), armR: 8 + 40 * hump(seg(t, 2.6, 3.6)), squash: 1 - 0.04 * seg(t, 2.0, 2.8) });
      tf(bb, 250, 100, 0, talk || (t > 1.8 && t < 3.6) ? Math.max(0.001, backOut(seg(t, 1.8, 2.2))) : t >= 3.6 ? 1 : 0.001);
      tf(zig, 0, 0, 0, 1 + 0.12 * Math.sin(t * 22));
    }
  };
}
