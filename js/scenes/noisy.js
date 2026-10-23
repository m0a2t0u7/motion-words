// noisy：休み時間の教室。大声でしゃべる子、机をたたく子、跳ねる子で大騒ぎ。まめは思わず耳をふさぐ（例文 The classroom was very noisy.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { CO, BL, YE, VI, reach, P, blinkAt, deskFront, sc } from './member.js';
import { icon } from './in-common.js';
import { waves } from './look-over.js';

export const meta = { duration: 4.2, beats: [[0, '休み時間'], [1.0, 'わいわい騒ぐ'], [2.4, 'うるさい！']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 236;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 100, y: 26, width: 200, height: 70, rx: 4, fill: '#3E6B5A', stroke: pal.woodDark, 'stroke-width': 6 });
  el('path', { d: 'M 120 50 q 20 -14 40 0 M 190 70 l 20 -20 l 10 16 M 250 46 h 30', stroke: '#fff', 'stroke-width': 3, fill: 'none', opacity: 0.6, 'stroke-linecap': 'round' });
  const ppl = [[40, CO(k), 1], [110, BL(k), -1], [290, YE(k), 1], [360, VI(), -1]].map(([x, c, f]) => ({ x, f, b: k.buddy({ x, y: FY, scale: 0.72, facing: f, ...c }) }));
  deskFront(k, 260, 60, FY - 32, FY);
  const b = k.buddy({ x: 200, y: FY, scale: 1, facing: 1 });
  const wv = [waves(k, pal.coral), waves(k, pal.blue), waves(k, pal.violet)];
  const notes = [0, 1, 2].map(() => icon(k, 'note'));
  const zig = [0, 1, 2, 3].map(() => el('path', { d: 'M -10 0 L -4 -8 L 2 2 L 8 -8 L 12 0', stroke: pal.red, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  return {
    update(t) {
      const loud = clamp(t / 1.2);
      ppl.forEach(({ x, f, b: p }, i) => {
        const ph = t * (8 + i) + i;
        const o = { look: 0.5, blink: blinkAt(t, i * 0.5), mood: Math.sin(ph * 1.5) > -0.3 ? 'grin' : 'open' };
        if (i === 0) P(p, { ...o, armR: 100 + 40 * Math.sin(ph), armL: 60 + 30 * Math.sin(ph + 1), lean: 6 * Math.sin(ph * 0.5) });
        if (i === 1) P(p, { ...o, lift: 16 * Math.abs(Math.sin(ph * 0.8)) * loud, armR: 160, armL: 160 });
        if (i === 2) P(p, { ...o, armR: reach(p, 0.72, 'R', 300, FY - 34 - 8 * Math.abs(Math.sin(ph * 1.4))) });
        if (i === 3) P(p, { ...o, armR: 140 + 20 * Math.sin(ph), lean: -8 });
      });
      wv[0](loud, (t * 1.2) % 1, 60, FY - 64, 1, 1.1); wv[1](loud, (t * 1.4 + 0.3) % 1, 96, FY - 64, -1, 1); wv[2](loud, (t * 1.3 + 0.6) % 1, 346, FY - 64, -1, 1);
      notes.forEach((n, i) => { const q = ((t * 0.8 + i * 0.33) % 1); tf(n, 60 + i * 130 + q * 20, FY - 110 - q * 60, Math.sin(q * 6) * 20, sc(hump(q) * loud)); });
      zig.forEach((z, i) => { const q = ((t * 1.6 + i * 0.25) % 1); tf(z, [150, 250, 170, 230][i], FY - 120 - (i % 2) * 20 - q * 10, (i - 1.5) * 20, sc(hump(q) * seg(t, 1.6, 2.0))); });
      // まめ：はじめは本を読む → 耳をふさいで顔をしかめる
      const cover = easeInOut(seg(t, 1.8, 2.3));
      P(b, { look: 0.3 - 0.3 * cover, blink: cover > 0.5 ? 0.85 : blinkAt(t), mood: cover > 0.5 ? 'sad' : 'flat', squash: 1 - 0.06 * cover + 0.02 * cover * Math.sin(t * 20), lean: -4 * cover });
      b.pose({ armR: lerp(30, 177, cover), armL: lerp(30, 177, cover) });
    }
  };
}
