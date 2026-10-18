// listen to：彼女が話し始めると、まめは本を置いて向き直り、身を乗り出してうなずきながら聞く（例文 Please listen to what she says.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { roomBg, say, waves, faceAt } from './look-over.js';

export const meta = { duration: 4.2, beats: [[0, '彼女が話す'], [1.3, '向き直る'], [2.6, 'うなずいて聞く']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  el('rect', { x: 52, y: 206, width: 40, height: 6, rx: 2, fill: pal.wood }); el('rect', { x: 68, y: 212, width: 8, height: 26, fill: pal.woodDark });
  const she = k.buddy({ x: 300, y: FY, scale: 0.95, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const b = k.buddy({ x: 140, y: FY, scale: 0.95, facing: -1 });
  const book = g({});
  el('rect', { x: -14, y: -10, width: 28, height: 20, rx: 2, fill: pal.blue }, book);
  el('line', { x1: 0, y1: -10, x2: 0, y2: 10, stroke: '#fff', 'stroke-width': 2 }, book);
  const bub = say(k, 60, 34, 1);
  [-8, 0, 8].forEach((y, i) => el('line', { x1: -18, x2: 18 - i * 8, y1: y - 1, y2: y - 1, stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' }, bub.g));
  const wv = waves(k, pal.coral);
  return {
    update(t) {
      const talk = t > 0.3;
      she.pose({ armR: 8 + 40 * (talk ? 0.5 + 0.5 * Math.sin(t * 5) : 0), armL: 10, mood: talk && Math.sin(t * 14) > 0 ? 'open' : 'smile', look: 0.6, lean: 3 });
      bub.show(seg(t, 0.3, 0.5), 260, 132);
      wv(talk ? 1 : 0, (t * 1.2) % 1, 270, 186, -1, 1.2);
      const turn = seg(t, 1.0, 1.3), drop = easeInOut(seg(t, 0.9, 1.3));
      const nod = t > 2.3 ? Math.max(0, Math.sin((t - 2.3) * 5)) : 0;
      b.pose({ facing: turn > 0.5 ? 1 : -1, armR: lerp(60, 8, drop), armL: lerp(60, 10, drop), lean: 10 * easeInOut(seg(t, 1.4, 2.0)) + 5 * nod, mood: t > 1.3 ? 'smile' : 'flat', look: 0.5 });
      faceAt(b, turn > 0.5 ? 5 : 2, (turn > 0.5 ? 0 : 6) + 3 * nod);
      const bx = lerp(b.state.x - 26, 72, drop), by = lerp(186, 202, easeOut(drop));
      tf(book, bx, by, 0, 1, lerp(1, 0.5, drop));
    }
  };
}
