// license：教習所の前で、係の人が運転免許証を手渡す。まめは受け取って高く掲げて大喜び（例文 He just got his driver's license.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { hp, reach, idCard, streetBg } from './bag.js';
import { give } from './charger.js';
import { car } from './run-after.js';
import { star } from './run-after.js';

export const meta = { duration: 4.4, beats: [[0, '試験に合格'], [1.0, '免許証をもらう'], [2.4, 'やった！']] };

export function create(k) {
  const { tf, el, pal } = k, S = 1.1, FY = 236;
  streetBg(k, FY);
  const cr = car(k, pal.yellow, pal.yellowDark, true); cr.set(340, 0, FY - 4);
  const card = k.g({}); idCard(k, card, '#FFF1C9', 34, 22, pal.mint);
  el('path', { d: 'M 6 4 h 9 l -2 -4 h -5 Z', fill: pal.blue }, card);
  const sts = [0, 1, 2].map(() => star(k));
  const up = give(k, {
    S, FY, bx: 130, cx: 250, item: card, g0: 0.8, g1: 1.6, cRest: 70, bubX: 250, bubbleW: 66,
    ask: (g) => { k.text(0, 1, 'PASS', { 'font-size': 14, fill: pal.green }, g); },
    carry: (t, c, h) => {
      const up = easeInOut(seg(t, 2.2, 2.7));
      if (t > 2.2) c.b.pose({ armR: lerp(c.b.state.armR, 165, up), lift: 14 * hump(seg(t, 2.6, 3.1)) + 10 * hump(seg(t, 3.2, 3.7)), squash: 1 + 0.05 * hump(seg(t, 2.6, 3.1)) });
      const hh = t < 1.6 ? h : hp(c.b, S, 'R');
      tf(card, hh.x, hh.y - 8, 0, S);
      sts.forEach((s, i) => s.set(hh.x - 20 + i * 20, hh.y - 20, seg(t, 2.8 + i * 0.2, 3.6 + i * 0.2)));
      return true;
    }
  });
  card.parentNode.appendChild(card);
  return { update: up };
}
