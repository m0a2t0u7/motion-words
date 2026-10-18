// get through：机の書類の山を1枚ずつ右のトレーへ片づけ、山がなくなるまでやり終える（例文 I need to get through this pile of work today.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { officeBg } from './queue-up.js';
import { tableTop } from './spread-out.js';

export const meta = { duration: 4.6, beats: [[0, '書類の山'], [2.0, '次々に片づける'], [4.0, 'やり終えた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = officeBg(k, 236);
  const clock = g({}); tf(clock, 200, 46);
  el('circle', { r: 16, fill: '#fff', stroke: pal.ink, 'stroke-width': 2.5 }, clock);
  const hh = el('line', { x1: 0, y1: 0, x2: 0, y2: -10, stroke: pal.ink, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, clock);
  const S = 1.1, X = 200;
  const b = k.buddy({ x: X, y: FY, scale: S });
  tableTop(k, 60, 340, 194, 18);
  const N = 12, LX = 128, RX = 272;
  el('rect', { x: RX - 24, y: 194, width: 48, height: 6, rx: 2, fill: pal.blue });
  const sheets = [];
  for (let i = 0; i < N; i++) sheets.push(el('rect', { width: 34, height: 5, rx: 1, fill: '#fff', stroke: '#C9D3E0', 'stroke-width': 1 }));
  const sparks = [0, 1].map(() => el('path', { d: 'M 0 -8 L 2.5 -2.5 L 8 0 L 2.5 2.5 L 0 8 L -2.5 2.5 L -8 0 L -2.5 -2.5 Z', fill: pal.yellow }));
  const T0 = 0.4, T1 = 3.6, per = (T1 - T0) / N;
  return {
    update(t) {
      tf(hh, 0, 0, t * 60);
      const k2 = Math.min(N, Math.max(0, (t - T0) / per));
      const done = Math.floor(k2), mv = done < N ? k2 - done : 0;
      // 左手で山から取り、右手で受けてトレーへ（腕が交互に動く）
      const armL = done < N ? 40 + 40 * (1 - mv) : 15;
      const armR = done < N ? 40 + 40 * mv : 15;
      const fin = easeOut(seg(t, 3.8, 4.2));
      b.pose({ armL: lerp(armL, 160, fin), armR: lerp(armR, 160, fin), mood: fin > 0.3 ? 'grin' : 'flat', look: done < N ? lerp(-0.5, 0.5, mv) : 0, squash: 1 - 0.02 * Math.abs(Math.sin(t * 9)) * (1 - fin), lift: 6 * hump(seg(t, 3.9, 4.3)) });
      sheets.forEach((s, i) => {
        const order = N - 1 - i; // 上から何番目に取られるか
        let x = LX, y = 190 - i * 5;
        if (order < done) { x = RX; y = 190 - order * 5; }
        else if (order === done && done < N) { const e = easeInOut(mv); x = lerp(LX, RX, e); y = lerp(190 - i * 5, 190 - done * 5, e) - 24 * hump(mv); }
        k.set(s, { x: x - 17, y });
      });
      sparks.forEach((s, i) => { const q = seg(t, 3.8 + i * 0.15, 4.4 + i * 0.15); s.setAttribute('opacity', q > 0 && q < 1 ? 1 : 0); tf(s, 120 + i * 160, 150 - 14 * q, q * 90, 0.3 + hump(q)); });
    }
  };
}
