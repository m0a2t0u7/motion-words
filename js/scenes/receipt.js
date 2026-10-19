// receipt：レジで店員がレシートを渡し「レシートをお持ちください」。まめは受け取って財布にしまう（例文 Please keep the receipt.）
import { seg, lerp, easeInOut, easeOut, clamp } from '../ease.js';
import { hp, reach, counterBg, register } from './bag.js';
import { give } from './charger.js';
import { wallet as walletProp } from './so-far-so-good.js';

export function receiptProp(k, parent, len = 30) {
  const g = k.g({}, parent), { el, pal } = k;
  el('path', { d: `M -9 0 H 9 V ${len} l -3 -2 l -3 2 l -3 -2 l -3 2 l -3 -2 l -3 2 Z`, fill: '#fff', stroke: pal.line, 'stroke-width': 1.3 }, g);
  for (let i = 0; i < 4; i++) el('line', { x1: -6, y1: 5 + i * 5, x2: i === 3 ? 6 : 2, y2: 5 + i * 5, stroke: pal.sub, 'stroke-width': 1.2 }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, 'お会計'], [1.0, 'レシートを渡す'], [2.6, '財布にしまう']] };

export function create(k) {
  const { tf, pal } = k, S = 1.1, FY = 236;
  const room = counterBg(k, FY, 310, 160);
  register(k, 360, room.TY);
  const rc = receiptProp(k);
  const wl = walletProp(k);
  const up = give(k, {
    S, FY, bx: 160, cx: 300, item: rc, g0: 0.9, g1: 1.7, cRest: 70, bubX: 300, bubbleW: 80, bubbleH: 50,
    mid: () => room.front(),
    ask: (g) => { k.tf(receiptProp(k, g), -16, -18, 0, 1); k.text(14, 0, 'Keep', { 'font-size': 12 }, g); },
    bub0: 0.6, bub1: 2.4,
    carry: (t, c, h) => {
      const W = { x: 160 + 44, y: FY - 62 };
      c.b.pose({ armL: t > 2.4 ? lerp(8, reach(c.b, S, 'L', W.x, W.y), easeOut(seg(t, 2.3, 2.6))) : 8 });
      if (t > 2.4) c.b.pose({ armR: reach(c.b, S, 'R', W.x + 2, lerp(W.y - 34, W.y - 10, easeInOut(seg(t, 2.8, 3.4)))) });
      const wh = hp(c.b, S, 'L');
      tf(wl, t > 2.4 ? W.x : -40, W.y, 0, 1.4);
      const hh = t < 1.7 ? h : hp(c.b, S, 'R');
      tf(rc, hh.x, hh.y - 4, 0, 1);
      rc.setAttribute('opacity', t > 3.4 ? 0 : 1);
      void wh;
      return true;
    }
  });
  wl.parentNode.appendChild(wl); rc.parentNode.appendChild(rc);
  return { update: up };
}
