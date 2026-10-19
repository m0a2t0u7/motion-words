// pool：子どもたちがプールで朝から夕方まで泳ぎ続ける。太陽が動き、空が夕焼けに（例文 The kids swam in the pool all day.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './restaurant.js';

const mix = (a, b, p) => { const h = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16)); const A = h(a), B = h(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], p))).join(',')})`; };

export const meta = { duration: 4.4, beats: [[0, '朝から'], [1.8, '泳ぎ続ける'], [3.4, '夕方まで']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const sky = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#DDEFFA' });
  const sun = el('circle', { r: 16, fill: pal.yellow });
  el('rect', { x: 0, y: 150, width: 400, height: 150, fill: '#E9E4DA' });
  // プール
  el('rect', { x: 20, y: 168, width: 360, height: 110, rx: 8, fill: '#fff' });
  const water = el('rect', { x: 28, y: 176, width: 344, height: 94, rx: 6, fill: '#7FCFF0' });
  [206, 238].forEach((y) => { for (let x = 32; x < 370; x += 14) el('circle', { cx: x, cy: y, r: 3, fill: x % 28 ? pal.red : '#fff' }); });
  const ripple = [0, 1, 2, 3].map(() => el('path', { d: 'M -14 0 q 7 -4 14 0 t 14 0', stroke: '#fff', 'stroke-width': 2, fill: 'none', opacity: 0.6 }));
  // 泳ぐ子（頭と腕だけ水面に出る）
  const kids = [[pal.mint, pal.mintDark, 192], [pal.coral, pal.coralDark, 222], [pal.yellow, pal.yellowDark, 254]].map(([c, d, y]) => {
    const o = g({});
    const arm = el('line', { x1: 0, y1: 0, x2: 0, y2: -18, stroke: d, 'stroke-width': 5, 'stroke-linecap': 'round' }, o);
    el('ellipse', { cx: 0, cy: -6, rx: 13, ry: 11, fill: c }, o);
    el('circle', { cx: 6, cy: -9, r: 1.8, fill: pal.ink }, o);
    el('path', { d: 'M -16 2 Q 0 -4 16 2', stroke: '#fff', 'stroke-width': 2.5, fill: 'none' }, o);
    const splash = el('circle', { cx: -18, cy: 0, r: 4, fill: '#fff', opacity: 0.8 }, o);
    return { o, arm, splash, y };
  });
  const clock = g({}); tf(clock, 352, 40);
  el('circle', { r: 16, fill: '#fff', stroke: pal.ink, 'stroke-width': 2.5 }, clock);
  const hh = el('line', { x1: 0, y1: 0, x2: 0, y2: -8, stroke: pal.ink, 'stroke-width': 3, 'stroke-linecap': 'round' }, clock);
  return {
    update(t) {
      const day = seg(t, 0, 4.4);
      sky.setAttribute('fill', day < 0.6 ? mix('#DDEFFA', '#CFE8FA', day / 0.6) : mix('#CFE8FA', '#F9C9A4', (day - 0.6) / 0.4));
      const a = lerp(Math.PI * 0.95, Math.PI * 0.08, day);
      k.set(sun, { cx: 200 + 170 * Math.cos(a), cy: 150 - 120 * Math.sin(a), fill: day > 0.75 ? '#FF9E5E' : pal.yellow });
      water.setAttribute('fill', mix('#7FCFF0', '#8FB9D8', clamp((day - 0.6) / 0.4)));
      hh.setAttribute('transform', `rotate(${lerp(-60, 180, day)})`);
      kids.forEach(({ o, arm, splash, y }, i) => {
        // 往復して泳ぐ（端でターン）
        const ph = (t * 0.55 + i * 0.33) % 2, dir = ph < 1 ? 1 : -1, q = ph < 1 ? ph : 2 - ph;
        const x = lerp(56, 344, easeInOut(q));
        tf(o, x, y + 1.5 * Math.sin(t * 8 + i), 0, dir, 1);
        arm.setAttribute('transform', `rotate(${(Math.sin(t * 9 + i) * 70).toFixed(1)})`);
        splash.setAttribute('opacity', (0.5 + 0.4 * Math.sin(t * 18 + i)).toFixed(2));
      });
      ripple.forEach((r, i) => tf(r, 70 + i * 86 + 10 * Math.sin(t * 2 + i), 186 + (i % 2) * 70));
    }
  };
}
