// now and then：日が過ぎていくなか、ときどき（2日だけ）公園に歩いて来て過ごす（例文 I go to the park now and then.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, parkBg, tree, walkTo } from './run-after.js';
import { days } from './from-scratch.js';
import { schedule } from './from-time-to-time.js';

export const meta = { duration: 4.2, beats: [[0, '公園'], [0.5, 'たまに行く'], [3.4, '時々']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = parkBg(k, 236);
  tree(k, 70, FY, 1.1); tree(k, 330, FY - 4, 0.8);
  // ベンチ
  k.shadow(200, FY + 1, 52, 5);
  el('rect', { x: 150, y: FY - 52, width: 100, height: 8, rx: 3, fill: pal.woodDark });
  el('rect', { x: 150, y: FY - 38, width: 100, height: 8, rx: 3, fill: pal.wood });
  el('rect', { x: 146, y: FY - 26, width: 108, height: 8, rx: 3, fill: pal.wood });
  [156, 238].forEach((x) => el('rect', { x, y: FY - 18, width: 6, height: 18, fill: pal.woodDark }));
  // 小鳥（毎日いる）
  const bird = g({});
  el('ellipse', { cx: 0, cy: -6, rx: 8, ry: 6, fill: pal.blue }, bird);
  el('circle', { cx: 6, cy: -11, r: 4.5, fill: pal.blue }, bird);
  el('path', { d: 'M 10 -11 L 14 -10 L 10 -9 Z', fill: pal.yellowDark }, bird);
  tf(bird, 300, FY);
  const b = k.buddy({ x: 430, y: FY, facing: -1 });
  const D = days(k, 64, 18, 8, 30, 24);
  const steps = [1, 5].map((i) => { const s = g({}, D.cells[i]); k.tf(s, 15, 16); el('circle', { r: 6, fill: pal.green }, s); el('rect', { x: -1.5, y: 2, width: 3, height: 6, fill: pal.woodDark }, s); return s; });
  const spec = [[0.24, 0], [1.3, 1], [0.24, 0], [0.24, 0], [0.24, 0], [1.3, 1], [0.24, 0], [0.4, 0]];
  const dim = el('rect', { x: 0, y: 48, width: 400, height: 252, fill: '#2A3242', opacity: 0 });
  return {
    update(t) {
      const S = schedule(spec, t);
      D.hi(S.i);
      const last = S.i === spec.length - 1;
      dim.setAttribute('opacity', S.i < 0 ? 0 : last && S.q > 0.5 ? 0 : 0.35 * Math.max(1 - seg(S.q, 0, 0.1), seg(S.q, 0.92, 1)));
      const on = S.kind === 1;
      const q = on ? S.q : 0;
      const xf = (tt) => lerp(440, 214, easeInOut(seg(on ? (tt - S.s) / S.d : 0, 0.08, 0.5)));
      const w = walkTo(xf, t, 440, -1);
      const joy = seg(q, 0.55, 0.9);
      b.g.setAttribute('opacity', on ? 1 : 0);
      P(b, { ...w, facing: -1, armL: joy > 0 ? 8 + 150 * hump(joy) : w.armL, armR: joy > 0 ? 8 + 150 * hump(joy) : w.armR, lift: 6 * hump(seg(q, 0.62, 0.78)), mood: joy > 0 ? 'grin' : 'smile', look: -0.4, blink: blinkAt(t) });
      const hop = Math.max(0, Math.sin(t * 7)) * 4;
      tf(bird, 300, FY - (on && q > 0.3 ? 30 + q * 40 : hop), on && q > 0.3 ? -15 : 0);
      bird.setAttribute('opacity', on && q > 0.7 ? 0 : 1);
      steps.forEach((s, j) => { const di = j ? 5 : 1; s.setAttribute('opacity', S.i > di || (S.i === di && q > 0.5) ? 1 : 0); });
    }
  };
}
