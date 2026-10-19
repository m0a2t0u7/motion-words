// airport：空港に着いたまめ。時計はまだ7時、案内板の出発は10時。早く着きすぎて、スーツケースに腰かけてのんびり（例文 We got to the airport early.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, walk, path, suitcase, pullCase, hall, board, clock } from './vehicle.js';

export const meta = { duration: 4.4, beats: [[0, '空港に着く'], [1.8, 'まだ7時'], [3.0, '早すぎた']] };

export function create(k) {
  const { pal } = k;
  const FY = 236;
  hall(k, FY);
  board(k, 20, 36, 196, [['NH 12', '10:00', 'ON TIME'], ['JL 08', '10:30', 'ON TIME']]);
  const ck = clock(k, 270, 70, 24);
  // 人のいないロビー＝早い
  const me = k.buddy({ x: -40, y: FY + 8, scale: 0.9 });
  const cs = suitcase(k, pal.yellow, pal.yellowDark);
  const X = path([[0, -40], [1.4, 230]]);
  return {
    update(t) {
      ck.set(7, 0 + 4 * t / 4.4);
      const sit = easeInOut(seg(t, 3.0, 3.6));
      if (t < 2.9) {
        walk(me, X, t, { mood: 'smile', look: t > 1.5 ? -0.4 : 0.6, blink: blinkAt(t), armL: 30 });
        me.body.children[3].setAttribute('transform', t > 1.5 ? 'translate(-2 -7)' : 'translate(0 0)');
        if (t < 1.5) pullCase(k, cs, { x: me.state.x - 30, y: me.state.y - 50 }, FY + 14, 0.9, -1);
        else k.tf(cs, 290, FY + 14 - 70 * 0.9, 0, 0.9);
        if (t > 1.5) me.pose({ facing: t > 2.2 ? 1 : -1, look: t > 2.2 ? 0.2 : 0.5 });
      } else {
        k.tf(cs, 290, FY + 14 - 70 * 0.9, 0, 0.9);
        P(me, { x: lerp(230, 290, sit), y: FY + 8 - 34 * sit, squash: 1 - 0.08 * sit, mood: 'grin', blink: sit > 0.9 ? 0.9 : blinkAt(t), armL: 30 * sit, armR: 30 * sit, lean: -6 * sit });
        me.body.children[3].setAttribute('transform', 'translate(0 0)');
      }
      void easeOut; void hump;
    }
  };
}
