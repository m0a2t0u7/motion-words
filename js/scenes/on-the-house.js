// on the house：夜のレストランで店員がデザートを運ぶ→客が財布を出す→店員が「これはお店から（0円）」と手で止める（The dessert is on the house tonight.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { desk } from './get-on-with.js';
import { hp, gait } from './dig.js';
import { P, blinkAt, cake, wallet } from './so-far-so-good.js';
import { say } from './look-over.js';

export function restaurantBg(k, FY = 236) {
  const { el, pal } = k;
  k.backdrop({ floorY: FY, mood: 'evening' });
  el('rect', { x: 0, y: FY - 70, width: 400, height: 70, fill: '#F3D9C4' });
  el('rect', { x: 0, y: FY - 72, width: 400, height: 4, fill: pal.woodDark, opacity: 0.6 });
  el('rect', { x: 270, y: 40, width: 96, height: 70, rx: 5, fill: '#3D4A44', stroke: pal.woodDark, 'stroke-width': 5 });
  [56, 72, 88].forEach((y, i) => el('rect', { x: 282, y, width: 50 - i * 8, height: 4, rx: 2, fill: '#fff', opacity: 0.7 }));
  [60, 180].forEach((x) => { el('line', { x1: x, y1: 0, x2: x, y2: 44, stroke: pal.sub, 'stroke-width': 2 }); el('path', { d: `M ${x - 14} 58 Q ${x} 36 ${x + 14} 58 Z`, fill: pal.yellow }); el('ellipse', { cx: x, cy: 62, rx: 30, ry: 8, fill: '#FFE9A8', opacity: 0.35 }); });
  return FY;
}

export const meta = { duration: 4.4, beats: [[0, 'デザートが来る'], [1.6, '払おうとする'], [2.8, 'お店のおごり']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = restaurantBg(k);
  const G = k.buddy({ x: 112, y: FY });
  const top = desk(k, 150, 100, FY);
  const C = k.buddy({ x: 450, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark });
  el('path', { d: 'M -10 -36 L 0 -32 L 10 -36 L 10 -28 L 0 -32 L -10 -28 Z', fill: pal.ink }, C.body);
  el('rect', { x: -22, y: -26, width: 44, height: 24, rx: 4, fill: '#fff', opacity: 0.9 }, C.body);
  const tray = g({}); el('ellipse', { cx: 0, cy: 0, rx: 22, ry: 4, fill: '#C9D1DC' }, tray); const ck = cake(k, tray); tf(ck, 0, -2);
  const wal = wallet(k);
  const bub = say(k, 82, 36, 1);
  tf(cake(k, bub.g), -22, 9, 0, 0.7);
  k.text(16, 1, '= $0', { 'font-size': 15, fill: pal.green }, bub.g);
  const xf = (t) => lerp(450, 268, easeInOut(seg(t, 0, 1.2)));
  return {
    update(t) {
      const p = gait(xf, t, 450);
      const put = easeInOut(seg(t, 1.1, 1.6));
      const stop = clamp(hump(seg(t, 2.2, 4.6)) * 2);
      P(C, { x: p.x, walk: p.walk, facing: -1, lean: p.lean + 8 * hump(seg(t, 1.1, 1.8)),
        armR: t < 1.6 ? lerp(70, 88, put) : lerp(88, 8, seg(t, 1.6, 1.9)) * (1 - stop) + 95 * stop, armL: 8 + p.armL - 8,
        mood: t > 2.6 && t < 3.4 && Math.sin(t * 20) > 0 ? 'open' : 'grin', look: 0.5, blink: blinkAt(t, 1) });
      const h = hp(C, 1, 'R');
      if (t < 1.6) tf(tray, lerp(h.x - 8, 196, put), lerp(h.y - 4, top - 1, put)); else tf(tray, 196, top - 1);
      const reach = easeOut(seg(t, 1.8, 2.3)) * (1 - easeInOut(seg(t, 3.2, 3.7)));
      P(G, { armR: 8 + 70 * reach, look: t < 1.8 ? 0.8 : 0.5, mood: t > 3.3 ? 'grin' : t > 2.5 ? 'open' : 'smile',
        lean: -4 * hump(seg(t, 2.5, 3.1)), squash: 1 + 0.04 * hump(seg(t, 3.3, 3.7)), lift: 6 * hump(seg(t, 3.3, 3.7)), blink: blinkAt(t) });
      const hw = hp(G, 1, 'R');
      tf(wal, hw.x + 4, hw.y, 0, 0.9); wal.setAttribute('opacity', reach > 0.05 ? 1 : 0);
      bub.show(seg(t, 2.5, 2.8), 236, 116);
    }
  };
}
