// bounce：ボールが落ちて、2回跳ねて、転がって止まる（例文 The ball bounced twice and stopped.）
import { seg, lerp, easeOut, clamp } from '../ease.js';

export const meta = { duration: 3.0, beats: [[0, '落ちる'], [0.62, '2回跳ねる'], [1.95, '止まる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  // 背景の植え込み
  el('ellipse', { cx: 70, cy: 238, rx: 70, ry: 30, fill: '#D6EFE0' });
  el('ellipse', { cx: 350, cy: 240, rx: 80, ry: 34, fill: '#DDF2E5' });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: pal.floor });
  el('rect', { x: 0, y: FY, width: 400, height: 2, fill: pal.floorEdge });

  const R = 25;
  const sh = k.shadow(0, 0, R * 1.05, 5);
  const puffs = g({});
  const mkPuff = () => {
    const p = g({}, puffs);
    el('line', { x1: -30, y1: 0, x2: -40, y2: -6, stroke: pal.sub, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, p);
    el('line', { x1: 30, y1: 0, x2: 40, y2: -6, stroke: pal.sub, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, p);
    return p;
  };
  const pf = [mkPuff(), mkPuff()];
  const ball = g({});
  const spin = g({}, ball);
  el('circle', { cx: 0, cy: 0, r: R, fill: pal.coral }, spin);
  el('path', { d: `M ${-R} 0 Q 0 -9 ${R} 0`, stroke: '#FFFFFF', 'stroke-width': 3, fill: 'none', opacity: 0.85 }, spin);
  el('path', { d: `M 0 ${-R} Q 9 0 0 ${R}`, stroke: '#FFFFFF', 'stroke-width': 3, fill: 'none', opacity: 0.85 }, spin);
  el('circle', { cx: -7, cy: -8, r: 5, fill: '#FFFFFF', opacity: 0.35 }, ball);

  const base = FY - R;
  // 接地の時刻：0.62s, 1.32s, 1.78s。最初の落下と2回の跳ね。
  const T = [0, 0.62, 1.32, 1.78];
  const H = [150, 72, 26];

  return {
    update(t) {
      let h = 0;
      if (t < T[1]) {
        const p = t / T[1];
        h = H[0] * (1 - p * p);
      } else if (t < T[2]) {
        const p = seg(t, T[1], T[2]);
        h = H[1] * 4 * p * (1 - p);
      } else if (t < T[3]) {
        const p = seg(t, T[2], T[3]);
        h = H[2] * 4 * p * (1 - p);
      }
      // 横方向：だんだん遅くなり、2.4s で完全に止まる
      const xp = easeOut(seg(t, 0, 2.4));
      const x = lerp(96, 286, xp);
      // 接地時のつぶれ
      let sq = 0;
      [T[1], T[2], T[3]].forEach((c, i) => {
        const d = Math.abs(t - c);
        if (d < 0.07) sq = Math.max(sq, (1 - d / 0.07) * [0.32, 0.2, 0.1][i]);
      });
      const y = base - h + sq * R;
      tf(ball, x, y, 0, 1 + sq, 1 - sq);
      tf(spin, 0, 0, ((x - 96) / R) * (180 / Math.PI));
      const s = 1 - clamp(h / 170) * 0.6;
      tf(sh, x, FY + 2, 0, s, s);
      sh.setAttribute('opacity', 0.5 + 0.5 * s);
      pf.forEach((p, i) => {
        const c = T[i + 1];
        const q = seg(t, c, c + 0.25);
        const on = t >= c && q < 1;
        p.setAttribute('opacity', on ? (1 - q) * (i === 0 ? 1 : 0.7) : 0);
        const px = lerp(96, 286, easeOut(seg(c, 0, 2.4)));
        tf(p, px, FY - 4, 0, 1 + q * 0.4, 1);
      });
    }
  };
}
