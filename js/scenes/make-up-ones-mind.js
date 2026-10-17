// make up one's mind：ケーキとラーメン、どちらも気になって右を見て左を見て、最後まで決められない（I can't make up my mind.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '左を見る'], [1.5, '右を見る'], [3.2, '決められない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('ellipse', { cx: 200, cy: FY + 16, rx: 170, ry: 10, fill: '#EDE5D8' });
  // 左：ケーキ、右：ラーメン（それぞれ台の上）
  const stand = (x) => { k.shadow(x, FY + 2, 34, 5); el('rect', { x: x - 26, y: FY - 70, width: 52, height: 70, rx: 5, fill: pal.wood }); el('rect', { x: x - 32, y: FY - 76, width: 64, height: 9, rx: 4, fill: pal.woodDark }); };
  stand(58); stand(342);
  const cake = g({});
  el('rect', { x: -22, y: -10, width: 44, height: 20, rx: 4, fill: '#FFD9E2' }, cake);
  el('rect', { x: -22, y: -2, width: 44, height: 5, fill: '#fff' }, cake);
  el('path', { d: 'M -22 -10 Q -22 -22 0 -22 Q 22 -22 22 -10 Z', fill: '#fff' }, cake);
  el('circle', { cx: 0, cy: -26, r: 5, fill: pal.red }, cake);
  const ramen = g({});
  el('path', { d: 'M -24 -6 L 24 -6 Q 22 14 0 16 Q -22 14 -24 -6 Z', fill: pal.red }, ramen);
  el('ellipse', { cx: 0, cy: -6, rx: 24, ry: 6, fill: '#F2C879' }, ramen);
  el('path', { d: 'M -12 -7 q 6 -4 12 0 t 12 0', stroke: '#fff', 'stroke-width': 2.4, fill: 'none' }, ramen);
  el('circle', { cx: 8, cy: -7, r: 4, fill: '#fff' }, ramen);
  const steam = el('path', { d: 'M 0 0 q -5 -8 0 -16 t 0 -16', fill: 'none', stroke: '#C5CFDB', 'stroke-width': 3, 'stroke-linecap': 'round' });
  const mint = k.buddy({ x: 200, y: FY });
  const qs = [0, 1, 2].map((i) => k.text(0, 0, '?', { 'font-size': 24, fill: pal.red }));
  const sweat = el('path', { d: 'M 0 -7 Q 5 0 0 5 Q -5 0 0 -7 Z', fill: pal.water });
  const sched = [[0.2, -1], [1.3, 1], [2.3, -1], [2.9, 1]];
  return {
    update(t) {
      // 視線は左右に揺れ、決まらない。最後は肩をすくめて止まる
      let look = 0, ptL = 0, ptR = 0;
      for (let i = 0; i < sched.length; i++) {
        const [t0, d] = sched[i];
        const p = easeInOut(seg(t, t0, t0 + 0.35));
        const prev = i ? sched[i - 1][1] : 0;
        if (t >= t0) look = lerp(prev, d, p);
      }
      const fin = easeOut(seg(t, 3.3, 3.8));
      look = lerp(look, 0, fin);
      ptL = look < -0.2 ? 1 : 0; ptR = look > 0.2 ? 1 : 0;
      const scratch = hump(seg(t, 2.6, 3.4));
      mint.pose({
        look: look * 1, lean: -look * 3 * (1 - fin), squash: 1 - 0.02 * Math.abs(Math.sin(t * 8)) * (1 - fin),
        armL: lerp(8, 82, ptL * (1 - fin)) * (1 - fin) + 75 * fin,
        armR: lerp(8, 82, ptR * (1 - fin)) * (1 - fin) + 75 * fin + 85 * scratch * (1 - fin),
        mood: fin > 0.2 ? 'sad' : 'flat', blink: 0
      });
      mint.pose({ x: 200 + look * 6 });
      const pc = 1 + 0.1 * Math.max(0, -look), pr = 1 + 0.1 * Math.max(0, look);
      tf(cake, 58, FY - 98 - 2 * Math.max(0, -look), 0, pc);
      tf(ramen, 342, FY - 90, 0, pr);
      tf(steam, 342, FY - 104 - 6 * ((t * 0.6) % 1), 0, 1);
      steam.setAttribute('opacity', 0.7 * Math.sin(((t * 0.6) % 1) * Math.PI));
      qs.forEach((q, i) => {
        const p = seg(t, 0.8 + i * 0.9, 1.5 + i * 0.9);
        tf(q, 200 + (i - 1) * 24, FY - 118 - 8 * p - 6 * i, 8 * (i - 1) + 6 * Math.sin(t * 5 + i), easeOut(p) * (1 + 0.15 * fin));
        q.setAttribute('opacity', p > 0 ? 1 : 0);
      });
      const s = (t * 1.2) % 1;
      tf(sweat, 172, FY - 100 + 22 * s, 0, 1);
      sweat.setAttribute('opacity', t > 1.6 ? 1 - 0.5 * s : 0);
    }
  };
}
