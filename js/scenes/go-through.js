// go through：雨雲の下の暗いトンネル（つらい時期）に入り、最後まで通り抜けて明るい所へ出る（例文 She went through a hard time last year.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';

export const meta = { duration: 4.4, beats: [[0, 'トンネルの前'], [1.8, '暗い中を進む'], [3.7, '抜けた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#E6DCCB' });
  const sun = el('circle', { cx: 356, cy: 50, r: 18, fill: pal.yellow });
  const rays = g({}); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; el('line', { x1: 356 + Math.cos(a) * 24, y1: 50 + Math.sin(a) * 24, x2: 356 + Math.cos(a) * 32, y2: 50 + Math.sin(a) * 32, stroke: pal.yellow, 'stroke-width': 3, 'stroke-linecap': 'round' }, rays); }
  // 丘とトンネル
  el('path', { d: `M 80 ${FY} Q 110 ${FY - 140} 200 ${FY - 146} Q 290 ${FY - 140} 320 ${FY} Z`, fill: '#9FCF9B' });
  el('rect', { x: 120, y: FY - 92, width: 160, height: 92, fill: '#3A3F4D' });
  el('path', { d: `M 120 ${FY} L 120 ${FY - 60} Q 120 ${FY - 92} 152 ${FY - 92} L 248 ${FY - 92} Q 280 ${FY - 92} 280 ${FY - 60} L 280 ${FY} Z`, fill: '#3A3F4D', stroke: '#8D96A6', 'stroke-width': 8 });
  const S = 0.8;
  // 中にいる間は暗いシルエットで、入口・出口の外枠より奥に描く
  const inner = g({});
  inner.setAttribute('clip-path', k.clip((c) => el('rect', { x: 124, y: FY - 100, width: 152, height: 104 }, c)));
  const ghost = k.buddy({ scale: S, parent: inner, color: '#5C6476', dark: '#4A5161' });
  const outer = g({});
  const b = k.buddy({ scale: S, parent: outer });
  outer.setAttribute('clip-path', k.clip((c) => { el('rect', { x: -50, y: 0, width: 166, height: 300 }, c); el('rect', { x: 284, y: 0, width: 200, height: 300 }, c); }));
  // 雨雲
  const cloud = g({});
  [[-26, 0, 22], [0, -10, 28], [28, 0, 22]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#8892A3' }, cloud));
  const drops = [0, 1, 2, 3, 4, 5].map(() => el('line', { x1: 0, y1: 0, x2: -3, y2: 9, stroke: pal.water, 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
  const xf = (t) => lerp(30, 360, easeInOut(seg(t, 0.2, 3.7)) * 0.8 + seg(t, 0.2, 3.7) * 0.2);
  return {
    update(t) {
      const wk = walkTo(xf, t, 30), x = wk.x, dark = x > 150 && x < 300;
      const out = seg(x, 300, 340);
      const pose = { ...wk, facing: 1, look: 0.7, blink: blinkAt(t), mood: x < 130 ? 'flat' : dark ? 'sad' : 'grin', lean: wk.lean + (dark ? 6 : 0), squash: dark ? 0.96 : 1, y: FY };
      P(b, pose); P(ghost, pose);
      tf(cloud, 200, 60); cloud.setAttribute('opacity', 1 - 0.7 * out);
      drops.forEach((d, i) => { const p = ((t * 1.6 + i / 6) % 1); tf(d, 150 + i * 20, 80 + p * 30); d.setAttribute('opacity', (1 - out) * (1 - p)); });
      const sq = seg(t, 3.4, 4.0); tf(rays, 356, 50, sq * 30, 1); rays.setAttribute('transform', `rotate(${(sq * 30).toFixed(1)} 356 50)`);
      rays.setAttribute('opacity', 0.4 + 0.6 * sq);
    }
  };
}
