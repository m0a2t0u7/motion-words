// cash：レジでお札を見せて「現金で払えますか？」と聞く。店員がうなずいて受け取る（例文 Do you take cash?）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { counterBg, register } from './bag.js';
import { give } from './charger.js';
import { bill as note } from './run-after.js';

export const meta = { duration: 4.4, beats: [[0, 'お札を見せる'], [1.2, '現金でいい？'], [2.4, 'うなずいて受け取る']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1.1, FY = 236;
  const room = counterBg(k, FY, 310, 160);
  register(k, 368, room.TY);
  // カード読み取り機（今回は使わない）
  el('rect', { x: 262, y: room.TY - 24, width: 18, height: 24, rx: 3, fill: '#5A6472' });
  el('rect', { x: 265, y: room.TY - 21, width: 12, height: 8, rx: 1, fill: '#9BE1C8' });
  const cash = note(k);
  const up = give(k, {
    S, FY, bx: 160, cx: 320, item: cash, rev: true, g0: 1.6, g1: 2.6, bRest0: 70, cRest: 10, bubbleW: 86,
    mid: () => room.front(),
    ask: (g) => { k.tf(note(k, g), -18, 0, 0, 0.9); k.text(20, 0, 'OK?', { 'font-size': 13 }, g); },
    bub0: 0.3, bub1: 2.2,
    carry: (t, c, h) => { if (t < 2.6) return false; const q = easeInOut(seg(t, 2.6, 3.0)); k.tf(cash, lerp(h.x, 330, q), lerp(h.y + 4, room.TY - 5, q), 0, S); return true; },
    after: (t, c) => { const nod = hump(seg(t, 1.3, 1.6)) + hump(seg(t, 1.6, 1.9)); c.c.pose({ lean: 10 * nod, mood: t > 1.3 ? 'grin' : 'smile' }); }
  });
  cash.parentNode.appendChild(cash);
  return { update: up };
}
