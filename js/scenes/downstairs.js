// downstairs：階段を下りて、朝食のテーブルへ来る（例文 She came downstairs for breakfast.）
import { seg, lerp, easeInOut, smooth, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { gait } from './weigh.js';
import { roomBg } from './look-over.js';

export const meta = { duration: 4.2, beats: [[0, '2階'], [1.4, '階段を下りる'], [3.4, '朝食の席']] };

export function create(k) {
  const { el, pal } = k;
  const FY = roomBg(k, 'home', 240);
  const S = 0.78, X0 = 90, RUN = 34, RISE = 22, N = 5;
  el('rect', { x: 0, y: FY - RISE * N, width: X0, height: RISE * N, fill: pal.wood });
  el('rect', { x: 0, y: FY - RISE * N, width: X0, height: 6, fill: pal.woodDark });
  for (let i = 0; i < N - 1; i++) {
    const x = X0 + RUN * i, y = FY - RISE * (N - 1 - i);
    el('rect', { x, y, width: RUN, height: FY - y, fill: i % 2 ? pal.wood : '#E8CFA8' });
    el('rect', { x, y, width: RUN, height: 5, fill: pal.woodDark });
  }
  // 朝食のテーブル（床の高さ）
  const tx = 300;
  k.shadow(tx + 40, FY, 56, 5);
  el('rect', { x: tx, y: FY - 44, width: 84, height: 8, rx: 3, fill: pal.wood });
  el('rect', { x: tx + 8, y: FY - 36, width: 6, height: 36, fill: pal.woodDark });
  el('rect', { x: tx + 70, y: FY - 36, width: 6, height: 36, fill: pal.woodDark });
  el('ellipse', { cx: tx + 26, cy: FY - 46, rx: 17, ry: 4, fill: '#fff' });
  el('ellipse', { cx: tx + 26, cy: FY - 51, rx: 11, ry: 6, fill: '#F2C06B' });
  el('rect', { x: tx + 54, y: FY - 62, width: 14, height: 16, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  const steam = [0, 1].map((i) => el('path', { d: 'M 0 0 Q 4 -6 0 -12', fill: 'none', stroke: pal.line, 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
  const b = k.buddy({ x: 40, y: FY - RISE * N, scale: S, color: pal.coral, dark: pal.coralDark });
  const xf = (t) => lerp(40, 262, easeInOut(seg(t, 0.4, 3.0)));
  const sy = (x) => { const u = clamp((x - X0) / RUN, 0, N); const i = Math.min(Math.floor(u), N - 1); const f = u - i; return u >= N ? N : i + smooth(clamp(f / 0.45)); };
  return {
    update(t) {
      const p = gait(xf, t, 40, 30, 0.16), s = sy(p.x);
      const y = FY - RISE * (N - s) - 3 * Math.abs(Math.sin(p.walk)) * p.m;
      const end = seg(t, 3.2, 3.6);
      P(b, { x: p.x, y, walk: p.walk, armL: p.armL, armR: p.armR + 70 * end, lean: 5 * p.m, look: 0.5, mood: end > 0 ? 'grin' : 'smile', blink: blinkAt(t) });
      steam.forEach((s2, i) => { const u = (t * 0.7 + i * 0.5) % 1; k.tf(s2, tx + 61 + i * 6, FY - 66 - u * 10, 0, 1, 1); s2.setAttribute('opacity', (1 - u) * 0.8); });
    }
  };
}
