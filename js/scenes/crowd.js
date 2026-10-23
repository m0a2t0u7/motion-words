// crowd：駅前に人が次々と集まり、大勢の群衆になる。まめもその中へ（例文 A big crowd gathered at the station.）
import { seg, lerp, easeInOut, clamp } from '../ease.js';
import { P, blinkAt, walkTo, path } from './member.js';
import { COL } from './queue-up.js';

export const meta = { duration: 4.4, beats: [[0, '駅前'], [1.4, '人が集まる'], [3.4, '大勢の群衆']] };

export function create(k) {
  const { el, pal } = k, FY = 226;
  k.backdrop({ floorY: FY });
  // 駅舎
  el('rect', { x: 70, y: 70, width: 260, height: FY - 70, fill: '#F1E6D8' });
  el('path', { d: 'M 56 74 L 200 34 L 344 74 Z', fill: '#C98A5A' });
  el('rect', { x: 150, y: 80, width: 100, height: 22, rx: 4, fill: pal.ink });
  k.text(200, 92, 'STATION', { 'font-size': 13, fill: '#fff' });
  el('circle', { cx: 200, cy: 56, r: 11, fill: '#fff', stroke: pal.ink, 'stroke-width': 2 });
  el('path', { d: 'M 200 56 V 49 M 200 56 L 205 58', stroke: pal.ink, 'stroke-width': 2, 'stroke-linecap': 'round' });
  for (let i = 0; i < 4; i++) el('rect', { x: 90 + i * 64, y: 116, width: 40, height: 40, rx: 3, fill: '#DDEFFA' });
  el('rect', { x: 0, y: FY, width: 400, height: 74, fill: '#E7E2DA' });
  for (let x = 0; x < 400; x += 26) el('line', { x1: x, y1: FY, x2: x - 10, y2: 300, stroke: '#DAD3C8', 'stroke-width': 1.2 });
  // 群衆：奥の列から描く（奥ほど小さく高い位置）
  const keys = Object.keys(COL);
  const ppl = [];
  const rows = [[FY + 4, 0.48, 7], [FY + 22, 0.56, 6], [FY + 42, 0.64, 5]];
  let n = 0;
  rows.forEach(([y, s, m], r) => {
    for (let i = 0; i < m; i++) {
      const tx = 70 + (i + 0.5) * (260 / m) + (r % 2) * 12, from = i < m / 2 ? -40 - r * 20 : 440 + r * 20;
      const c = ['coral', 'blue', 'yellow', 'violet'][(n + r) % 4];
      const t0 = 0.1 + ((n * 7) % 13) * 0.17;
      const b = k.buddy({ x: from, y, scale: s, color: COL[c][0], dark: COL[c][1], facing: from < 0 ? 1 : -1 });
      ppl.push({ b, xf: path([[t0, from], [t0 + 1.4, tx]]), from, n: n++ });
      if (r === 2 && i === 1) { me = k.buddy({ x: -60, y: y + 4, scale: 0.72 }); }
    }
  });
  var me;
  const mx = path([[1.6, -60], [3.0, 150]]);
  return {
    update(t) {
      ppl.forEach(({ b, xf, from, n }) => {
        const w = walkTo(xf, t, from, from < 0 ? 1 : -1);
        P(b, { x: w.x, walk: w.walk, armL: w.armL, armR: w.armR, lean: w.lean, facing: w.m > 0.05 ? w.facing : (n % 3 === 0 ? -1 : 1) * (from < 0 ? 1 : -1), blink: blinkAt(t, n * 0.3), look: 0.2, mood: n % 2 ? 'open' : 'smile' });
      });
      const w = walkTo(mx, t, -60, 1);
      P(me, { x: w.x, walk: w.walk, armL: w.armL, armR: w.armR, lean: w.lean, facing: 1, blink: blinkAt(t), look: 0.5, mood: t > 3.2 ? 'open' : 'smile' });
    }
  };
}
