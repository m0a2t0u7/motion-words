// bill：コンビニのレジで電話料金の請求書とお金を出して支払う。店員が「支払済」の印を押す（例文 I paid the phone bill today.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { hp, counterBg, register } from './bag.js';
import { give } from './charger.js';
import { bigPhone } from './phone.js';
import { bill as note } from './run-after.js';

export function billPaper(k, parent) {
  const g = k.g({}, parent), { el, pal } = k;
  el('rect', { x: -15, y: 0, width: 30, height: 38, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, g);
  const p = bigPhone(k, g); k.tf(p.g, -7, 10, 0, 0.3);
  k.text(5, 11, '$40', { 'font-size': 7.5, fill: pal.ink }, g);
  for (let i = 0; i < 2; i++) el('line', { x1: -10, y1: 22 + i * 5, x2: 10, y2: 22 + i * 5, stroke: pal.sub, 'stroke-width': 1.2 }, g);
  const paid = k.g({}, g);
  el('rect', { x: -12, y: 20, width: 24, height: 11, rx: 2, fill: '#fff', stroke: pal.red, 'stroke-width': 1.6, transform: 'rotate(-12 0 25)' }, paid);
  k.text(0, 26, 'PAID', { 'font-size': 7.5, fill: pal.red, transform: 'rotate(-12 0 25)' }, paid);
  return { g, paid };
}

export const meta = { duration: 4.4, beats: [[0, '電話の請求書'], [1.2, 'お金と出す'], [2.8, '支払った']] };

export function create(k) {
  const { tf, pal } = k, S = 1.1, FY = 236;
  const room = counterBg(k, FY, 310, 160);
  register(k, 368, room.TY);
  const bp = billPaper(k);
  const cash = note(k);
  let stampP = 0;
  const up = give(k, {
    S, FY, bx: 160, cx: 320, item: bp.g, rev: true, g0: 0.7, g1: 1.6, bRest0: 70, cRest: 10,
    mid: () => room.front(),
    bub0: -1, bub1: -1,
    carry: (t, c, h) => {
      if (t < 1.6) { tf(bp.g, h.x, h.y - 8, 0, 1); tf(cash, h.x + 4, h.y + 28, 0, 0.9); }
      else {
        const lay = easeOut(seg(t, 1.6, 2.0));
        const X = 262, Y = room.TY - 38;
        const ch = hp(c.c, S, 'R');
        tf(bp.g, lerp(ch.x, X, lay), lerp(ch.y - 8, Y, lay), 0, 1);
        tf(cash, lerp(ch.x + 4, 300, lay), lerp(ch.y + 28, room.TY - 4, lay), 0, 0.9);
        // 店員：判を押す
        const st = hump(seg(t, 2.2, 2.7));
        c.c.pose({ armR: lerp(10, 70, easeInOut(seg(t, 1.9, 2.2))) - 18 * st, lean: 6 * st });
        stampP = seg(t, 2.45, 2.55);
      }
      bp.paid.setAttribute('opacity', stampP > 0.5 && t > 2.4 ? 1 : 0);
      return true;
    }
  });
  bp.g.parentNode.appendChild(bp.g); cash.parentNode.appendChild(cash);
  return { update: up };
}
