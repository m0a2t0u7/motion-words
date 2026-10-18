// show around：まめが来客を連れてオフィスを歩き、ボード・コーヒー・会議室を順に指さして案内する（例文 Let me show you around the office.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, walkTo, win } from './run-after.js';
import { reach } from './weigh.js';

export const meta = { duration: 4.8, beats: [[0, 'オフィスへ'], [1.6, '順に見せる'], [4.0, 'ひと回り']] };

const path = (keys) => (t) => {
  for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) { const [t0, x0] = keys[i - 1], [t1, x1] = keys[i]; return lerp(x0, x1, easeInOut(seg(t, t0, t1))); }
  return keys[keys.length - 1][1];
};

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  // ボード
  el('rect', { x: 100, y: 52, width: 76, height: 54, rx: 4, fill: '#fff', stroke: '#B8C1CE', 'stroke-width': 4 });
  el('path', { d: 'M 110 94 L 126 80 L 140 88 L 164 64', stroke: pal.blue, 'stroke-width': 3, fill: 'none' });
  // コーヒーマシン（カウンターの上）
  el('rect', { x: 226, y: 150, width: 88, height: 8, rx: 3, fill: pal.wood }); el('rect', { x: 232, y: 158, width: 76, height: 78, fill: '#F2DDBB' });
  el('rect', { x: 248, y: 112, width: 34, height: 38, rx: 5, fill: '#5A6480' }); el('rect', { x: 256, y: 122, width: 18, height: 8, rx: 2, fill: pal.blue });
  el('rect', { x: 260, y: 140, width: 10, height: 10, rx: 2, fill: '#fff' });
  // 会議室のドア
  el('rect', { x: 336, y: 108, width: 52, height: 128, rx: 3, fill: '#BFE3F5', stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 344, y: 120, width: 36, height: 12, rx: 2, fill: '#fff' });
  el('circle', { cx: 380, cy: 176, r: 3.5, fill: pal.ink });
  el('rect', { x: 20, y: 150, width: 20, height: 24, rx: 4, fill: pal.coral }); el('circle', { cx: 30, cy: 140, r: 16, fill: pal.green });
  const S = 0.78;
  const v = k.buddy({ x: -60, y: FY + 4, scale: S * 0.95, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 0, y: FY + 6, scale: S });
  const gx = path([[0, 10], [1.0, 82], [1.8, 82], [2.6, 196], [3.3, 196], [4.1, 296]]);
  const vx = (t) => gx(t - 0.25) - 64;
  const spots = [[1.0, 1.8, 140, 80], [2.6, 3.3, 262, 126], [4.1, 9, 360, 140]];
  return {
    update(t) {
      const wk = walkTo(gx, t, 10, 1);
      let arm = wk.armR, tgt = null;
      spots.forEach(([a, z, x, y]) => { const p = easeInOut(seg(t, a, a + 0.3)) * (1 - easeInOut(seg(t, z - 0.25, z))); if (p > 0) tgt = [x, y, p]; });
      P(b, { ...wk, facing: 1, look: 0.8, mood: 'grin', blink: blinkAt(t) });
      if (tgt) { const r = reach(b, S, 'R', tgt[0], tgt[1]); arm = lerp(wk.armR, r, tgt[2]); }
      P(b, { ...wk, facing: tgt ? 1 : 1, armR: arm, look: tgt ? 1 : 0.8, mood: 'grin', blink: blinkAt(t) });
      const wv = walkTo(vx, t, -54, 1);
      P(v, { ...wv, facing: 1, look: tgt ? 1 : 0.6, lean: wv.lean - (tgt ? 4 * tgt[2] : 0), mood: tgt && tgt[2] > 0.5 ? 'open' : 'smile', blink: blinkAt(t, 1) });
    }
  };
}
