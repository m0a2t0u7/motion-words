// feed：飼い主が犬の器にごはんを入れ、犬が食べる。朝と夕方の2回くり返す（例文 I feed my dog twice a day.）
import { seg, lerp, easeInOut, easeOut, smooth, wobble, clamp } from '../ease.js';
import { hp, held } from './dig.js';

export const meta = { duration: 4.4, beats: [[0.2, '朝のごはん'], [2.4, '夕方のごはん'], [4.0, '1日2回']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236, mood: 'indoor' });
  // 窓と太陽
  el('rect', { x: 34, y: 36, width: 92, height: 80, rx: 8, fill: '#DDEFFA' });
  const sun = el('circle', { cx: 80, cy: 56, r: 13, fill: pal.yellow });
  const sky = el('rect', { x: 34, y: 36, width: 92, height: 80, rx: 8, fill: '#FF9E6B', opacity: 0 });
  el('line', { x1: 80, y1: 36, x2: 80, y2: 116, stroke: '#fff', 'stroke-width': 4 });
  el('line', { x1: 34, y1: 76, x2: 126, y2: 76, stroke: '#fff', 'stroke-width': 4 });
  // 回数マーク（2つの丸）
  const mk = [0, 1].map((i) => {
    const c = el('circle', { cx: 330 + i * 30, cy: 40, r: 11, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
    const f = el('circle', { cx: 330 + i * 30, cy: 40, r: 6.5, fill: i ? '#FF9E6B' : pal.yellow, opacity: 0 });
    return f;
  });
  const b = k.buddy({ x: 176, y: 236 });
  // 犬（左向き）
  const dog = g({}); tf(dog, 332, 236);
  k.shadow(0, 0, 36, 6, dog);
  [-16, -8, 14, 22].forEach((x) => el('rect', { x: x - 3.5, y: -16, width: 7, height: 16, rx: 3, fill: '#C28F5B' }, dog));
  const tail = g({}, dog); tf(tail, 24, -30);
  el('path', { d: 'M 0 0 Q 14 -4 12 -18', stroke: '#C28F5B', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }, tail);
  el('ellipse', { cx: 0, cy: -26, rx: 28, ry: 17, fill: '#D9A773' }, dog);
  el('ellipse', { cx: 6, cy: -20, rx: 14, ry: 8, fill: '#F0D3AE' }, dog);
  const head = g({}, dog);
  el('circle', { r: 15, fill: '#D9A773' }, head);
  el('ellipse', { cx: -13, cy: 5, rx: 9, ry: 7, fill: '#F0D3AE' }, head);
  el('ellipse', { cx: -20, cy: 2, rx: 3.4, ry: 2.6, fill: pal.ink }, head);
  el('circle', { cx: -5, cy: -4, r: 2.4, fill: pal.ink }, head);
  el('path', { d: 'M 4 -10 Q 14 -6 10 8 Q 2 4 4 -10 Z', fill: '#B27C4A' }, head);
  // 器とごはん
  const BX = 262;
  const mound = el('path', { d: '', fill: '#B6683B' });
  el('path', { d: `M ${BX - 18} 228 L ${BX + 18} 228 L ${BX + 14} 238 L ${BX - 14} 238 Z`, fill: pal.red });
  el('rect', { x: BX - 20, y: 225, width: 40, height: 5, rx: 2.5, fill: '#D9534A' });
  // 計量カップ（手に持つ）
  const cup = g({});
  el('path', { d: 'M -9 -8 L 9 -8 L 7 8 L -7 8 Z', fill: pal.blue }, cup);
  el('rect', { x: -9, y: -9, width: 18, height: 3, fill: pal.blueDark }, cup);
  el('path', { d: 'M 9 -3 q 8 0 8 6', stroke: pal.blueDark, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, cup);
  const kib = [0, 1, 2, 3, 4, 5].map((i) => el('circle', { r: 2.4, fill: '#B6683B' }));
  const cycle = (c0) => ({ c0 });
  return {
    update(t) {
      let c0 = t < 2.4 ? 0.2 : 2.4, n = t < 2.4 ? 0 : 1;
      const u = t - c0;
      const pourK = smooth(seg(u, 0.2, 0.6)) * (1 - smooth(seg(u, 1.0, 1.3)));
      const pour = pourK;
      const arm = lerp(60, 118, pour);
      b.pose({ armR: arm, armL: 8, lean: 3 * pour, look: 0.7, mood: pour > 0.5 ? 'grin' : 'smile', squash: 1 });
      const h = hp(b, 1, 'R', 24);
      tf(cup, h.x + 6, h.y - 4, 0);
      cup.setAttribute('transform', `translate(${(h.x + 6).toFixed(1)} ${(h.y - 6).toFixed(1)}) rotate(${(pour * 100).toFixed(1)})`);
      // こぼれるごはん（カップの口から器へ）
      kib.forEach((d, i) => {
        const t0 = 0.45 + i * 0.1, q = (u - t0) / 0.32;
        if (q > 0 && q < 1 && u < 1.3) k.set(d, { cx: lerp(h.x + 14, BX + (i % 3 - 1) * 6, q), cy: lerp(h.y + 2, 226, q * q), opacity: 1 }); else k.set(d, { opacity: 0 });
      });
      // 器の中身：入れて、犬が食べて、空になる
      const fill = smooth(seg(u, 0.5, 1.2)), eat = smooth(seg(u, 1.4, 2.0));
      const hgt = 11 * fill * (1 - eat);
      k.set(mound, { d: `M ${BX - 16} 226 Q ${BX} ${226 - hgt * 2} ${BX + 16} 226 Z`, opacity: hgt > 0.2 ? 1 : 0 });
      // 犬：器に頭を下げて食べる、しっぽを振る
      const e = smooth(seg(u, 1.3, 1.6)) * (1 - smooth(seg(u, 2.0, 2.2))) * (t < 2.4 || t > 2.9 ? 1 : 1);
      const bob = Math.sin(u * 22) * 2.5 * e;
      tf(head, lerp(-30, -50, e), lerp(-42, -18, e) + bob, lerp(0, 22, e));
      tf(tail, 24, -30, Math.sin(t * 16) * (10 + 18 * e));
      // 朝→夕方
      const ev = smooth(seg(t, 2.1, 2.6));
      k.set(sun, { cy: lerp(54, 100, ev), cx: lerp(76, 98, ev), fill: ev > 0.5 ? '#FF8A5C' : pal.yellow });
      k.set(sky, { opacity: 0.65 * ev });
      mk[0].setAttribute('opacity', smooth(seg(t, 1.2, 1.5)));
      mk[1].setAttribute('opacity', smooth(seg(t, 3.4, 3.7)));
      tf(mk[0], 0, 0, 0, 1 + 0.4 * Math.sin(Math.PI * seg(t, 1.2, 1.7)));
    }
  };
}
