// make out（否定）：霧の中の標識に目をこらすが、文字がぼやけて読み取れない（例文 I couldn't make out the sign in the fog.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { bubble } from './weigh.js';

export const meta = { duration: 4.2, beats: [[0, '霧の中の標識'], [1.6, '目をこらす'], [3.4, '読み取れない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#E3E6EA' });
  const id = 'blur' + Math.floor(Math.random() * 1e6);
  const flt = el('filter', { id, x: '-30%', y: '-30%', width: '160%', height: '160%' }, k.defs);
  el('feGaussianBlur', { stdDeviation: 4.5 }, flt);
  // 標識（ぼやけて見える）
  const sign = g({ filter: `url(#${id})` });
  el('rect', { x: 300, y: 120, width: 8, height: 116, fill: '#8F9BB0' }, sign);
  el('path', { d: 'M 248 92 L 344 92 L 362 112 L 344 132 L 248 132 Z', fill: pal.green }, sign);
  k.text(302, 113, 'STATION', { 'font-size': 15, fill: '#fff' }, sign);
  k.shadow(304, 237, 20, 3);
  const fog = [0, 1, 2, 3].map((i) => el('ellipse', { cx: 0, cy: 0, rx: 150, ry: 30, fill: '#fff', opacity: 0.4 }));
  const veil = el('rect', { x: 230, y: 70, width: 170, height: 170, fill: '#F4F6F8', opacity: 0.35 });
  const S = 0.86;
  const b = k.buddy({ x: 60, y: FY, scale: S });
  const fogF = el('ellipse', { cx: 300, cy: 130, rx: 90, ry: 26, fill: '#fff', opacity: 0.5 });
  const q = bubble(k, 40, 36); k.text(0, 1, '?', { 'font-size': 24, fill: pal.sub }, q);
  const xf = (t) => lerp(60, 170, easeInOut(seg(t, 0.2, 1.5)));
  return {
    update(t) {
      fog.forEach((f, i) => tf(f, ((i * 130 + t * 14 * (i % 2 ? 1 : -1)) % 560 + 560) % 560 - 80, 110 + i * 34));
      const wk = walkTo(xf, t, 60);
      const peer = easeInOut(seg(t, 1.6, 2.2)) * (1 - easeInOut(seg(t, 3.2, 3.6)));
      const shake = t > 3.2 ? Math.sin((t - 3.2) * 16) * 0.8 * (1 - seg(t, 3.2, 3.9)) : 0;
      P(b, { ...wk, facing: 1, lean: wk.lean + 12 * peer, armR: lerp(wk.armR, 150, peer), armL: wk.armL, blink: 0.55 * peer + blinkAt(t) * (1 - peer),
        look: 0.9 + shake * 0.4, mood: t > 3.3 ? 'sad' : 'flat' });
      // 片手をひたいにかざす（目をこらす）
      const qq = seg(t, 3.3, 3.7);
      tf(q, 196, 92 - 6 * easeOut(qq), 0, qq); q.setAttribute('opacity', qq > 0 ? 1 : 0);
      veil.setAttribute('opacity', 0.3);
      tf(fogF, 10 * Math.sin(t * 0.9), 0);
    }
  };
}
