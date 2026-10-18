// look out for：駅の改札前で、ピンクが手をおでこにかざし、人ごみの中にまめがいないか見張っている（例文 Look out for me at the station.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { walkTo } from './run-after.js';
import { P, person, walk, path, thought } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '駅で待つ'], [1.4, '人ごみを見張る'], [3.0, '見つけた！']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 8, width: 400, height: 8, fill: '#E6E1D8' });
  // 駅：案内板と改札
  el('rect', { x: 120, y: 30, width: 160, height: 34, rx: 6, fill: pal.ink });
  el('rect', { x: 134, y: 38, width: 28, height: 18, rx: 5, fill: pal.green }); el('rect', { x: 138, y: 41, width: 9, height: 7, rx: 1.5, fill: '#CFE9F7' }); el('rect', { x: 149, y: 41, width: 9, height: 7, rx: 1.5, fill: '#CFE9F7' });
  [176, 202, 228, 254].forEach((x) => el('rect', { x, y: 44, width: 18, height: 5, rx: 2, fill: '#fff', opacity: 0.7 }));
  [70, 200, 330].forEach((x) => { el('rect', { x: x - 8, y: 150, width: 16, height: 70, rx: 3, fill: '#C9D7E8' }); el('rect', { x: x - 8, y: 150, width: 16, height: 6, rx: 3, fill: pal.blueDark }); });
  // 通り過ぎる人たち（奥）
  const crowd = [['blue', 0], ['yellow', 0.7], ['violet', 1.4], ['blue', 2.2], ['yellow', 2.9]].map(([c, d], i) => {
    const dir = i % 2 ? -1 : 1;
    const b = person(k, c, { x: -40, y: FY - 16, scale: 0.6, facing: dir });
    return { b, xf: path([[d, dir > 0 ? -40 : 440], [d + 2.6, dir > 0 ? 440 : -40]]) };
  });
  const C = k.buddy({ x: 120, y: FY + 6, scale: 0.92, color: pal.coral, dark: pal.coralDark });
  const gxf = path([[2.0, 460], [3.2, 230]]);
  const G = k.buddy({ x: 460, y: FY + 6, scale: 0.85, facing: -1 });
  // 探している相手（まめの顔）の思い浮かべ
  const th = thought(k, 50, 40, -1);
  const face = g({}, th.inner);
  el('rect', { x: -12, y: -14, width: 24, height: 28, rx: 11, fill: pal.mint }, face);
  el('circle', { cx: -4, cy: -4, r: 2, fill: pal.ink }, face); el('circle', { cx: 4, cy: -4, r: 2, fill: pal.ink }, face);
  el('path', { d: 'M -3 3 Q 0 6 3 3', stroke: pal.ink, 'stroke-width': 1.6, fill: 'none' }, face);
  const qm = k.text(18, -10, '?', { 'font-size': 13, fill: pal.sub }, th.inner);
  return {
    update(t) {
      crowd.forEach(({ b, xf }) => walk(b, xf, t, { y: FY - 16, look: 0.4 }));
      // ピンク：手をかざして左右を見わたす（つま先立ちも）
      const found = seg(t, 3.0, 3.3);
      const scan = Math.sin(t * 1.8);
      const fc = found > 0 ? 1 : (scan > 0 ? 1 : -1);
      P(C, { x: 120, y: FY + 6, facing: fc, look: found > 0 ? 0.6 : 0.4 + 0.5 * Math.abs(scan), armR: found > 0 ? lerp(138, 150, found) : lerp(8, 138, easeOut(seg(t, 0.2, 0.6))), armL: 8, lean: found > 0 ? 0 : -3 + 4 * Math.abs(scan), lift: found > 0 ? 6 * hump(seg(t, 3.0, 3.6)) : 3 * easeOut(seg(t, 0.6, 1.0)), mood: found > 0 ? 'happy' : 'flat' });
      // まめが改札から歩いてきて手を振る
      const w = walkTo(gxf, t, 460, -1);
      P(G, { ...w, y: FY + 6, ...(t > 3.2 ? { armR: 140 + 15 * Math.sin(t * 14), mood: 'happy' } : {}) });
      tf(th.g, 172, 96, 0, Math.max(0.001, easeOut(seg(t, 0.5, 0.9)) * (1 - seg(t, 2.9, 3.2))));
    }
  };
}
