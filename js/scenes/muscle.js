// muscle：毎日走っていると、脚の筋肉が太く強くなる。最後に力強くジャンプ（例文 Running makes your leg muscles strong.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt, bp, legs, legG, spot, twinkle, pop } from './body.js';
import { parkBg } from './bench.js';
import { calendar } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '毎日走る'], [1.6, '脚が太くなる'], [3.2, '強い脚']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.3, FY = 236;
  parkBg(k, FY);
  const far = g({});
  for (let i = 0; i < 8; i++) el('rect', { x: i * 70, y: FY + 14, width: 30, height: 4, fill: '#fff', opacity: 0.7 }, far);
  const cal = calendar(k, 340, 30, 44);
  const b = k.buddy({ x: 170, y: FY, scale: S });
  const lines = [0, 1].map((i) => legG(b, i).firstChild);
  const ring = spot(k);
  const sp = [0, 1, 2].map(() => twinkle(k));
  return {
    update(t) {
      const run = t < 3.0, grow = easeInOut(seg(t, 0.4, 2.8));
      tf(far, -((t * 140) % 70));
      const day = Math.min(30, 1 + Math.floor(seg(t, 0.2, 2.8) * 29));
      cal.set(String(day), ((t - 0.2) * 11) % 1 < 0.3 && run ? ((t - 0.2) * 11) % 1 / 0.3 : 0);
      const ph = t * 11;
      const jump = easeOut(seg(t, 3.1, 3.4)) * (1 - easeInOut(seg(t, 3.5, 3.9)));
      P(b, { x: 170, walk: run ? ph : 0, lift: run ? Math.abs(Math.sin(ph)) * 6 : 30 * jump, lean: run ? 12 : 0, armL: run ? 8 + 40 * Math.sin(ph) : 150, armR: run ? 8 - 40 * Math.sin(ph) : 150, mood: run ? 'flat' : 'grin', blink: blinkAt(t), squash: !run && t > 3.85 ? 1 - 0.06 * hump(seg(t, 3.85, 4.1)) : 1 });
      if (run) legs(b, Math.sin(ph) * 40, -Math.sin(ph) * 40);
      lines.forEach((l) => { l.setAttribute('stroke-width', (10 + 7 * grow).toFixed(2)); });
      const lg = bp(b, S, 0, 6);
      ring.set(seg(t, 2.6, 3.0), lg.x, lg.y + 4, 30, t);
      sp.forEach((s, i) => { const q = seg(t, 3.4 + i * 0.12, 4.4); tf(s, lg.x - 30 + i * 30, lg.y - 4 + (i % 2) * 10, 45 * q, pop(easeOut(seg(q, 0, 0.3)))); });
    }
  };
}
