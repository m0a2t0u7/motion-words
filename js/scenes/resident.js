// resident：マンションの住民が、ごみをびん・缶・紙に分けてそれぞれの箱へ入れる（例文 Residents must separate their trash.）
import { seg, lerp, easeInOut, easeIn, hump, clamp } from '../ease.js';
import { CO, hp, reach, P, blinkAt, walkTo, path, sc } from './member.js';

export const meta = { duration: 4.4, beats: [[0, 'ごみを持つ'], [1.2, '分けて入れる'], [3.6, '分別できた']] };

function item(k, kind) {
  const g = k.g({}), { el, pal } = k;
  if (kind === 0) { el('rect', { x: -4, y: -16, width: 8, height: 18, rx: 3, fill: '#7CC59A' }, g); el('rect', { x: -2, y: -21, width: 4, height: 6, fill: '#7CC59A' }, g); }
  if (kind === 1) { el('rect', { x: -5, y: -12, width: 10, height: 14, rx: 2, fill: '#C9D1DC' }, g); el('rect', { x: -5, y: -8, width: 10, height: 5, fill: pal.blue }, g); }
  if (kind === 2) { el('rect', { x: -9, y: -10, width: 18, height: 12, rx: 1, fill: '#F4F0E6', stroke: pal.sub, 'stroke-width': 1 }, g); el('path', { d: 'M -6 -6 h 12 M -6 -2 h 8', stroke: pal.sub, 'stroke-width': 1.2 }, g); }
  return g;
}

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.8, FY = 236;
  k.backdrop({ floorY: FY });
  // マンション
  el('rect', { x: 0, y: 20, width: 120, height: FY - 20, fill: '#EDE3D6' });
  for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) { el('rect', { x: 14 + c * 54, y: 36 + r * 40, width: 40, height: 24, rx: 2, fill: '#DDEFFA' }); el('rect', { x: 10 + c * 54, y: 60 + r * 40, width: 48, height: 4, fill: '#CBBBA6' }); }
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#E7E2DA' });
  // ごみ置き場（屋根と3つの箱）
  el('rect', { x: 160, y: 120, width: 240, height: 10, rx: 3, fill: '#8FA3B8' });
  el('rect', { x: 164, y: 130, width: 6, height: FY - 130, fill: '#A9B7C6' }); el('rect', { x: 392, y: 130, width: 6, height: FY - 130, fill: '#A9B7C6' });
  const BX = [190, 280, 370], BC = [['#59C27A', '#3E9E5D'], [pal.blue, pal.blueDark], [pal.yellow, pal.yellowDark]];
  BX.forEach((x, i) => {
    k.shadow(x, FY + 1, 22, 4);
    el('path', { d: `M ${x - 20} ${FY - 50} L ${x + 20} ${FY - 50} L ${x + 17} ${FY} L ${x - 17} ${FY} Z`, fill: BC[i][0] });
    el('rect', { x: x - 22, y: FY - 54, width: 44, height: 7, rx: 3, fill: BC[i][1] });
    el('circle', { cx: x, cy: FY - 26, r: 11, fill: '#fff' });
    const ic = item(k, i); tf(ic, x, FY - 24, 0, 0.9);
  });
  const nb = k.buddy({ x: 34, y: FY, scale: 0.7, facing: 1, ...CO(k) });
  const b = k.buddy({ x: 70, y: FY, scale: S });
  const items = [0, 1, 2].map((i) => item(k, i));
  // 立ち止まる位置と入れる時刻
  const stops = [[0.4, 1.3, 2.0], [2.1, 2.5, 3.0], [3.1, 3.5, 4.0]].map((a, i) => ({ at: BX[i] - 46, tA: a[0], tD: a[1] + 0.2, tE: a[2] }));
  const bx = path([[0.1, 70], [0.9, stops[0].at], [2.0, stops[0].at], [2.5, stops[1].at], [3.0, stops[1].at], [3.5, stops[2].at]]);
  return {
    update(t) {
      const w = walkTo(bx, t, 70, 1);
      P(b, { x: w.x, walk: w.walk, armL: 14, armR: 30, lean: w.lean, blink: blinkAt(t), look: 0.7, mood: t > 4 ? 'grin' : 'smile' });
      stops.forEach((s, i) => {
        const up = hump(seg(t, s.tD - 0.45, s.tD + 0.35));
        if (t > s.tD - 0.5 && t < s.tD + 0.4) b.pose({ armR: lerp(30, reach(b, S, 'R', BX[i] - 4, FY - 66), up), lean: 6 * up });
        const h = hp(b, S, 'R', 32);
        const prev = i === 0 ? 0 : stops[i - 1].tD + 0.3;
        if (t < prev) tf(items[i], 0, -200, 0, 0.001);
        else if (t < s.tD) tf(items[i], h.x, h.y + 6);
        else { const p = easeIn(seg(t, s.tD, s.tD + 0.3)); tf(items[i], BX[i], lerp(FY - 66, FY - 30, p), 0, sc(1 - seg(t, s.tD + 0.2, s.tD + 0.3))); }
      });
      P(nb, { x: 34, blink: blinkAt(t, 1), look: 0.5, armR: 30, mood: 'smile' });
    }
  };
}
