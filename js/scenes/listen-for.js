// listen for：玄関のドアのそばで、耳に手を当ててチャイムの音を待つ。時計が昼から夕方へ進む（例文 I listened for the doorbell all afternoon.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { faceAt } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, '昼すぎ'], [1.8, '耳をすます'], [3.6, '夕方まで待つ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  // ドア＋チャイム
  el('rect', { x: 290, y: 100, width: 80, height: 136, rx: 4, fill: pal.blue });
  el('rect', { x: 298, y: 110, width: 64, height: 40, rx: 4, fill: '#fff', opacity: 0.3 });
  el('circle', { cx: 300, cy: 176, r: 5, fill: pal.yellow });
  el('rect', { x: 268, y: 140, width: 12, height: 18, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('circle', { cx: 274, cy: 149, r: 3, fill: pal.sub });
  // 窓と時計
  const sky = el('rect', { x: 40, y: 50, width: 80, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const sun = el('circle', { r: 9, fill: pal.yellow });
  const C = g({}); tf(C, 180, 74);
  el('circle', { r: 22, fill: '#fff', stroke: pal.ink, 'stroke-width': 3 }, C);
  for (let i = 0; i < 12; i++) el('line', { x1: 0, y1: -18, x2: 0, y2: -15, stroke: pal.sub, 'stroke-width': 2, transform: `rotate(${i * 30})` }, C);
  const hh = el('line', { x1: 0, y1: 0, x2: 0, y2: -11, stroke: pal.ink, 'stroke-width': 3.2, 'stroke-linecap': 'round' }, C);
  const mh = el('line', { x1: 0, y1: 0, x2: 0, y2: -16, stroke: pal.ink, 'stroke-width': 2.2, 'stroke-linecap': 'round' }, C);
  const tint = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#FF9E5E', opacity: 0 });
  const b = k.buddy({ x: 200, y: FY, scale: 0.95 });
  return {
    update(t) {
      const day = seg(t, 0.3, 4.1), hrs = 12 + 5 * day;
      tf(hh, 0, 0, hrs * 30); tf(mh, 0, 0, hrs * 360);
      k.set(sun, { cx: lerp(64, 104, day), cy: lerp(66, 104, day) });
      k.set(sky, { fill: day > 0.7 ? '#FCD9B8' : '#DDEFFA' });
      tint.setAttribute('opacity', 0.12 * day);
      const lean = 8 + 8 * hump(seg(t, 1.6, 2.6)) + 5 * hump(seg(t, 3.0, 3.8));
      b.pose({ armR: 152 + 4 * Math.sin(t * 2), armL: 10, lean, mood: 'flat', look: 0.9, blink: hump(seg(t, 1.1, 1.25)) + hump(seg(t, 3.9, 4.05)), squash: 1 + 0.01 * Math.sin(t * 2) });
      faceAt(b, 6, -1);
    }
  };
}
