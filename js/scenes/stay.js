// stay：今日のカレンダー。玄関へ向かいかけたまめが、かばんを置いて引き返し、ソファに座って家で過ごす（例文 I will stay home today.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { hp } from './dig.js';
import { P, blinkAt, sofa, walkTo } from './run-after.js';
import { path, door } from './queue-up.js';
import { calendar } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '出かける？'], [1.4, 'やめておく'], [3.0, '家にいる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 10, width: 400, height: 10, fill: '#ECE6DC' });
  // 玄関ドア（閉じたまま）
  el('rect', { x: 312, y: FY - 130, width: 82, height: 130, rx: 4, fill: '#E9DCC8' });
  door(k, { x: 320, y: FY - 124, w: 66, h: 124, hinge: 'L', color: pal.coral });
  const cal = calendar(k, 220, 48, 50); cal.set('19'); k.text(220, 108, 'today', { 'font-size': 13, fill: pal.sub });
  el('rect', { x: 60, y: 50, width: 80, height: 60, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const sf = sofa(k, 96, FY, 130, pal.blue, pal.blueDark);
  const me = k.buddy({ x: 190, y: FY, scale: 0.9 });
  const n0 = k.root.children.length; sf.front();
  const fg = g({}); Array.from(k.root.children).slice(n0, -1).forEach((n) => fg.appendChild(n));
  const bag = g({});
  el('path', { d: 'M -8 0 Q -8 -10 0 -10 Q 8 -10 8 0', stroke: pal.coffee, 'stroke-width': 3, fill: 'none' }, bag);
  el('rect', { x: -13, y: 0, width: 26, height: 20, rx: 4, fill: pal.yellow }, bag);
  el('rect', { x: -13, y: 6, width: 26, height: 3, fill: pal.yellowDark }, bag);
  const bagSh = k.shadow(274, FY + 1, 14, 3);
  const xf = path([[0.1, 190], [1.2, 260], [2.0, 260], [3.1, 96]]);
  return {
    update(t) {
      const fr = t < 1.6 ? 1 : -1;
      const w = walkTo(xf, t, 190, fr);
      const sit = easeInOut(seg(t, 3.1, 3.6));
      const drop = easeInOut(seg(t, 1.35, 1.75));
      const shake = t > 1.2 && t < 1.5 ? Math.sin((t - 1.2) * 30) * 0.6 : 0;
      P(me, { x: w.x, walk: w.walk * (1 - sit), facing: t > 3.1 ? 1 : w.facing, armL: w.armL, armR: t < 1.75 ? lerp(30, 20, drop) : w.armR, lean: w.lean - 6 * drop * (t < 1.9), look: shake + (t > 3.4 ? 0.3 : 0), y: FY - 22 * sit, squash: 1 - 0.1 * sit + 0.05 * hump(seg(t, 3.55, 3.75)), mood: t > 3.4 ? 'grin' : t > 1.2 ? 'flat' : 'smile', blink: blinkAt(t, 0.7) });
      if (t < 1.75) { const h = hp(me, 0.9, 'R', 26); tf(bag, h.x, lerp(h.y + 4, FY - 20, drop)); }
      else tf(bag, 274, FY - 20);
      bagSh.setAttribute('opacity', t > 1.7 ? 1 : 0);
      fg.setAttribute('opacity', t > 3.3 ? 1 : 0);
    }
  };
}
