// brain：頭の中の脳から信号が出て、腕や脚に届くと体が動く。脳が体全体を動かす（例文 The brain controls the whole body.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt, bp, legs, faceOf } from './body.js';

export const meta = { duration: 4.4, beats: [[0, '頭の中の脳'], [1.0, '信号を送る'], [2.6, '体全体が動く']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.6, FY = 250;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#EEF1F8' });
  for (let x = 20; x < 400; x += 40) el('circle', { cx: x, cy: 30 + (x % 80), r: 1.5, fill: '#C9D2DE' });
  const b = k.buddy({ x: 200, y: FY, scale: S });
  // 頭の中の脳（体の上部、目の上）
  const br = g({}); b.body.insertBefore(br, faceOf(b));
  el('path', { d: 'M -20 -66 Q -22 -80 -8 -79 Q 0 -86 8 -79 Q 22 -80 20 -66 Q 12 -60 0 -62 Q -12 -60 -20 -66 Z', fill: '#F7A9B4', stroke: '#E07D90', 'stroke-width': 1.5 }, br);
  el('path', { d: 'M 0 -82 V -62 M -12 -76 q 4 4 0 8 M 12 -76 q -4 4 0 8', stroke: '#E07D90', 'stroke-width': 1.5, fill: 'none' }, br);
  // 信号（光の粒が経路を進む）
  const dots = [0, 1, 2, 3].map(() => el('circle', { r: 5, fill: pal.yellow, stroke: '#fff', 'stroke-width': 2 }));
  const paths = [0, 1, 2, 3].map(() => el('path', { fill: 'none', stroke: pal.yellow, 'stroke-width': 2.5, 'stroke-dasharray': '4 5', opacity: 0.8 }));
  return {
    update(t) {
      const glow = 0.85 + 0.15 * Math.sin(t * 10);
      br.setAttribute('transform', `translate(0 -70) scale(${(t > 0.8 ? glow + 0.1 : 1).toFixed(3)}) translate(0 70)`);
      // 信号が届いた順に動く：右腕 → 左腕 → 右脚 → 左脚
      const arr = [0, 1, 2, 3].map((i) => seg(t, 1.0 + i * 0.35, 1.6 + i * 0.35));
      const wave = t > 2.8 ? Math.sin((t - 2.8) * 8) : 0;
      P(b, { armR: arr[0] >= 1 ? 150 + 15 * wave : 10, armL: arr[1] >= 1 ? 150 - 15 * wave : 10, mood: t > 2.6 ? 'grin' : 'smile', blink: blinkAt(t), look: 0, lift: t > 3.2 ? 8 * Math.abs(Math.sin((t - 3.2) * 6)) : 0 });
      legs(b, arr[2] >= 1 ? -24 + 10 * wave : 0, arr[3] >= 1 ? 24 - 10 * wave : 0);
      const src = bp(b, S, 0, -70);
      const ends = [bp(b, S, 34, -34), bp(b, S, -34, -34), bp(b, S, 14, 6), bp(b, S, -14, 6)];
      ends.forEach((e, i) => {
        const mid = { x: (src.x + e.x) / 2, y: (src.y + e.y) / 2 };
        k.set(paths[i], { d: `M ${src.x} ${src.y} Q ${mid.x + (e.x - src.x) * 0.2} ${mid.y - 10} ${e.x} ${e.y}`, opacity: arr[i] > 0 ? 0.8 : 0 });
        const q = easeInOut(arr[i]);
        const x = lerp(lerp(src.x, mid.x + (e.x - src.x) * 0.2, q), lerp(mid.x + (e.x - src.x) * 0.2, e.x, q), q), y = lerp(lerp(src.y, mid.y - 10, q), lerp(mid.y - 10, e.y, q), q);
        k.set(dots[i], { cx: x, cy: y, opacity: arr[i] > 0 && arr[i] < 1 ? 1 : 0 });
      });
    }
  };
}
