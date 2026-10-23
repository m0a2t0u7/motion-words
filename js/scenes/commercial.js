// commercial：まめが、店やオフィスの商業ビルが並ぶ通りを歩く（例文 The street is full of commercial buildings.）
import { seg, lerp, hump } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';

export const meta = { duration: 4.0, beats: [[0, '通りへ'], [1.2, '店が並ぶ'], [3.0, 'ビルだらけ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'outdoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  const cols = ['#BFD8F2', '#F6C9B8', '#CDE8C9'], tops = [96, 70, 112];
  const sign = [pal.coral, pal.blue, pal.yellow];
  const bl = [0, 1, 2].map((i) => {
    const x = 18 + i * 128, w = 108, y = tops[i];
    const o = g({});
    el('rect', { x, y, width: w, height: FY - 6 - y, fill: cols[i], stroke: pal.line, 'stroke-width': 2 }, o);
    el('rect', { x: x - 4, y: y - 6, width: w + 8, height: 8, rx: 2, fill: pal.sub }, o);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) el('rect', { x: x + 10 + c * 31, y: y + 14 + r * 26, width: 22, height: 17, rx: 2, fill: '#fff', opacity: 0.9 }, o);
    el('rect', { x: x + 8, y: FY - 56, width: w - 16, height: 16, rx: 3, fill: sign[i] }, o);
    el('rect', { x: x + 12, y: FY - 38, width: w - 24, height: 32, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, o);
    k.text(x + w / 2, FY - 48, ['SHOP', 'CAFE', 'BANK'][i], { 'font-size': 11, 'font-weight': 700, fill: '#fff', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, o);
    return o;
  });
  const b = k.buddy({ x: -30, y: FY + 12, scale: 0.8 });
  const xf = (t) => lerp(-30, 430, seg(t, 0.1, 3.9));
  return {
    update(t) {
      const w = walkTo(xf, t, -30);
      P(b, { x: w.x, walk: w.walk, armL: w.armL, armR: w.armR, lean: w.lean, facing: 1, look: 0.4 + 0.5 * hump(seg(t, 1, 3)), mood: 'smile', blink: blinkAt(t) });
      bl.forEach((o, i) => o.setAttribute('opacity', 1));
    }
  };
}
