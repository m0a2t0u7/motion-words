// in the long run：毎年ジョギングを続ける。年が進むごとに貯金びんに硬貨がたまり、最後には満杯に（Exercise saves you money in the long run.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, clamp, backOut } from '../ease.js';
import { parkBg, tree, run, coin } from './run-after.js';
import { P, calendar } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '運動を続ける'], [1.6, '年月がたつ'], [3.4, '長い目で得']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = parkBg(k);
  tree(k, 40, FY - 2, 0.9); tree(k, 200, FY - 6, 0.7);
  const cal = calendar(k, 330, 30, 46);
  // 貯金びん
  const JX = 336, JB = FY - 2;
  k.shadow(JX, JB + 2, 34, 4);
  const cp = k.clip((c) => el('rect', { x: JX - 26, y: JB - 74, width: 52, height: 72, rx: 10 }, c));
  el('rect', { x: JX - 28, y: JB - 76, width: 56, height: 76, rx: 12, fill: '#E9F6FB', stroke: '#B9D7E6', 'stroke-width': 3 });
  const fill = el('rect', { x: JX - 26, y: JB, width: 52, height: 0, fill: pal.yellow, 'clip-path': cp });
  const rows = g({}, g({ 'clip-path': cp }));
  for (let r = 0; r < 7; r++) for (let c = 0; c < 4; c++) el('circle', { cx: JX - 19 + c * 12.5 + (r % 2) * 5, cy: JB - 4 - r * 10, r: 5.5, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.4 }, rows);
  el('rect', { x: JX - 20, y: JB - 84, width: 40, height: 10, rx: 3, fill: '#B9D7E6' });
  el('rect', { x: JX - 8, y: JB - 81, width: 16, height: 3, rx: 1.5, fill: pal.ink });
  const cn = coin(k);
  const G = k.buddy({ x: 70, y: FY, scale: 0.9 });
  const T = 0.85; // 1往復の半分
  const xf = (t) => { const q = t / T, i = Math.floor(q), f = easeInOut(q - i); return i % 2 ? lerp(250, 70, f) : lerp(70, 250, f); };
  return {
    update(t) {
      const r = run(xf, t, 70);
      P(G, { x: r.x, walk: r.walk, armL: r.armL, armR: r.armR, lean: r.lean, lift: r.lift, facing: r.facing, mood: 'grin', look: 0.4 });
      const yrs = Math.min(5, Math.floor(t / T));
      cal.set((yrs + 1) + 'y', hump(seg(t % T, T - 0.2, T)) * (t < 5 * T ? 1 : 0));
      const lvl = easeIn(seg(t, 0.3, 4.2));
      k.set(fill, { y: JB - 70 * lvl, height: 70 * lvl, opacity: 0 });
      rows.setAttribute('transform', `translate(0 ${(70 * (1 - lvl)).toFixed(1)})`);
      const cf = seg(t % T, 0.1, 0.55);
      tf(cn, JX, lerp(JB - 130, JB - 80, easeIn(cf)), 0, 1);
      cn.setAttribute('opacity', cf > 0 && cf < 1 && t < 4.2 ? 1 : 0);
    }
  };
}
