// sprinkle：塩のふり容器を卵の上でふり、塩の粒がぱらぱらと広がって落ちる（例文 Sprinkle some salt on the eggs.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { hp, reach, kitchenBg } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '塩を持つ'], [1.2, 'ぱらぱらふる'], [3.5, '塩がかかった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = kitchenBg(k);
  const S = 1.1;
  const b = k.buddy({ x: 228, y: FY, scale: S });
  el('rect', { x: 120, y: 210, width: 290, height: FY - 204, fill: pal.wood });
  el('rect', { x: 114, y: 204, width: 296, height: 9, rx: 3, fill: pal.woodDark });
  k.shadow(260, FY + 2, 140, 5);
  // 皿と目玉焼き（動かない）
  el('ellipse', { cx: 304, cy: 203, rx: 46, ry: 7, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  [[290, 2], [320, -1]].forEach(([x, dy]) => {
    el('path', { d: `M ${x - 20} ${199 + dy} Q ${x - 18} ${190 + dy} ${x - 4} ${191 + dy} Q ${x + 14} ${188 + dy} ${x + 20} ${198 + dy} Q ${x + 14} ${205 + dy} ${x} ${204 + dy} Q ${x - 18} ${205 + dy} ${x - 20} ${199 + dy} Z`, fill: '#fff', stroke: '#E6EAF0', 'stroke-width': 1.5 });
    el('circle', { cx: x + 1, cy: 196 + dy, r: 7, fill: pal.yellow });
    el('ellipse', { cx: x - 1, cy: 193 + dy, rx: 2.4, ry: 1.6, fill: '#fff', opacity: 0.7 });
  });
  // 塩のふり容器
  const sh = g({});
  el('rect', { x: -8, y: -4, width: 16, height: 22, rx: 4, fill: '#E9F3FA', stroke: '#B8C7D6', 'stroke-width': 1.5 }, sh);
  el('path', { d: 'M -8 -4 Q -8 -14 0 -14 Q 8 -14 8 -4 Z', fill: '#B8C7D6' }, sh);
  [-4, 0, 4].forEach((x) => el('circle', { cx: x, cy: -8, r: 1, fill: '#fff' }, sh));
  el('rect', { x: -6, y: 5, width: 12, height: 8, rx: 2, fill: '#fff' }, sh);
  const N = 22;
  const grains = Array.from({ length: N }, () => el('circle', { r: 2.1, fill: '#fff', stroke: '#AEBACB', 'stroke-width': 0.8 }));
  const specks = Array.from({ length: 16 }, (_, i) => el('circle', { cx: 284 + (i * 37 % 54) - 4 + (i % 3) * 3, cy: 190 + ((i * 11) % 14), r: 1.3, fill: '#fff', stroke: '#B8C7D6', 'stroke-width': 0.6 }));
  const hash = (i) => { const v = Math.sin(i * 91.7 + 3.1) * 43758.5; return v - Math.floor(v); };
  return {
    update(t) {
      const up = easeInOut(seg(t, 0.4, 1.2)), back = easeInOut(seg(t, 3.5, 4.1));
      const hx = lerp(lerp(256, 296, up), 256, back), hy = lerp(lerp(190, 156, up), 190, back);
      b.pose({ armR: 0 });
      b.pose({ armR: reach(b, S, 'R', hx, hy), armL: 10, look: 0.5, mood: t > 3.6 ? 'smile' : 'flat', lean: 2 + 3 * up });
      const h = hp(b, S, 'R');
      const shake = Math.sin(t * 22) * (t > 1.2 && t < 3.3 ? 1 : 0);
      tf(sh, h.x + 2, h.y - 6, 150 + 8 * shake);   // 口を下にして持つ
      grains.forEach((gr, i) => {
        const T = 0.55, ph = ((t * 1.8 + hash(i)) % 1);
        const on = t > 1.25 && t < 3.3;
        const x0 = h.x + 2, y0 = h.y + 8, spread = (hash(i + 7) - 0.5) * 36;
        const y = lerp(y0, 196 + hash(i + 3) * 4, ph * ph + 0.0);
        gr.setAttribute('cx', (x0 + spread * ph + (hash(i) - 0.5) * 4).toFixed(1));
        gr.setAttribute('cy', y.toFixed(1));
        gr.setAttribute('opacity', on ? 1 - 0.2 * ph : 0);
      });
      specks.forEach((s, i) => s.setAttribute('opacity', seg(t, 1.5 + (i / specks.length) * 1.8, 1.7 + (i / specks.length) * 1.8)));
    }
  };
}
