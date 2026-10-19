// temperature：大きな温度計の赤い柱がどんどん下がり、0の目もりより下へ。まめは寒さでふるえる（例文 The temperature dropped below zero.）
import { seg, lerp, easeInOut, easeOut, clamp } from '../ease.js';
import { scene, hills, fall, P, blinkAt } from './nature.js';

export function thermo(k, x, y, h = 150, parent) {
  const g = k.g({}, parent);
  k.el('rect', { x: x - 14, y: y - h - 8, width: 28, height: h + 20, rx: 14, fill: '#fff', stroke: k.pal.line, 'stroke-width': 3 }, g);
  k.el('circle', { cx: x, cy: y + 14, r: 20, fill: '#fff', stroke: k.pal.line, 'stroke-width': 3 }, g);
  const bulb = k.el('circle', { cx: x, cy: y + 14, r: 14, fill: k.pal.red }, g);
  const col = k.el('rect', { x: x - 6, y: y - 40, width: 12, height: 54, rx: 6, fill: k.pal.red }, g);
  return { g, set(top, c) { k.set(col, { y: top, height: y + 14 - top, fill: c }); bulb.setAttribute('fill', c); } };
}

export const meta = { duration: 4.2, beats: [[0, '少し寒い'], [1.0, '気温が下がる'], [2.8, '0度より下']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1;
  const { FY } = scene(k, { FY: 240, top: '#C9DBEC', bot: '#EEF4FA', ground: '#EEF3F8', edge: '#DCE5EE' });
  hills(k, FY, '#E2EBF2', '#D6E2EC');
  const TX = 270, TY = 190;
  const th = thermo(k, TX, TY, 150);
  const Z = TY - 50;
  el('line', { x1: TX - 30, y1: Z, x2: TX + 30, y2: Z, stroke: pal.ink, 'stroke-width': 3 });
  k.text(TX + 46, Z, '0', { 'font-size': 18 });
  [-1, 1, 2, 3].forEach((i) => el('line', { x1: TX + 14, y1: Z - i * 26, x2: TX + 24, y2: Z - i * 26, stroke: pal.sub, 'stroke-width': 2 }));
  const snow = fall(k, { n: 22, FY, speed: 36 });
  const b = k.buddy({ x: 130, y: FY, scale: S });
  const sc = k.g({}, b.body);
  el('rect', { x: -28, y: -34, width: 56, height: 9, rx: 4.5, fill: pal.blue }, sc);
  return {
    update(t) {
      const d = easeInOut(seg(t, 0.6, 2.8));
      const top = lerp(Z - 70, Z + 30, d);
      th.set(top, top > Z ? '#5B9BE8' : pal.red);
      snow(t, easeOut(seg(t, 1.6, 2.6)));
      const cold = easeOut(seg(t, 1.4, 2.6));
      const sh = Math.sin(t * 50) * 1.6 * cold;
      P(b, { x: 130 + sh, look: 0.6, armL: lerp(8, 60, cold), armR: lerp(8, 60, cold), squash: 1 - 0.06 * cold, mood: cold > 0.5 ? 'sad' : 'flat', blink: blinkAt(t) });
    }
  };
}
