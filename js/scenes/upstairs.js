// upstairs：階段をのぼって上の階へ行き、ベッドで昼寝に入る（例文 He went upstairs to take a nap.）
import { seg, lerp, easeInOut, easeOut, smooth, clamp, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { gait } from './weigh.js';
import { roomBg } from './look-over.js';

export const meta = { duration: 4.2, beats: [[0, '1階'], [1.6, '階段をのぼる'], [3.5, '上で昼寝']] };

export function create(k) {
  const { el, pal } = k;
  const FY = roomBg(k, 'home', 240);
  const S = 0.78, X0 = 120, RUN = 34, RISE = 22, N = 5, TOP = FY - RISE * N;
  el('rect', { x: X0 + RUN * N, y: TOP, width: 400, height: 8, fill: pal.woodDark });
  for (let i = 1; i <= N; i++) {
    const x = X0 + RUN * (i - 1), y = FY - RISE * i, w = i === N ? 400 - x : RUN;
    el('rect', { x, y, width: w, height: FY - y, fill: i % 2 ? pal.wood : '#E8CFA8' });
    el('rect', { x, y, width: w, height: 5, fill: pal.woodDark });
  }
  // 上の階のベッド
  const bx = 318;
  k.shadow(bx + 36, TOP, 44, 4);
  el('rect', { x: bx - 4, y: TOP - 34, width: 8, height: 34, rx: 3, fill: pal.woodDark });
  el('rect', { x: bx, y: TOP - 22, width: 76, height: 16, rx: 5, fill: '#fff' });
  el('rect', { x: bx + 2, y: TOP - 14, width: 72, height: 10, rx: 4, fill: pal.blue });
  el('rect', { x: bx + 4, y: TOP - 28, width: 22, height: 10, rx: 5, fill: '#FFF3C4' });
  const zs = [0, 1, 2].map((i) => k.text(bx + 30 + i * 12, TOP - 50 - i * 10, 'z', { 'font-size': 14 + i * 3, fill: pal.sub }));
  const b = k.buddy({ x: 40, y: FY, scale: S });
  const xf = (t) => lerp(40, 288, easeInOut(seg(t, 0.3, 3.0)));
  const sy = (x) => { const u = clamp((x - X0) / RUN, 0, N); const i = Math.min(Math.floor(u), N - 1); const f = u - i; return u >= N ? N : i + smooth(clamp(f / 0.45)); };
  return {
    update(t) {
      const p = gait(xf, t, 40, 30, 0.16), s = sy(p.x);
      const y = FY - RISE * s - 3 * Math.abs(Math.sin(p.walk)) * p.m;
      const sleep = seg(t, 3.2, 3.6);
      P(b, { x: p.x, y, walk: p.walk, armL: p.armL, armR: p.armR, lean: 8 * p.m, look: 0.4, mood: sleep > 0 ? 'flat' : 'smile', blink: sleep > 0 ? 1 : blinkAt(t), squash: 1 - 0.06 * sleep });
      zs.forEach((z, i) => z.setAttribute('opacity', clamp(sleep * 3 - i) * (0.5 + 0.5 * hump((t * 0.6 + i * 0.3) % 1))));
    }
  };
}
