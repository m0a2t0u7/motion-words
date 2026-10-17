// slice：食パンの塊に包丁を入れ、薄い切り身を何枚も切り分けて積む（例文 Slice the bread into thin pieces.）
import { seg, lerp, easeInOut, easeOut, smooth, clamp } from '../ease.js';
import { hp, table } from './dig.js';

export const meta = { duration: 4.2, beats: [[0, 'パンの塊'], [1.5, '薄く切る'], [3.6, '切り身の山']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  table(k, 96);
  const BY = 199, LX0 = 134, T = 4, N = 5; // 切り身の厚み、枚数
  el('rect', { x: 100, y: 190, width: 150, height: 11, rx: 4, fill: pal.woodDark });
  el('rect', { x: 100, y: 190, width: 150, height: 4, rx: 2, fill: '#D9B98A' });
  const b = k.buddy({ x: 72, y: 236 });
  k.shadow(176, 201, 70, 4);
  const loaf = el('path', { d: '', fill: '#E6B877' });
  const face = el('path', { d: '', fill: '#FFF2D2' });
  const slices = [];
  for (let i = 0; i < N; i++) {
    const s = g({});
    el('rect', { x: 0, y: -28, width: T, height: 28, rx: 1.5, fill: '#E6B877' }, s);
    el('rect', { x: 0.8, y: -26, width: T - 1.6, height: 24, rx: 1, fill: '#FFF2D2' }, s);
    slices.push(s);
  }
  const kn = g({});
  el('rect', { x: -2.5, y: -12, width: 5, height: 14, rx: 2, fill: pal.woodDark }, kn);
  el('path', { d: 'M -2.5 2 L 2.5 2 L 2.5 22 Q 2 28 -2.5 22 Z', fill: '#DCE3EC', stroke: '#9AA6B6', 'stroke-width': 1 }, kn);
  const cutT = (n) => 0.8 + 0.55 * n; // n枚目を切り終える時刻
  return {
    update(t) {
      const done = clamp(Math.floor((t - 0.8 + 0.28) / 0.55) + 0, 0, N); // 切り終えた枚数（おおよそ）
      let n = 0; for (let i = 0; i < N; i++) if (t >= cutT(i) + 0.15) n = i + 1;
      const LX = LX0 + T * n;
      // 包丁の上下（のこぎり状の往復）
      const ph = ((t - 0.5) / 0.55);
      const idx = clamp(Math.floor(ph), 0, N - 1), u = ph - Math.floor(ph);
      const act = t > 0.5 && ph < N + 0.4;
      const dn = act ? Math.sin(Math.PI * Math.min(1, u)) : 0;
      const kx = LX0 + T * idx + T * 0.5 + (u > 0.5 ? T * 0.5 : 0);
      b.pose({ armR: lerp(138, 78, dn), lean: lerp(0, 4, dn) + 2 * n, armL: 8, look: 0.7, mood: t > 3.4 ? 'grin' : 'smile', squash: 1 });
      const h0 = hp(b, 1, 'R', 28);
      b.pose({ x: b.state.x + (kx - h0.x) });
      const h = hp(b, 1, 'R', 28);
      tf(kn, h.x, h.y - 2, 0);
      kn.setAttribute('opacity', 1);
      // 食パン本体（右端は丸み）
      k.set(loaf, { d: `M ${LX} ${BY} L ${LX} ${BY - 20} Q ${LX} ${BY - 28} ${LX + 12} ${BY - 28} L ${LX + 56} ${BY - 28} Q ${LX + 76 - n} ${BY - 28} ${LX + 76 - n} ${BY - 12} L ${LX + 76 - n} ${BY} Z` });
      k.set(face, { d: `M ${LX} ${BY - 2} L ${LX} ${BY - 20} Q ${LX} ${BY - 26} ${LX + 4} ${BY - 26} L ${LX + 5.5} ${BY - 26} L ${LX + 5.5} ${BY - 2} Z` });
      // 切り身：切れたら倒れて左側に積まれる
      slices.forEach((s, i) => {
        const c = cutT(i), p = easeOut(seg(t, c, c + 0.3));
        const sx = LX0 + T * i;
        const fall = p; // 0: 立っている → 1: 寝て積まれた
        const rx = lerp(sx, 134 - 2, fall), ry = lerp(BY, BY - T * i, fall);
        tf(s, rx, ry, -90 * fall + (fall > 0 ? 0 : 0));
        s.setAttribute('opacity', t >= c ? 1 : 0);
      });
    }
  };
}
