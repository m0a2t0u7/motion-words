// host：玄関でもてなし役の人が両手を広げて、着いた2人（まめと友だち）を迎え入れる（例文 Our host welcomed us at the door.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { arms, keys, iconSay, heartP, pops, P, blinkAt, C } from './jam.js';
import { gait } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '家に着く'], [1.4, 'ドアが開く'], [2.4, 'ようこそ']] };

export function create(k) {
  const { el, pal } = k, FY = 236;
  k.backdrop({ floorY: FY, mood: 'outdoor' });
  el('rect', { x: 210, y: 60, width: 200, height: 176, fill: '#F3E6D0' });
  el('path', { d: 'M 196 66 L 410 66 L 410 40 L 230 40 Z', fill: '#6AA8F7' });
  el('rect', { x: 250, y: 104, width: 84, height: 132, fill: '#F7E4C3' });
  const host = k.buddy({ x: 292, y: FY, scale: 1.2, facing: -1, ...C(k, 'blue') });
  const door = el('rect', { x: 250, y: 104, width: 84, height: 132, fill: '#8B5E3C' });
  el('circle', { cx: 0, cy: 0, r: 0 });
  el('rect', { x: 200, y: 226, width: 150, height: 10, fill: '#D9C3A0' });
  const me = k.buddy({ x: -60, y: FY, scale: 1.05 });
  const fr = k.buddy({ x: -130, y: FY, scale: 1.0, ...C(k, 'coral') });
  const H = arms(k, host, 1.2, { col: pal.blue, dark: pal.blueDark });
  const wel = iconSay(k, 84, 32, 1, (g) => k.text(0, 1, 'Welcome!', { 'font-size': 14 }, g));
  const h = heartP(k);
  const xm = keys([[0, -60], [1.4, 180]]), xf = keys([[0, -130], [1.6, 110]]);
  return {
    update(t) {
      const op = easeInOut(seg(t, 1.3, 1.8));
      k.set(door, { width: Math.max(4, 84 * (1 - op)) });
      H.vis(op > 0.6);
      const step = easeInOut(seg(t, 1.8, 2.2)), spread = easeOut(seg(t, 2.2, 2.6));
      P(host, { x: lerp(292, 278, step), facing: -1, look: 0.5, blink: blinkAt(t), mood: t > 2.2 ? 'grin' : 'smile', lean: -4 * spread });
      H.ang('R', lerp(10, 120, spread) + 10 * Math.sin(t * 6) * spread); H.ang('L', lerp(10, 120, spread));
      const g1 = gait(xm, t, -60), g2 = gait(xf, t, -130);
      const bowP = hump(seg(t, 2.6, 3.2));
      P(me, { x: g1.x, walk: g1.walk, armL: g1.armL, armR: g1.armR, lean: g1.lean + 18 * bowP, look: 0.6, blink: bowP > 0.3 ? 1 : blinkAt(t, 1), mood: 'grin' });
      P(fr, { x: g2.x, walk: g2.walk, armL: g2.armL, armR: g2.armR, lean: g2.lean + 18 * hump(seg(t, 2.8, 3.4)), look: 0.6, blink: blinkAt(t, 0.4), mood: 'grin' });
      wel.show(seg(t, 2.3, 2.6), 300, 82);
      const q = seg(t, 3.4, 3.9); k.tf(h, 230, 120 - 10 * q, 0, pops(q));
    }
  };
}
