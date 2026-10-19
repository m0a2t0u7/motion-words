// security：保安検査の列に並ぶまめ。前の人がかばんをトレーに乗せてX線の機械に通し、門型の探知機をくぐる間、まめは待つ（例文 We waited in line at security.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { P, blinkAt, hall, person, walk, path } from './vehicle.js';

export const meta = { duration: 4.4, beats: [[0, '検査の列'], [1.4, '1人ずつ検査'], [3.0, 'まだ待つ']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = 236;
  hall(k, FY, { win: false });
  // X線の機械とベルト（奥）、探知ゲート
  el('rect', { x: 0, y: 172, width: 170, height: 12, rx: 4, fill: '#5A6478' });
  el('rect', { x: 50, y: 120, width: 70, height: 56, rx: 6, fill: '#C9D1DC' });
  el('rect', { x: 60, y: 140, width: 50, height: 36, fill: '#2B3446' });
  el('path', { d: 'M 180 236 L 180 120 L 240 120 L 240 236', stroke: '#9AA5B4', 'stroke-width': 10, fill: 'none' });
  const lamp = el('circle', { cx: 210, cy: 112, r: 6, fill: pal.green });
  const tray = g({}); el('rect', { x: -20, y: -8, width: 40, height: 8, rx: 2, fill: '#9AA5B4' }, tray); el('rect', { x: -12, y: -22, width: 24, height: 16, rx: 4, fill: pal.violet }, tray);
  const front = person(k, 'yellow', { x: 260, y: FY + 6, scale: 0.72, facing: -1 });
  const q = ['blue', 'coral'].map((c, i) => person(k, c, { x: 304 + i * 44, y: FY + 6, scale: 0.72, facing: -1 }));
  const me = k.buddy({ x: 392, y: FY + 6, scale: 0.72, facing: -1 });
  return {
    update(t) {
      // 前の人：トレーを置く（0.4〜1.0）→ ゲートを左へくぐる（1.4〜2.8）
      const fx = path([[1.2, 230], [2.8, 20]])(t);
      walk(front, path([[0, 260], [1.2, 260], [3.0, -60]]), t, { facing: -1, look: 0.4, blink: blinkAt(t) });
      if (t > 0.3 && t < 1.0) front.pose({ armR: 70 * hump(seg(t, 0.3, 1.0)) + 8 });
      const tp = seg(t, 1.0, 3.8);
      k.tf(tray, lerp(150, -30, tp), 172);
      tray.setAttribute('opacity', tp < 1 ? 1 : 0);
      k.set(lamp, { fill: t > 1.6 && t < 2.2 ? pal.yellow : pal.green });
      // 列が少しずつ進む（まめは最後尾で待つ）
      const st = 40 * easeInOut(seg(t, 2.6, 3.4));
      q.forEach((b, i) => P(b, { x: 304 + i * 44 - st, facing: -1, walk: st * 0.2, look: 0.3, mood: 'flat', blink: blinkAt(t, i) }));
      P(me, { x: 392 - st, facing: -1, walk: st * 0.2, look: t > 3.6 ? 0 : 0.5, mood: t > 3.4 ? 'flat' : 'smile', blink: blinkAt(t, 0.6), armL: 20, armR: 20 });
      void fx; void hump;
    }
  };
}
