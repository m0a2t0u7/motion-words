// bench：公園を歩いてきた2人が、並んで1つのベンチに腰かける（例文 We sat on a bench in the park.）
// 共通ヘルパー：parkBg（公園の背景）、parkBench（正面のベンチ）
import { seg, lerp, easeInOut, wobble, hump } from '../ease.js';
import { gait } from './weigh.js';
import { P, blinkAt } from './run-after.js';

export function parkBg(k, FY = 236) {
  const { el, pal } = k;
  k.backdrop({ floorY: FY, mood: 'outdoor' });
  el('path', { d: `M 0 ${FY} Q 100 ${FY - 34} 210 ${FY - 14} T 400 ${FY - 20} L 400 ${FY} Z`, fill: '#CDEBD3' });
  el('rect', { x: 0, y: FY, width: 400, height: 300 - FY, fill: '#BFE3C4' });
  el('rect', { x: 0, y: FY + 18, width: 400, height: 22, fill: '#EADBC2' });
  [[40, 0.9], [340, 1.1]].forEach(([x, s]) => {
    el('rect', { x: x - 6 * s, y: FY - 70 * s, width: 12 * s, height: 70 * s, fill: '#B99572' });
    el('circle', { cx: x, cy: FY - 92 * s, r: 34 * s, fill: '#7FCB92' });
    el('circle', { cx: x - 20 * s, cy: FY - 76 * s, r: 22 * s, fill: '#8FD3A0' });
    k.shadow(x, FY + 1, 26 * s, 4);
  });
  el('circle', { cx: 300, cy: 46, r: 16, fill: pal.yellow });
  return FY;
}
// 正面のベンチ（中心 x、座面 y=SY）。front() は人物の手前（座面の前の縁）
export function parkBench(k, x, SY, FY, w = 170) {
  const { el, pal } = k;
  k.shadow(x, FY + 2, w / 2 + 6, 5);
  [0, 1].forEach((i) => el('rect', { x: x - w / 2, y: SY - 56 + i * 20, width: w, height: 13, rx: 4, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 1.5 }));
  [x - w / 2 + 12, x + w / 2 - 18].forEach((lx) => el('rect', { x: lx, y: SY - 60, width: 6, height: FY - SY + 60, rx: 2, fill: '#6D7889' }));
  el('rect', { x: x - w / 2 - 4, y: SY - 6, width: w + 8, height: 10, rx: 3, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 1.5 });
  return { front() { el('rect', { x: x - w / 2 - 4, y: SY + 2, width: w + 8, height: 6, rx: 3, fill: pal.woodDark }); } };
}

export const meta = { duration: 4.2, beats: [[0, '公園を歩く'], [1.6, 'ベンチへ'], [3.0, '並んで座った']] };

export function create(k) {
  const S = 0.78, FY = parkBg(k), SY = 200, BX = 210;
  const bench = parkBench(k, BX, SY, FY);
  const a = k.buddy({ x: -40, y: FY, scale: S });
  const c = k.buddy({ x: -110, y: FY, scale: S, color: k.pal.coral, dark: k.pal.coralDark });
  bench.front();
  const fa = (t) => lerp(-40, 220, easeInOut(seg(t, 0.1, 1.9)));
  const fc = (t) => lerp(-110, 160, easeInOut(seg(t, 0.25, 2.1)));
  const sit = (t, b, f, x0, xs, t0, off) => {
    const w = gait(f, t, x0, 16, 0.12);
    const s = easeInOut(seg(t, t0, t0 + 0.6)), land = wobble(seg(t, t0 + 0.6, t0 + 1.2), 2, 5);
    P(b, { x: lerp(w.x, xs, s), y: lerp(FY, SY + 6, s), lift: 14 * hump(seg(t, t0, t0 + 0.6)), walk: w.walk * (1 - s), armL: lerp(w.armL, 22, s), armR: lerp(w.armR, 22, s), lean: w.lean * (1 - s), squash: 1 - 0.05 * land, look: lerp(0.5, xs > BX ? -0.4 : 0.4, s), mood: s > 0.6 ? 'grin' : 'smile', blink: blinkAt(t, off) });
  };
  return {
    update(t) {
      sit(t, a, fa, -40, 248, 2.1, 0);
      sit(t, c, fc, -110, 172, 2.35, 1.1);
    }
  };
}
