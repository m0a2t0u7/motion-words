// tooth：6さいの誕生日のころ、ぐらぐらの歯がぬけた。ぬけた小さな歯を見せてにっこり（例文 I lost a tooth when I was six.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { hp, reach, P, blinkAt, bp, faceOf, twinkle, pop, lens } from './body.js';
import { homeBg } from './furniture.js';
import { cake } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '6さいのころ'], [1.0, 'ぐらぐら'], [2.4, '歯がぬけた']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.3, FY = 240;
  homeBg(k, { FY, winX: 40 });
  // 6 の飾り旗
  [0, 1, 2, 3, 4].forEach((i) => el('path', { d: `M ${170 + i * 28} 30 l 14 22 l 14 -22 Z`, fill: [pal.red, pal.yellow, pal.blue, pal.green, pal.violet][i] }));
  el('path', { d: 'M 166 30 Q 240 40 314 30', stroke: pal.sub, 'stroke-width': 1.5, fill: 'none' });
  el('rect', { x: 260, y: FY - 60, width: 110, height: 8, rx: 3, fill: pal.wood }); el('rect', { x: 312, y: FY - 52, width: 7, height: 52, fill: pal.woodDark });
  const ck = cake(k); tf(ck, 316, FY - 60, 0, 1.4);
  el('circle', { cx: 316, cy: FY - 112, r: 13, fill: '#fff', stroke: pal.red, 'stroke-width': 2.5 }); k.text(316, FY - 111, '6', { 'font-size': 15, fill: pal.red });
  const b = k.buddy({ x: 170, y: FY, scale: S, color: pal.yellow, dark: pal.yellowDark });
  b.mouth.setAttribute('opacity', 0);
  const mg = g({}, faceOf(b));
  el('path', { d: 'M -9 -45 Q 0 -32 9 -45 Z', fill: '#B8475A' }, mg);
  const teeth = [-6, -2, 2, 6].map((x) => el('rect', { x: x - 1.8, y: -45, width: 3.6, height: 3.6, rx: 1, fill: '#fff' }, mg));
  const tooth = el('path', { d: 'M -3 -4 Q 0 -6 3 -4 L 2.5 3 Q 1.5 4 1 1 Q 0 0 -1 1 Q -1.5 4 -2.5 3 Z', fill: '#fff', stroke: '#C9D2DE', 'stroke-width': 0.8 });
  const sp = [0, 1, 2].map(() => twinkle(k));
  return {
    update(t) {
      const wig = easeInOut(seg(t, 0.6, 1.0)) * (1 - easeInOut(seg(t, 2.3, 2.6)));
      const pull = t > 2.0, up = easeOut(seg(t, 2.6, 3.1));
      P(b, { look: 0.3, mood: 'smile', blink: blinkAt(t), lean: pull && t < 2.4 ? -6 : 0, lift: t > 2.0 && t < 2.3 ? 4 * hump(seg(t, 2.0, 2.3)) : 0 });
      const m = bp(b, S, 2 + b.state.look * 6, -44);
      const tg = up > 0 ? { x: lerp(m.x + 8, m.x + 40, up), y: lerp(m.y, m.y - 34, up) } : { x: m.x + 8 + (wig > 0.9 && !pull ? 2 * Math.sin(t * 30) : 0), y: m.y + 2 };
      b.pose({ armR: lerp(8, reach(b, S, 'R', tg.x, tg.y), Math.max(wig, up)) });
      const h = hp(b, S, 'R', 26);
      // ぐらぐらの歯 → ぬける
      teeth[2].setAttribute('opacity', pull ? 0 : 1);
      teeth[2].setAttribute('transform', `rotate(${(wig > 0.9 && !pull ? 14 * Math.sin(t * 30) : 0).toFixed(1)} 2 -45)`);
      tf(tooth, h.x, h.y - 8, 0, pull ? 2.2 : 0.001);
      if (t > 2.6) b.pose({ mood: 'grin' });
      mg.setAttribute('opacity', 1);
      sp.forEach((s, i) => { const q = seg(t, 3.1 + i * 0.15, 4.4); tf(s, h.x - 16 + i * 16, h.y - 22 - (i % 2) * 8, 45 * q, pop(easeOut(seg(q, 0, 0.3)) * 0.7)); });
    }
  };
}
