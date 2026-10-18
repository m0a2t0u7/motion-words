// look at：美術館。まめが歩いて来て壁の絵の前で立ち止まり、顔を上げて絵をじっと見る（視線の点線）（例文 She looked at the painting on the wall.）
import { seg, lerp, easeInOut, easeOut } from '../ease.js';
import { gait } from './dig.js';

export const meta = { duration: 4.0, beats: [[0, '歩いて来る'], [1.6, '絵に目を向ける'], [3.0, 'じっと見る']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: 222, width: 400, height: 14, fill: '#ECE6DC' });
  // 額縁の絵
  el('rect', { x: 230, y: 44, width: 120, height: 90, rx: 3, fill: '#C9A577' });
  el('rect', { x: 240, y: 54, width: 100, height: 70, fill: '#BFE3F5' });
  el('path', { d: 'M 240 124 L 275 84 L 300 108 L 318 92 L 340 124 Z', fill: '#7FD3A0' });
  el('circle', { cx: 318, cy: 70, r: 8, fill: pal.yellow });
  el('rect', { x: 268, y: 144, width: 44, height: 10, rx: 2, fill: '#fff', stroke: pal.line });
  el('rect', { x: 30, y: 60, width: 60, height: 70, rx: 3, fill: '#C9A577' }); el('rect', { x: 38, y: 68, width: 44, height: 54, fill: '#F6D6E0' });
  const gaze = el('path', { d: '', stroke: pal.mintDark, 'stroke-width': 2.5, 'stroke-dasharray': '3 6', fill: 'none', 'stroke-linecap': 'round' });
  const b = k.buddy({ x: -30, y: FY, scale: 0.95 });
  const xf = (t) => lerp(-30, 220, easeInOut(seg(t, 0.1, 1.6)));
  return {
    update(t) {
      const p = gait(xf, t, -30);
      const up = easeInOut(seg(t, 1.6, 2.1));
      b.pose({ x: p.x, walk: p.walk, armL: p.armL, armR: p.armR, lean: p.lean - 8 * up, look: lerp(0.4, 1, up), mood: t > 2.4 ? 'open' : 'smile' });
      const ex = p.x + 16, ey = 168 - 4 * up;
      const q = easeOut(seg(t, 2.0, 2.6));
      k.set(gaze, { d: `M ${ex} ${ey} L ${lerp(ex, 290, q)} ${lerp(ey, 94, q)}`, opacity: q > 0 ? 0.9 : 0 });
    }
  };
}
