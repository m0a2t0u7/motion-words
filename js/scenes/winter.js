// winter：冬、雪がたくさん降り、家の屋根にも地面にもどんどん積もる。まめは雪かきのスコップを持って見上げる（例文 It snows a lot here in winter.）
import { seg, lerp, easeInOut, easeOut, clamp } from '../ease.js';
import { scene, fall, held, P, blinkAt } from './nature.js';

export const meta = { duration: 4.4, beats: [[0, '冬の町'], [1.2, 'どんどん降る'], [3.2, 'たくさん積もった']] };

export function create(k) {
  const { el, g, pal } = k, S = 1;
  const { FY } = scene(k, { FY: 240, top: '#B8C9DA', bot: '#E8EEF4', ground: '#F7FAFD', edge: '#E3EAF1' });
  el('rect', { x: 30, y: FY - 100, width: 130, height: 100, fill: '#D9B79A' });
  el('path', { d: `M 18 ${FY - 96} L 95 ${FY - 150} L 172 ${FY - 96} Z`, fill: '#8E6B5A' });
  el('rect', { x: 60, y: FY - 70, width: 32, height: 28, rx: 3, fill: '#FFE6B0' });
  el('rect', { x: 110, y: FY - 56, width: 26, height: 56, rx: 3, fill: '#8E6B5A' });
  const roof = el('path', { d: '', fill: '#fff' });
  const pile = el('path', { d: '', fill: '#fff', stroke: '#E1E9F1', 'stroke-width': 2 });
  const b = k.buddy({ x: 260, y: FY, scale: S, facing: -1 });
  const sc = g({}, b.body);
  el('rect', { x: -28, y: -34, width: 56, height: 9, rx: 4.5, fill: pal.red }, sc);
  const shovel = g({});
  el('rect', { x: -2, y: -6, width: 4, height: 40, fill: pal.woodDark }, shovel);
  el('path', { d: 'M -10 32 H 10 L 8 50 H -8 Z', fill: pal.blue }, shovel);
  const snow = fall(k, { n: 60, FY, speed: 60 });
  return {
    update(t) {
      snow(t);
      const a = easeInOut(seg(t, 0.4, 4.0)), r = 4 + 14 * a, p = 4 + 34 * a;
      roof.setAttribute('d', `M 14 ${FY - 94} L 95 ${FY - 150} L 176 ${FY - 94} Q 176 ${FY - 94 - r * 0.4} 172 ${FY - 98 - r * 0.2} L 95 ${FY - 152 - r} L 18 ${FY - 98 - r * 0.2} Z`);
      pile.setAttribute('d', `M 0 ${FY + 4} L 0 ${FY - p} Q 60 ${FY - p - 8} 120 ${FY - p + 4} Q 200 ${FY - p * 0.6} 400 ${FY - p * 0.5} V ${FY + 4} Z`);
      const up = easeOut(seg(t, 1.0, 1.6));
      P(b, { facing: -1, look: -0.2, lean: -6 * up, armR: 30, armL: 20, mood: t > 3.2 ? 'open' : 'smile', blink: blinkAt(t) });
      b.body.children[3].setAttribute('transform', `translate(0 ${(-5 * up).toFixed(1)})`);
      held(k, b, S, shovel, 'R', 0);
    }
  };
}
