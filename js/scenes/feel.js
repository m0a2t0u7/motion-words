// feel：冷たい風の中、まめが自分の体を抱いてぶるぶる震え、寒さを感じる（例文 I feel cold today.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { frontL } from './dig.js';

export const meta = { duration: 4.0, beats: [[0, '外に出る'], [1.3, '冷たい風'], [2.5, '寒い']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#DDE8F2', opacity: 0.6 });
  // 雪の積もった地面と冬の木
  el('path', { d: `M 0 ${FY} Q 100 ${FY - 8} 200 ${FY} T 400 ${FY} V 300 H 0 Z`, fill: '#fff' });
  el('rect', { x: 318, y: FY - 96, width: 9, height: 96, rx: 4, fill: pal.woodDark });
  [[-22, -78, -40], [20, -66, 40], [-14, -50, -30]].forEach(([dx, dy, r]) => el('line', { x1: 322, y1: FY + dy + 12, x2: 322 + dx, y2: FY + dy - 10, stroke: pal.woodDark, 'stroke-width': 4, 'stroke-linecap': 'round' }));
  // 温度計
  const th = g({}); tf(th, 60, 120);
  el('rect', { x: -8, y: -50, width: 16, height: 74, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, th);
  const merc = el('rect', { x: -3, y: 0, width: 6, height: 10, rx: 3, fill: pal.blueDark }, th);
  el('circle', { cy: 18, r: 8, fill: pal.blueDark }, th);
  for (let i = 0; i < 5; i++) el('line', { x1: 3, x2: 7, y1: -38 + i * 10, y2: -38 + i * 10, stroke: pal.sub, 'stroke-width': 1.5 }, th);
  const b = k.buddy({ x: 200, y: FY, scale: S });
  const fl = frontL(b, S, -20, -44);
  // マフラー
  el('path', { d: 'M -30 -40 Q 0 -30 30 -40 L 30 -32 Q 0 -22 -30 -32 Z', fill: pal.red }, b.body);
  el('rect', { x: 10, y: -34, width: 9, height: 22, rx: 3, fill: pal.red }, b.body);
  const flakes = Array.from({ length: 22 }, () => el('circle', { r: 2.6, fill: '#fff', stroke: '#C9D6E4', 'stroke-width': 1 }));
  const wind = [0, 1, 2].map(() => el('path', { d: 'M 0 0 Q 30 -6 60 0 T 110 -2', fill: 'none', stroke: '#B6CCE0', 'stroke-width': 3, 'stroke-linecap': 'round' }));
  const puff = [0, 1].map(() => el('circle', { r: 7, fill: '#fff', opacity: 0 }));
  const shiv = [0, 1].map(() => el('path', { d: 'M 0 -8 L 4 -3 L 0 2 L 4 7', fill: 'none', stroke: pal.blue, 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
  return {
    update(t) {
      const gust = seg(t, 0.9, 2.2), cold = easeInOut(seg(t, 1.4, 2.2));
      const sh = cold * Math.sin(t * 60) * 1.6;
      b.pose({ x: 200 + sh, lean: lerp(0, -4, hump(gust)) + 6 * cold, squash: 1 - 0.07 * cold, armL: 8, armR: lerp(8, -48, cold),
        look: lerp(0.4, -0.2, cold), mood: cold > 0.5 ? (Math.sin(t * 40) > 0 ? 'flat' : 'open') : 'smile', blink: cold > 0.5 ? 0.35 : 0 });
      fl.set(lerp(-8, 48, cold));
      merc.setAttribute('y', lerp(-10, 6, easeInOut(seg(t, 1.0, 2.4)))); merc.setAttribute('height', lerp(20, 4, easeInOut(seg(t, 1.0, 2.4))) + 10);
      flakes.forEach((f, i) => {
        const sp = 30 + (i * 13) % 25, y = ((t * sp + i * 41) % (FY + 10)) - 5;
        const x = ((i * 89) % 420) - 10 + Math.sin(t * 1.5 + i) * 8 - 40 * hump(gust) * (y / FY);
        tf(f, x, y, 0, 0.6 + (i % 3) * 0.25);
      });
      wind.forEach((w, i) => { const q = seg(t, 0.9 + i * 0.15, 2.0 + i * 0.15); tf(w, lerp(420, -120, q), 110 + i * 34); w.setAttribute('opacity', hump(q) * 0.9); });
      puff.forEach((p, i) => { const q = ((t - 2.2 - i * 0.6) / 1.2); const u = q - Math.floor(q); const on = t > 2.2 ? 1 : 0;
        tf(p, 222 + u * 22, FY - 52 - u * 16, 0, 0.5 + u); p.setAttribute('opacity', on * (1 - u) * 0.9); });
      shiv.forEach((s, i) => { tf(s, i ? 244 : 156, FY - 60 + (i ? 4 : -4), 0, i ? 1 : -1, 1); s.setAttribute('opacity', cold * (0.6 + 0.4 * Math.sin(t * 30 + i))); });
    }
  };
}
