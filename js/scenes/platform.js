// platform：「3」番線の看板の下に電車が止まり、まめが乗り込むとドアが閉まって発車する（例文 The train leaves from platform three.）
import { seg, lerp, easeInOut, easeIn, hump } from '../ease.js';
import { P, blinkAt, walk, path } from './vehicle.js';
import { train } from './subway.js';

export const meta = { duration: 4.4, beats: [[0, '3番線'], [1.2, '乗り込む'], [2.6, '3番線から発車']] };

export function create(k) {
  const { el, pal } = k;
  const PY = 220;
  k.backdrop({ floorY: PY, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: 30, fill: '#DCE3EE' });
  // 番線の看板（2 と 3）
  [[90, '2', pal.sub], [270, '3', pal.green]].forEach(([x, n, c]) => {
    el('rect', { x: x - 1.5, y: 30, width: 3, height: 24, fill: pal.sub });
    el('rect', { x: x - 26, y: 54, width: 52, height: 40, rx: 6, fill: c, stroke: '#fff', 'stroke-width': 3 });
    k.text(x, 75, n, { 'font-size': 26, fill: '#fff' });
  });
  el('path', { d: 'M 0 126 L 400 126', stroke: '#C9D1DC', 'stroke-width': 3 });
  const tr = train(k, pal.green, '#3E9E5F', 1);
  const door = el('rect', { x: 0, y: 0, width: 20, height: 40, rx: 2, fill: '#E5F1F9', stroke: '#3E9E5F', 'stroke-width': 2 });
  // ホーム（手前）
  el('rect', { x: 0, y: PY, width: 400, height: 80, fill: '#E6EAF0' });
  el('rect', { x: 0, y: PY, width: 400, height: 8, fill: pal.yellow });
  const me = k.buddy({ x: 120, y: 250, scale: 0.86 });
  const X = path([[0.2, 120], [1.3, 250]]);
  const TX = (t) => 300 + 420 * easeIn(seg(t, 2.6, 4.4));
  return {
    update(t) {
      const tx = TX(t);
      tr.set(tx, PY - 2, 1.3);
      const shut = easeInOut(seg(t, 2.0, 2.4));
      k.set(door, { x: tx - 74 + 0, y: PY - 2 - 58 * 1.3, width: 26 * (1 - shut * 0) , opacity: shut });
      const inside = t > 1.75;
      walk(me, X, t, { mood: 'grin', look: 0.6, blink: blinkAt(t), y: 250 - 34 * seg(t, 1.3, 1.75) });
      me.g.setAttribute('display', inside ? 'none' : 'inline');
      void lerp; void hump; void P;
    }
  };
}
