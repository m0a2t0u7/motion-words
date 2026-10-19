// stove：彼女が両手鍋を持ってきて、コンロの五徳の上に置く（例文 She put the pot on the stove.）
import { seg, lerp, easeInOut, easeOut, wobble } from '../ease.js';
import { reach, hp } from './dig.js';
import { gait } from './weigh.js';
import { P, blinkAt } from './run-after.js';
import { kitchenWall } from './cabinet.js';

// 両手鍋（原点＝底の中央）
export function pot(k, parent) {
  const g = k.g({}, parent), { el, pal } = k;
  el('path', { d: 'M -24 -30 H 24 V -4 Q 24 0 20 0 H -20 Q -24 0 -24 -4 Z', fill: '#E86F57' }, g);
  el('rect', { x: -26, y: -33, width: 52, height: 5, rx: 2.5, fill: '#C9533D' }, g);
  el('rect', { x: -33, y: -27, width: 9, height: 5, rx: 2.5, fill: pal.ink }, g);
  el('rect', { x: 24, y: -27, width: 9, height: 5, rx: 2.5, fill: pal.ink }, g);
  el('path', { d: 'M -20 -36 Q 0 -44 20 -36 Z', fill: '#C9533D' }, g);
  el('circle', { cx: 0, cy: -42, r: 3, fill: pal.ink }, g);
  el('ellipse', { cx: -12, cy: -18, rx: 5, ry: 8, fill: '#fff', opacity: 0.2 }, g);
  return g;
}

export const meta = { duration: 4.0, beats: [[0, '鍋を持つ'], [1.2, 'コンロへ'], [2.4, '置いた']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9;
  const kw = kitchenWall(k, { x0: 150, x1: 400 });
  const FY = kw.FY, CT = kw.CT;
  kw.counter();
  // ガスコンロ（調理台の上）。五徳とつまみ
  const SX = 290;
  el('rect', { x: SX - 70, y: CT - 8, width: 140, height: 10, rx: 3, fill: '#4A5468' });
  el('rect', { x: SX - 70, y: CT + 2, width: 140, height: 14, fill: '#5A6579' });
  [SX - 50, SX - 20, SX + 30].forEach((x, i) => el('circle', { cx: x, cy: CT + 9, r: 4, fill: '#C9D2DE' }));
  const BX = SX - 34, BX2 = SX + 34;
  [BX, BX2].forEach((x) => {
    el('rect', { x: x - 20, y: CT - 11, width: 40, height: 4, rx: 2, fill: pal.ink });
    el('rect', { x: x - 6, y: CT - 13, width: 12, height: 4, rx: 1, fill: '#2F3747' });
  });
  const pt = pot(k);
  const sh = k.shadow(0, 0, 26, 3);
  const her = k.buddy({ x: 40, y: FY, scale: S, color: pal.coral, dark: pal.coralDark });
  const xf = (t) => lerp(40, 196, easeInOut(seg(t, 0.15, 1.3)));
  const spot = { x: BX, y: CT - 11 };
  return {
    update(t) {
      const w = gait(xf, t, 40, 0, 0.12);
      const put = easeInOut(seg(t, 1.35, 2.05)), off = easeInOut(seg(t, 2.3, 2.7));
      const pose = { x: w.x, walk: w.walk, lean: w.lean + 6 * put * (1 - off), squash: 1 - 0.04 * put * (1 - off), look: 0.6, blink: blinkAt(t), mood: t > 2.4 ? 'grin' : 'smile' };
      P(her, pose);
      const ar = lerp(lerp(72, reach(her, S, 'R', spot.x - 30, spot.y - 26), put), 8, off);
      const al = 8;
      P(her, { ...pose, armR: ar, armL: al });
      const h = hp(her, S, 'R', 30);
      // 持っている間は重みで少し揺れ、置くと小さくはずむ
      if (t < 2.05) {
        const x = lerp(h.x + 30, spot.x, put), y = lerp(h.y + 26, spot.y, put);
        tf(pt, x, y, 2 * Math.sin(t * 8) * (1 - put));
        tf(sh, x, CT - 10, 0, 0.001);
      } else {
        const q = wobble(seg(t, 2.05, 2.6), 2, 6);
        tf(pt, spot.x, spot.y, 0, 1 + 0.03 * q, 1 - 0.05 * q);
        tf(sh, spot.x, spot.y + 1, 0, 1);
      }
    }
  };
}
