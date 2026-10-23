// relaxed：仕事から帰ったまめが、ソファで肩の力を抜き、頭の後ろで手を組んで、のんびり足を投げ出す（例文 He looked relaxed on the sofa.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, blinkAt, homeBg, sofaProp, sym, legs, cloudG } from './confused.js';

export const meta = { duration: 4.4, beats: [[0, '肩に力'], [1.4, 'ふーっと息'], [2.8, 'のんびり']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const FY = homeBg(k, { winX: 40, sky: '#FCE6D6' });
  const SX = 220, SEAT = FY - 40;
  k.shadow(SX, FY + 2, 110, 6);
  el('rect', { x: SX - 100, y: FY - 104, width: 200, height: 70, rx: 22, fill: '#E9A86A' });
  el('rect', { x: SX - 86, y: SEAT, width: 172, height: 24, rx: 11, fill: '#F4C38E' });
  el('rect', { x: SX - 112, y: FY - 72, width: 30, height: 62, rx: 14, fill: '#D48F52' });
  el('rect', { x: SX + 82, y: FY - 72, width: 30, height: 62, rx: 14, fill: '#D48F52' });
  el('rect', { x: SX - 90, y: FY - 20, width: 180, height: 12, rx: 6, fill: '#D48F52' });
  // 手前の小さなテーブルと湯気の立つカップ
  const b = k.buddy({ x: SX, y: SEAT + 10, scale: S });
  k.shadow(80, FY + 30, 40, 5);
  el('rect', { x: 40, y: FY + 2, width: 80, height: 7, rx: 3, fill: pal.wood });
  el('rect', { x: 46, y: FY + 9, width: 5, height: 20, fill: pal.woodDark }); el('rect', { x: 109, y: FY + 9, width: 5, height: 20, fill: pal.woodDark });
  el('path', { d: `M 70 ${FY + 2} l 2 -16 h 16 l 2 16 Z`, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 });
  const steam = [0, 1].map((i) => el('path', { d: 'M 0 0 q -5 -6 0 -12 q 5 -6 0 -12', stroke: pal.sub, 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }));
  const puff = cloudG(k, 34, 16, '#fff', undefined, true);
  const zz = sym(k, '♪', pal.violet, 22);
  return {
    update(t) {
      const sigh = hump(seg(t, 1.2, 2.0)), loose = easeInOut(seg(t, 1.6, 2.6)), swing = Math.sin(t * 2.4) * 6 * loose;
      // 最初は肩が上がって固い（腕をこわばらせる）→ 息を吐いて力が抜ける
      const tense = 1 - loose;
      P(b, { x: SX, y: SEAT + 10 + 2 * tense, lean: lerp(4, -14, loose) + swing * 0.2, squash: lerp(1.04, 0.97, loose) - 0.03 * sigh,
        armL: lerp(4, 160, loose), armR: lerp(4, 160, loose), mood: t < 1.2 ? 'flat' : t < 2.0 ? 'open' : 'smile', blink: t > 2.4 ? 1 : blinkAt(t), look: 0 });
      legs(b, lerp(0, -70, loose) + swing, lerp(0, -60, loose) - swing);
      steam.forEach((s, i) => { const q = (t * 0.6 + i * 0.5) % 1; tf(s, 76 + i * 8, FY - 16 - 18 * q, 0, 1); s.setAttribute('opacity', hump(q) * 0.7); });
      tf(puff, SX + 40, FY - 112 - 10 * seg(t, 1.3, 2.1), 0, Math.max(0.001, sigh)); puff.setAttribute('opacity', sigh);
      zz(seg(t, 2.8, 3.2), SX + 52 + 4 * Math.sin(t * 3), FY - 140 - 6 * Math.sin(t * 2));
    }
  };
}
