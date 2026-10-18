// in a hurry：道で知り合いに手を振られるが、腕時計を見ながら走っていて「ごめん！」と手を上げて走り去る（Sorry, I'm in a hurry right now.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, clamp } from '../ease.js';
import { run, tree, clock } from './run-after.js';
import { gait } from './dig.js';
import { P, blinkAt, talk, drop } from './so-far-so-good.js';

export const meta = { duration: 4.2, beats: [[0, '急いで走る'], [1.4, 'ごめん！'], [3.0, '走り去る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  el('rect', { x: 0, y: FY, width: 400, height: 12, fill: '#E3E8EE' });
  for (let x = 0; x < 400; x += 50) el('rect', { x, y: FY + 2, width: 2, height: 8, fill: '#D3DAE3' });
  el('rect', { x: 0, y: 70, width: 130, height: FY - 70, fill: '#F2E1CC' });
  [[16, 90], [70, 90], [16, 150], [70, 150]].forEach(([x, y]) => el('rect', { x, y, width: 40, height: 36, rx: 3, fill: '#CFE9F7' }));
  tree(k, 330, FY - 2, 0.8);
  const ck = clock(k, 196, 60, 18);
  el('line', { x1: 196, y1: 78, x2: 196, y2: FY, stroke: pal.sub, 'stroke-width': 4 });
  const C = k.buddy({ x: 250, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark });
  const G = k.buddy({ x: -40, y: FY });
  const bag = g({}); el('rect', { x: -10, y: 0, width: 20, height: 16, rx: 3, fill: pal.violet }, bag); el('path', { d: 'M -5 0 Q 0 -8 5 0', stroke: pal.violet, 'stroke-width': 2.5, fill: 'none' }, bag);
  const hi = talk(k, 'Hi!', 44, 30, 1, 15), sorry = talk(k, 'Sorry!', 66, 32, -1, 14);
  const sw = drop(k);
  const xf = (t) => t < 1.4 ? lerp(-40, 150, seg(t, 0, 1.4)) : t < 1.9 ? lerp(150, 172, easeOut(seg(t, 1.4, 1.9))) : lerp(172, 470, easeIn(seg(t, 1.9, 2.4)) * 0.3 + seg(t, 1.9, 4.2) * 0.7);
  return {
    update(t) {
      ck.set(8, 55 + 4 * seg(t, 0, 4.2));
      const r = run(xf, t, -40);
      const slow = t > 1.4 && t < 1.95;
      P(G, { x: r.x, walk: r.walk, facing: 1, lean: slow ? 4 : r.lean, lift: r.lift, armL: slow ? 8 : r.armL,
        armR: slow ? 8 + 150 * hump(seg(t, 1.4, 2.0)) : t < 1.4 && Math.sin(t * 3) > 0.6 ? 100 : r.armR,
        look: slow ? 0.9 : 0.6, mood: slow ? 'open' : 'flat', blink: blinkAt(t) });
      tf(bag, G.handPos('L').x, G.handPos('L').y - 4, 0);
      tf(sw, r.x - 26, FY - 94 + 8 * Math.sin(t * 6), 0, 0.9);
      const wv = t > 0.6 && t < 1.8 ? 120 + 22 * Math.sin(t * 12) : t >= 1.8 ? lerp(120, 50, easeOut(seg(t, 1.8, 2.4))) : 8;
      P(C, { facing: t > 2.0 ? 1 : -1, armR: wv, look: 0.5, mood: t < 1.8 ? 'grin' : 'flat', blink: blinkAt(t, 1) });
      hi.show(seg(t, 0.6, 0.9) * (t < 1.6 ? 1 : 0), 270, 112);
      sorry.show(seg(t, 1.5, 1.8) * (t < 2.9 ? 1 : 0), r.x + 4, 112);
    }
  };
}
