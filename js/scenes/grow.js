// grow：壁の身長計の前で、2人の子どもが年ごとにぐんぐん背が伸びる（例文 Children grow fast.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, backOut } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { calendar } from './so-far-so-good.js';

export const meta = { duration: 4.2, beats: [[0, '小さい子'], [1.0, 'ぐんぐん伸びる'], [3.3, 'もうこんなに']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 236;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  el('rect', { x: 300, y: 50, width: 80, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  // 身長計（壁の目盛り）
  const RX = 140;
  el('rect', { x: RX, y: 60, width: 120, height: FY - 66, rx: 6, fill: '#FFF6E0', stroke: pal.yellowDark, 'stroke-width': 2 });
  for (let y = FY - 10; y > 66; y -= 10) el('line', { x1: RX + ((FY - y) % 50 === 0 ? 0 : 0), x2: RX + ((FY - 10 - y) % 50 === 0 ? 18 : 9), y1: y, y2: y, stroke: pal.yellowDark, 'stroke-width': 2 });
  const cal = calendar(k, 60, 60, 50);
  const KIDS = [[168, 1], [240, 0.92]].map(([x, f]) => ({ x, f }));
  const sizes = [0.42, 0.62, 0.82, 1.02];
  const steps = [0.8, 1.7, 2.6];
  // 身長の印（伸びるたびに頭の高さに線が残る）
  const marks = KIDS.map((kd, j) => sizes.map((s) => el('line', { x1: kd.x - 18, x2: kd.x + 18, y1: FY - (80 + 10) * s * kd.f, y2: FY - (80 + 10) * s * kd.f, stroke: j ? pal.coralDark : pal.mintDark, 'stroke-width': 2.5, 'stroke-linecap': 'round', opacity: 0 })));
  KIDS.forEach((kd, j) => { kd.b = k.buddy({ x: kd.x, y: FY, scale: 0.4 * kd.f, color: j ? pal.coral : pal.mint, dark: j ? pal.coralDark : pal.mintDark, facing: 1 }); });
  const kids = KIDS;
  return {
    update(t) {
      let yr = 0;
      steps.forEach((a) => { if (t > a + 0.2) yr++; });
      const flip = steps.reduce((m, a) => Math.max(m, hump(seg(t, a, a + 0.3))), 0);
      cal.set(String(2020 + yr).slice(2), flip);
      kids.forEach((kd, j) => {
        let s = sizes[0];
        steps.forEach((a, i) => { s = lerp(s, sizes[i + 1], backOut(seg(t, a + 0.05 * j, a + 0.45 + 0.05 * j), 1.2)); });
        const sq = steps.reduce((m, a) => m + 0.06 * wobble(seg(t, a + 0.45, a + 0.9), 2, 5), 0);
        // 足元は床に固定したまま、体だけ大きくなる
        kd.b.g.setAttribute('transform', `translate(${kd.x} ${FY}) scale(${(s * kd.f).toFixed(3)})`);
        P(kd.b, { x: 0, y: 0, squash: 1 - sq, look: j ? -0.4 : 0.4, blink: blinkAt(t, j), mood: t > 3.3 ? 'grin' : 'smile', armL: 10 + 140 * easeOut(seg(t, 3.3, 3.6)) * (j ? 0 : 1), armR: 10 + 140 * easeOut(seg(t, 3.3, 3.6)) * j, lift: 6 * hump(seg(t, 3.3, 3.7)) });
        kd.b.g.setAttribute('transform', `translate(${kd.x} ${FY}) scale(${(s * kd.f).toFixed(3)})`);
        marks[j].forEach((m, i) => m.setAttribute('opacity', i === 0 ? (t > 0.3 ? 0.9 : 0) : t > steps[i - 1] + 0.5 ? 0.9 : 0));
      });
    }
  };
}
