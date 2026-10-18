// get away：どろぼうが袋を抱えて店から走って逃げ去り、パトカーが着いた時にはもういない（例文 The thief got away before the police came.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { held } from './dig.js';
import { person, path, walk } from './queue-up.js';
import { storeFront } from './lock-up.js';

export const meta = { duration: 4.2, beats: [[0, '店から逃げる'], [1.6, '走り去る'], [3.6, 'もういない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  const st = storeFront(k, FY);
  st.D.set(0.85);
  const S = 0.8;
  const th = person(k, 'violet', { x: 178, y: FY + 6, scale: S });
  const mask = el('rect', { x: -28, y: -62, width: 56, height: 14, rx: 6, fill: pal.ink, opacity: 0.85 }, th.body);
  th.body.insertBefore(mask, th.body.children[4]);
  const sack = g({});
  el('path', { d: 'M -12 4 Q -16 26 0 28 Q 16 26 12 4 Z', fill: '#C9A577' }, sack);
  el('rect', { x: -5, y: 0, width: 10, height: 6, rx: 2, fill: '#A88A60' }, sack);
  const car = g({});
  el('rect', { x: -60, y: -40, width: 120, height: 30, rx: 10, fill: '#fff', stroke: pal.ink, 'stroke-width': 2.5 }, car);
  el('path', { d: 'M -36 -40 L -24 -60 L 26 -60 L 38 -40 Z', fill: '#fff', stroke: pal.ink, 'stroke-width': 2.5 }, car);
  el('rect', { x: -60, y: -28, width: 120, height: 8, fill: pal.blueDark }, car);
  const siren = el('rect', { x: -8, y: -68, width: 16, height: 8, rx: 3, fill: pal.red }, car);
  [-36, 36].forEach((x) => { el('circle', { cx: x, cy: -10, r: 11, fill: pal.ink }, car); el('circle', { cx: x, cy: -10, r: 4, fill: '#9AA4B5' }, car); });
  const xf = path([[0.2, 178], [2.2, 470]]);
  return {
    update(t) {
      walk(th, xf, t, { y: FY + 6, look: t < 0.6 ? -0.6 : 0.6, mood: 'open', lean: 12 });
      th.pose({ walk: t * 15, armL: 10 + 30 * Math.sin(t * 15), armR: 70 });
      held(k, th, S, sack, 'R', 0);
      const c = easeOut(seg(t, 2.6, 3.6));
      tf(car, lerp(-80, 90, c), FY + 22, 0, 0.9);
      siren.setAttribute('fill', Math.floor(t * 6) % 2 ? pal.red : pal.blue);
      car.setAttribute('opacity', t > 2.5 ? 1 : 0);
      void hump; void easeInOut; void st;
    }
  };
}
