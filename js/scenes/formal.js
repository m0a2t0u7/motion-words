// formal：式典に正式なスーツで出席。ジャケットとネクタイのまめが、赤い絨毯を歩いて式典の幕の前へ（例文 He wore a formal suit to the ceremony.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';

export const meta = { duration: 3.8, beats: [[0, 'スーツ姿で'], [1.2, '式典へ歩く'], [3.0, '式典の前に立つ']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 90, y: 40, width: 230, height: 60, rx: 6, fill: pal.red });
  k.text(205, 78, 'CEREMONY', { 'font-size': 20, 'font-weight': 700, fill: '#fff', 'text-anchor': 'middle' });
  [100, 300].forEach((x) => { el('rect', { x: x - 6, y: 100, width: 12, height: FY - 100, fill: pal.woodDark }); el('circle', { cx: x, cy: 98, r: 9, fill: pal.yellow }); });
  el('rect', { x: 0, y: FY - 4, width: 400, height: 16, fill: '#D9534F' });
  const b = k.buddy({ x: 40, y: FY + 2, scale: 0.95 });
  const suit = g({}, b.body);
  el('path', { d: 'M -23 -60 L 23 -60 L 25 -14 L -25 -14 Z', fill: '#38465E' }, suit);
  el('path', { d: 'M -8 -60 L 8 -60 L 0 -34 Z', fill: '#fff' }, suit);
  el('path', { d: 'M 0 -58 L -4 -52 L 0 -40 L 4 -52 Z', fill: pal.red }, suit);
  el('path', { d: 'M -8 -60 L 0 -34 L -14 -26 L -18 -60 Z M 8 -60 L 0 -34 L 14 -26 L 18 -60 Z', fill: '#2C384D' }, suit);
  [-6, 0].forEach((y) => el('circle', { cx: 3, cy: -22 + y * 0, r: 1.8, fill: pal.yellow }, suit));
  const xf = (t) => lerp(40, 205, easeInOut(seg(t, 0.4, 3.0)));
  return {
    update(t) {
      const w = walkTo(xf, t, 40);
      P(b, { ...w, y: FY + 2, mood: 'smile', look: 0.5, blink: blinkAt(t) });
    }
  };
}
