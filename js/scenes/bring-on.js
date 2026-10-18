// bring on：まめがダンベルを何度も何度も上げ下げする（回数が増える）。やりすぎた結果、ひざと腰に痛み（赤い星）が出て顔をしかめる（例文 Too much exercise can bring on pain.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';
import { held } from './dig.js';
import { star } from './get-on-with.js';

export const meta = { duration: 4.4, beats: [[0, '運動する'], [1.6, 'やりすぎる'], [3.4, '痛みが出た']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 110, y: 238, width: 180, height: 10, rx: 4, fill: pal.violet, opacity: 0.5 });
  const cnt = k.text(320, 80, '0', { 'font-size': 30, fill: pal.ink });
  el('rect', { x: 286, y: 56, width: 68, height: 48, rx: 8, fill: 'none', stroke: pal.line, 'stroke-width': 3 });
  const b = k.buddy({ x: 200, y: FY, scale: 1 });
  const db = [0, 1].map(() => { const d = g({}); el('rect', { x: -2, y: -10, width: 4, height: 20, fill: pal.ink }, d); el('rect', { x: -7, y: -14, width: 14, height: 6, rx: 2, fill: pal.sub }, d); el('rect', { x: -7, y: 8, width: 14, height: 6, rx: 2, fill: pal.sub }, d); return d; });
  const pains = [[178, 214], [226, 170]].map(() => { const s = g({}); star(k, s, 11, pal.red); return s; });
  const sweat = el('path', { d: 'M 0 -6 Q 4 0 0 4 Q -4 0 0 -6 Z', fill: pal.water });
  return {
    update(t) {
      const reps = seg(t, 0.2, 3.0) * 12, ph = reps % 1, up = hump(ph);
      const stop = easeOut(seg(t, 3.0, 3.3));
      const arm = t < 3.0 ? lerp(30, 175, up) : lerp(30, 10, stop);
      const tired = seg(t, 1.5, 3.0);
      b.pose({ armL: arm, armR: arm, squash: 1 - 0.1 * (1 - up) * (t < 3 ? 1 : 0) - 0.08 * stop, lean: stop * 12 + Math.sin(t * 20) * tired, look: 0.3, mood: stop > 0.3 ? 'sad' : tired > 0.5 ? 'flat' : 'grin', blink: stop * 0.7 });
      held(k, b, 1, db[0], 'R', 90); held(k, b, 1, db[1], 'L', 90);
      cnt.textContent = String(Math.min(12, Math.floor(reps + 0.5)));
      [[178, 214], [226, 170]].forEach(([x, y], i) => { const q = seg(t, 3.1 + i * 0.2, 3.5 + i * 0.2); tf(pains[i], x, y, t * 60, (backOut(q) || 0.001) * (1 + 0.1 * Math.sin(t * 14))); pains[i].setAttribute('opacity', q > 0 ? 1 : 0); });
      k.set(sweat, { transform: `translate(232 ${150 + ((t * 1.2) % 1) * 20})`, opacity: tired > 0.3 ? 1 - ((t * 1.2) % 1) : 0 });
    }
  };
}
