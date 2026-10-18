// shut out：外へ出たとたん風でドアがバタンと閉まり、彼は締め出される（例文 The door slammed and shut him out.）
import { seg, lerp, easeInOut, easeIn, easeOut, wobble, hump } from '../ease.js';
import { path, walk, door } from './queue-up.js';

export const meta = { duration: 4.2, beats: [[0, '外へ出る'], [1.8, 'バタンと閉まる'], [3.6, '入れない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('rect', { x: 14, y: 96, width: 236, height: FY - 96, rx: 6, fill: '#FBE9DC' });
  el('path', { d: 'M 2 104 L 132 34 L 262 104 Z', fill: pal.coral, stroke: pal.coral, 'stroke-width': 8, 'stroke-linejoin': 'round' });
  [[26, 60], [196, 44]].forEach(([x, w]) => el('rect', { x, y: 128, width: w, height: 48, rx: 5, fill: '#CFE9F7' }));
  el('rect', { x: 100, y: FY - 112, width: 84, height: 112, rx: 3, fill: '#F4D9B8' });
  el('rect', { x: 100, y: FY - 16, width: 84, height: 16, fill: '#E3C49B' });
  el('rect', { x: 120, y: FY - 92, width: 22, height: 30, rx: 2, fill: '#fff', opacity: 0.6 });
  el('rect', { x: 184, y: FY, width: 216, height: 10, fill: '#E3E8EE' });
  const S = 0.85;
  const b = k.buddy({ x: 142, y: FY, scale: S });
  const D = door(k, { x: 100, y: FY - 112, w: 84, h: 112, color: pal.blue });
  el('rect', { x: 93, y: FY - 4, width: 98, height: 8, rx: 3, fill: pal.woodDark });
  const wind = g({});
  [0, 1, 2].forEach((i) => el('path', { d: `M 0 ${i * 16} q 20 -8 40 0 t 40 0`, stroke: '#B9D7EA', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, wind));
  const bang = g({});
  [-40, -10, 20].forEach((a) => el('line', { x1: 0, y1: -8, x2: 0, y2: -24, stroke: pal.ink, 'stroke-width': 3, 'stroke-linecap': 'round', transform: `rotate(${a})` }, bang));
  const xf = path([[0.2, 142], [1.4, 262], [2.5, 262], [3.1, 214]]);
  return {
    update(t) {
      const c = easeIn(seg(t, 1.55, 1.8));
      const op = 1 - c;
      D.set(op + 0.02 * wobble(seg(t, 1.8, 2.3), 3, 6) * -1 * (t > 1.8 ? 1 : 0));
      const wv = seg(t, 1.1, 1.9);
      wind.setAttribute('opacity', hump(wv) * 0.9); tf(wind, lerp(330, 150, wv), FY - 80);
      const bn = seg(t, 1.8, 2.3);
      bang.setAttribute('opacity', bn > 0 && bn < 1 ? 1 - bn : 0); tf(bang, 186, FY - 116, 0, 0.8 + bn * 0.4);
      const startle = hump(seg(t, 1.8, 2.2));
      const p = walk(b, xf, t, { facing: t < 2.5 ? 1 : -1, look: t < 1.8 ? 0.5 : 0.6, mood: t < 1.8 ? 'smile' : t < 2.4 ? 'open' : 'sad', lift: startle * 8 });
      if (t > 3.1) { const push = Math.max(0, Math.sin((t - 3.1) * 9)) * (1 - seg(t, 3.7, 3.9)); b.pose({ armR: 88, lean: 6 + push * 6 }); }
      else if (t > 2.5) b.pose({ armR: lerp(p.armR, 88, seg(t, 2.8, 3.1)) });
      void easeOut; void easeInOut;
    }
  };
}
