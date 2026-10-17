// heat up：まめがコンロのつまみを回して火をつけ、鍋のスープをおたまで混ぜて温める（例文 I heated up the soup in a pot.）
import { seg, lerp, easeInOut, easeOut, backOut } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '冷たいスープ'], [1.3, '火にかける'], [3.2, '湯気が立つ']] };

const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, p) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * p).toString(16).padStart(2, '0')).join('');

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 250, mood: 'indoor' });
  // 壁のタイルとレンジフード
  for (let r = 0; r < 5; r++) for (let c = 0; c < 20; c++) el('rect', { x: c * 20 + 1, y: 78 + r * 24 + 1, width: 18, height: 22, rx: 3, fill: '#EFF3F6' });
  el('path', { d: 'M 196 70 L 214 38 L 266 38 L 284 70 Z', fill: '#B9C3D0' });
  el('rect', { x: 192, y: 70, width: 96, height: 9, rx: 3, fill: '#9AA5B5' });
  el('rect', { x: 36, y: 44, width: 70, height: 60, rx: 6, fill: '#DDEFFA' });
  el('line', { x1: 71, y1: 44, x2: 71, y2: 104, stroke: '#fff', 'stroke-width': 4 });
  // コンロ
  k.shadow(290, FY, 110, 8);
  el('rect', { x: 190, y: 200, width: 100, height: 50, rx: 4, fill: '#E4E9F0' });
  el('rect', { x: 186, y: 194, width: 108, height: 8, rx: 3, fill: '#3C465A' });
  el('rect', { x: 296, y: 200, width: 104, height: 50, fill: pal.wood });
  el('rect', { x: 294, y: 194, width: 110, height: 8, rx: 2, fill: pal.woodDark });
  el('rect', { x: 206, y: 222, width: 68, height: 20, rx: 4, fill: '#CBD3DE' });
  const knob = g({});
  el('circle', { cx: 0, cy: 0, r: 7, fill: '#fff', stroke: pal.sub, 'stroke-width': 2 }, knob);
  el('line', { x1: 0, y1: -1, x2: 0, y2: -6, stroke: pal.red, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, knob);
  const glow = el('circle', { cx: 200, cy: 208, r: 11, fill: pal.red, opacity: 0 });
  // 炎（鍋の両脇と底）
  const flames = [200, 210, 220, 232, 248, 260, 270, 280].map((x) => el('path', { d: '', fill: pal.yellow, stroke: pal.coral, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }));
  // 鍋
  [206, 266].forEach((x) => el('rect', { x, y: 168, width: 8, height: 7, rx: 3, fill: '#8591A3' }));
  el('rect', { x: 214, y: 160, width: 52, height: 34, rx: 7, fill: '#A9B4C4' });
  el('rect', { x: 220, y: 166, width: 6, height: 22, rx: 3, fill: '#fff', opacity: 0.35 });
  el('ellipse', { cx: 240, cy: 160, rx: 26, ry: 7, fill: '#8591A3' });
  const soup = el('ellipse', { cx: 240, cy: 161, rx: 22, ry: 5, fill: '#F4DFC0' });
  const bub = [0, 1, 2, 3].map(() => el('circle', { r: 2, fill: '#fff', opacity: 0, stroke: '#F0C79A', 'stroke-width': 1 }));
  const steam = [0, 1, 2].map((i) => el('path', { d: `M ${224 + i * 16} 150 q -7 -12 0 -24 t 0 -24`, fill: 'none', stroke: '#fff', 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0 }));
  const steam2 = [0, 1, 2].map((i) => el('path', { d: `M ${224 + i * 16} 150 q -7 -12 0 -24 t 0 -24`, fill: 'none', stroke: '#C9D3DF', 'stroke-width': 2, 'stroke-linecap': 'round', opacity: 0 }));

  const S = 1.1;
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const ladle = g({});
  const handle = el('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: pal.woodDark, 'stroke-width': 4, 'stroke-linecap': 'round' }, ladle);
  const spoon = el('ellipse', { cx: 0, cy: 0, rx: 6, ry: 4.5, fill: '#8591A3', stroke: '#6D7A8D', 'stroke-width': 1.5 }, ladle);

  return {
    update(t) {
      // つまみを回す（45°の腕でつまみに手を当てる）
      const toK = easeOut(seg(t, 0.3, 0.8));
      const fromK = easeInOut(seg(t, 1.25, 1.6));
      let a = lerp(15, 45, toK);
      a = lerp(a, 85, fromK);
      const press = seg(t, 0.8, 1.2);
      const stirring = t > 1.7 && t < 3.6;
      const w = (t - 1.7) * 9;
      if (stirring) a = 85 + 6 * Math.sin(w);
      if (t >= 3.6) a = lerp(85, 15, easeInOut(seg(t, 3.6, 4.1)));
      b.pose({ armR: a, armL: 8, lean: lerp(0, 5, toK), look: 0.6, mood: t < 2.0 ? 'flat' : 'smile', blink: t > 2.6 && t < 2.7 ? 1 : 0 });
      const h = b.handPos('R');
      const turn = easeInOut(press);
      tf(knob, 200, 208, 90 * turn);
      glow.setAttribute('opacity', turn * 0.35);
      // おたま：手に持ち、混ぜる間は鍋の中へ
      const dip = easeInOut(seg(t, 1.35, 1.8)) * (1 - easeInOut(seg(t, 3.6, 4.0)));
      const tipX = lerp(h.x + 6, 240 + (stirring ? 9 * Math.cos(w) : 0), dip);
      const tipY = lerp(h.y - 32, 163 + (stirring ? 3.5 * Math.sin(w) : 0), dip);
      k.set(handle, { x1: h.x, y1: h.y, x2: tipX, y2: tipY });
      tf(spoon, tipX, tipY, 0, 1);
      // 火の強さとスープの温度
      const fire = backOut(seg(t, 1.1, 1.5), 2) * (t < 1.1 ? 0 : 1);
      flames.forEach((f, i) => {
        const x = [200, 210, 220, 232, 248, 260, 270, 280][i];
        const hh = (i > 2 && i < 5 ? 5 : 11 + (i % 2) * 3) * fire * (1 + 0.18 * Math.sin(t * 17 + i * 2));
        f.setAttribute('d', hh > 0.5 ? `M ${x - 4} 200 Q ${x - 4} ${200 - hh * 0.5} ${x} ${200 - hh} Q ${x + 4} ${200 - hh * 0.5} ${x + 4} 200 Z` : '');
      });
      const heat = easeInOut(seg(t, 1.4, 3.4));
      soup.setAttribute('fill', mix('#F4DFC0', '#E9803A', heat));
      steam.forEach((s, i) => { const o = seg(t, 2.3 + i * 0.15, 3.3); s.setAttribute('opacity', 0.9 * o); tf(s, 0, -6 * o - 3 * Math.sin(t * 3 + i), 0, 1); });
      steam2.forEach((s, i) => { const o = seg(t, 2.3 + i * 0.15, 3.3); s.setAttribute('opacity', 0.8 * o); tf(s, 0, -6 * o - 3 * Math.sin(t * 3 + i), 0, 1); });
      bub.forEach((c, i) => {
        const p = ((t * 1.4 + i * 0.27) % 1);
        const on = seg(t, 2.6, 3.0);
        c.setAttribute('cx', 228 + i * 8); c.setAttribute('cy', 161 + (i % 2) * 1.5);
        c.setAttribute('r', 1.4 + 2.4 * p); c.setAttribute('opacity', on * (1 - seg(p, 0.8, 1)));
      });
    }
  };
}
