// pork：まめと友だちが食卓で、豚肉のしょうが焼きとごはんを食べる。肉には小さなブタの旗（例文 We had pork with rice.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { fork } from './restaurant.js';
import { plateG, bowlG } from './flour.js';
import { cloth, eatAt } from './spinach.js';

export const meta = { duration: 4.4, beats: [[0, '豚肉とごはん'], [1.0, 'いっしょに食べる'], [3.4, 'おいしい']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 150, y: 44, width: 100, height: 70, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const lampG = g({}); el('line', { x1: 200, y1: 0, x2: 200, y2: 26, stroke: pal.sub, 'stroke-width': 2 }, lampG); el('path', { d: 'M 184 40 Q 200 20 216 40 Z', fill: pal.yellow }, lampG);
  const me = k.buddy({ x: 96, y: FY - 2, scale: S });
  const fr = k.buddy({ x: 304, y: FY - 2, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const TY = 212; cloth(k, 40, 360, TY, FY, '#FFF4DE', '#F2C14E');
  const mk = (x) => {
    const p = g({}); tf(p, x, TY); plateG(k, p, 64);
    const meat = g({}, p);
    [[-12, -6, -8], [2, -8, 6], [14, -5, -4]].forEach(([mx, my, r]) => { el('path', { d: `M ${mx - 10} ${my} Q ${mx} ${my - 8} ${mx + 10} ${my} Q ${mx} ${my + 4} ${mx - 10} ${my} Z`, fill: '#C9855A', transform: `rotate(${r} ${mx} ${my})` }, meat); el('path', { d: `M ${mx - 6} ${my - 1} q 6 -3 12 0`, stroke: '#F6D6B8', 'stroke-width': 1.6, fill: 'none' }, meat); });
    // ブタの旗
    el('line', { x1: 4, y1: -8, x2: 4, y2: -30, stroke: '#C9A577', 'stroke-width': 1.5 }, p);
    el('rect', { x: 4, y: -32, width: 18, height: 12, rx: 2, fill: '#fff', stroke: pal.line }, p);
    el('circle', { cx: 13, cy: -26, r: 4.5, fill: '#F7B5C0' }, p); el('ellipse', { cx: 13, cy: -25, rx: 2, ry: 1.5, fill: '#E58A9C' }, p);
    return meat;
  };
  mk(140); mk(260);
  const rice = (x) => { const B = bowlG(k, undefined, 34, '#E86F57', '#C9533D'); tf(B.g, x, TY); el('path', { d: 'M -15 -14 Q 0 -30 15 -14 Z', fill: '#fff' }, B.fill); };
  rice(183); rice(217);
  const fa = fork(k), fb = fork(k);
  const ba = g({}); el('ellipse', { rx: 6, ry: 3, fill: '#C9855A' }, ba);
  const bb = g({}); el('circle', { r: 4.5, fill: '#fff' }, bb);
  return {
    update(t) {
      const a = hump(seg(t, 0.6, 1.6)), a2 = hump(seg(t, 2.0, 3.0)), b = hump(seg(t, 1.2, 2.2)), b2 = hump(seg(t, 2.6, 3.6));
      P(me, { x: 96, y: FY - 2, look: 0.6, mood: (t > 1.1 && t < 1.7) || (t > 2.5 && t < 3.1) ? (Math.sin(t * 22) > 0 ? 'open' : 'smile') : t > 3.4 ? 'grin' : 'smile', blink: blinkAt(t) });
      const second = t > 2.0;
      eatAt(k, me, S, fa, second ? a2 : a, second ? { x: 183, y: TY - 20 } : { x: 136, y: TY - 10 }, second ? bb : ba);
      ba.setAttribute('opacity', !second && a > 0.05 && t < 1.15 ? 1 : 0);
      bb.setAttribute('opacity', second && a2 > 0.05 && t < 2.55 ? 1 : 0);
      P(fr, { x: 304, y: FY - 2, facing: -1, look: 0.6, mood: (t > 1.7 && t < 2.3) ? (Math.sin(t * 22) > 0 ? 'open' : 'smile') : t > 3.4 ? 'grin' : 'smile', blink: blinkAt(t, 1) });
      eatAt(k, fr, S, fb, t < 2.4 ? b : b2, { x: 262, y: TY - 10 }, null);
    }
  };
}
