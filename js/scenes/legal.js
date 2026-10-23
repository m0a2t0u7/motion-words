// legal：18歳で車の運転は合法。「18」の免許証を掲げるまめの横で、車に丸が付く（例文 It is legal to drive at the age of eighteen.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt, car } from './run-after.js';
import { roomBg } from './look-over.js';
import { held } from './dig.js';

export const meta = { duration: 3.8, beats: [[0, '免許証を出す'], [1.2, '18歳'], [2.6, '運転してよい']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = k.backdrop({ floorY: 240, mood: 'outdoor' });
  el('rect', { x: 0, y: FY + 2, width: 400, height: 4, fill: pal.line });
  const c = car(k, pal.blue, pal.blueDark, false);
  const b = k.buddy({ x: 110, y: FY, scale: S });
  const card = g({});
  el('rect', { x: -22, y: -14, width: 44, height: 28, rx: 4, fill: '#fff', stroke: pal.sub, 'stroke-width': 2 }, card);
  el('rect', { x: -17, y: -9, width: 14, height: 14, rx: 2, fill: pal.mint }, card);
  k.text(10, 3, '18', { 'font-size': 14, 'font-weight': 800, fill: pal.ink, 'text-anchor': 'middle' }, card);
  const ok = g({});
  el('circle', { r: 30, fill: 'none', stroke: pal.green, 'stroke-width': 8 }, ok);
  return {
    update(t) {
      const up = easeInOut(seg(t, 0.3, 1.2));
      c.set(265, 0, FY, 0.8 * Math.sin(t * 14) * hump(seg(t, 2.8, 3.8)));
      b.pose({ armR: lerp(20, 105, up), armL: 8, lean: 4 * up, mood: t > 2.4 ? 'grin' : 'smile', blink: blinkAt(t), look: 0.5, squash: 1, walk: 0, lift: 0 });
      held(k, b, S, card, 'R', 0, 22);
      tf(ok, 265, 100, 0, backOut(seg(t, 2.4, 2.9)));
    }
  };
}
