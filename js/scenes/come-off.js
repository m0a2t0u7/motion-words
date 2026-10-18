// come off：シャツのボタンが一つ取れて、床へ落ちて転がる。まめは胸元を見下ろす（例文 A button came off my shirt.）
import { seg, lerp, easeIn, easeOut, wobble, clamp } from '../ease.js';

export const meta = { duration: 3.6, beats: [[0, 'シャツのボタン'], [1.2, 'ボタンが取れる'], [2.6, '取れてしまった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 270, y: 60, width: 90, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const S = 1.15, X = 170;
  const B = k.buddy({ x: X, y: FY, scale: S });
  // シャツ（体に重ねる）
  const shirt = g({}, B.body);
  shirt.parentNode.insertBefore(shirt, B.body.children[3]);
  el('path', { d: 'M -30 -36 L 30 -36 L 30 -6 Q 30 0 24 0 L -24 0 Q -30 0 -30 -6 Z', fill: '#fff' }, shirt);
  el('path', { d: 'M -14 -36 L 0 -26 L 14 -36', fill: 'none', stroke: pal.line, 'stroke-width': 2.5 }, shirt);
  el('line', { x1: 0, y1: -26, x2: 0, y2: 0, stroke: pal.line, 'stroke-width': 2 }, shirt);
  const btn = (y) => el('circle', { cx: 0, cy: y, r: 2.8, fill: pal.blue }, shirt);
  btn(-20); btn(-6);
  const thread = el('path', { d: 'M -2 -13 L 2 -13', stroke: pal.blueDark, 'stroke-width': 1.5 }, shirt);
  const sh = k.shadow(0, FY + 1, 5, 1.4);
  const b = el('circle', { r: 2.8 * S, fill: pal.blue, stroke: pal.blueDark, 'stroke-width': 1 });
  return {
    update(t) {
      const pop = 1.2, f = seg(t, pop, pop + 0.5), land = seg(t, pop + 0.5, pop + 1.6);
      const look = easeOut(seg(t, pop + 0.2, pop + 0.6));
      B.pose({ armL: 10, armR: t < 0.8 ? 10 : lerp(10, 50, easeOut(seg(t, 0.8, 1.1))) * (1 - seg(t, 1.6, 2.0)) + 14 * seg(t, 1.6, 2.0), lean: 10 * look, mood: t > pop + 0.3 ? 'open' : 'smile', look: lerp(0.2, 0.6, look), blink: 0 });
      if (t > 2.4) B.pose({ mood: 'sad' });
      const x0 = X, y0 = FY - (13 + 10) * S;
      let x = x0, y = y0;
      if (t > pop) {
        x = x0 + 24 * easeOut(f) + 26 * easeOut(land);
        y = f < 1 ? lerp(y0, FY - 3, easeIn(f)) - 14 * Math.sin(f * Math.PI) : FY - 3 - 5 * Math.abs(wobble(land, 1.5, 7));
      }
      k.set(b, { cx: x, cy: y, opacity: t > pop ? 1 : 0 });
      thread.setAttribute('opacity', t > pop ? 1 : 0);
      // ボタンが付いている間は体の上のボタンを描く
      if (t <= pop) k.set(b, { opacity: 0 });
      sh.setAttribute('opacity', t > pop ? clamp(f) : 0); tf(sh, x, 0);
      shirt.lastBtn = shirt.lastBtn || btn(-13);
      shirt.lastBtn.setAttribute('opacity', t > pop ? 0 : 1);
    }
  };
}
