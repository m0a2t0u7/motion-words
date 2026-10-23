// automatic：店の自動ドア。まめが近づくと、触れていないのにドアが左右に開く（例文 The store has automatic doors.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';

export const meta = { duration: 3.8, beats: [[0, 'ドアの前へ'], [1.6, '近づくと'], [2.8, 'ひとりでに開く']] };

export function create(k) {
  const { el, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'outdoor' });
  el('rect', { x: 170, y: 60, width: 220, height: FY - 60, fill: '#F6E3C8' });
  el('rect', { x: 170, y: 60, width: 220, height: 26, fill: pal.coral });
  k.text(280, 79, 'SHOP', { 'font-size': 16, 'font-weight': 700, fill: '#fff', 'text-anchor': 'middle' });
  el('rect', { x: 226, y: 104, width: 108, height: FY - 104, fill: '#FFF6E6' });
  [[236, pal.blue], [252, pal.yellow], [268, pal.mint], [284, pal.coral], [300, pal.violet]].forEach(([x, c]) => el('rect', { x, y: 190, width: 12, height: 40, rx: 2, fill: c }));
  el('rect', { x: 230, y: 188, width: 100, height: 4, fill: pal.woodDark });
  const sens = el('circle', { cx: 280, cy: 96, r: 5, fill: pal.red });
  const pl = k.g({}), pr = k.g({});
  [[pl, 0], [pr, 1]].forEach(([g, i]) => {
    el('rect', { x: i ? 280 : 228, y: 106, width: 52, height: FY - 108, rx: 3, fill: '#CFE9F7', stroke: '#fff', 'stroke-width': 4, opacity: 0.95 }, g);
    el('rect', { x: i ? 284 : 232, y: 120, width: 6, height: 40, rx: 3, fill: '#fff', opacity: 0.7 }, g);
  });
  const b = k.buddy({ x: 40, y: FY, scale: 0.95 });
  const xf = (t) => lerp(40, 178, easeInOut(seg(t, 0.2, 2.3)));
  return {
    update(t) {
      const w = walkTo(xf, t, 40), o = easeOut(seg(t, 2.0, 3.0));
      k.tf(pl, -46 * o, 0); k.tf(pr, 46 * o, 0);
      sens.setAttribute('fill', t > 1.5 && t < 3 ? pal.green : pal.red);
      sens.setAttribute('r', 5 + 3 * hump(seg(t, 1.5, 2.2)));
      P(b, { ...w, mood: t > 2.6 ? 'grin' : 'smile', look: 0.5, blink: blinkAt(t) });
    }
  };
}
