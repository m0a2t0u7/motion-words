// lid：湯気の立つ鍋に、つまみを持ったふたをかぶせる（例文 Put the lid on the pot.）
import { seg, lerp, easeInOut, easeOut, clamp, hump, wobble } from '../ease.js';
import { kitchen, TOP, arms, potP, stove, steam, P, blinkAt } from './jam.js';

export const meta = { duration: 4.0, beats: [[0, '湯気が出る'], [1.0, 'ふたを持つ'], [2.6, 'ふたをした']] };

export function create(k) {
  const { el, pal } = k, S = 1.15;
  const kit = kitchen(k);
  const b = k.buddy({ x: 156, y: kit.FY, scale: S });
  kit.front();
  const PX = 270, PW = 90, PH = 64, rim = TOP - 5 - PH;
  const sv = stove(k, PX, TOP, 120);
  k.tf(potP(k, undefined, PW, PH), PX, TOP - 5);
  const st = steam(k, undefined, 4, 40);
  const lid = k.g({});
  el('path', { d: `M ${-PW / 2 - 3} 0 Q 0 -18 ${PW / 2 + 3} 0 Z`, fill: '#AEB8C6', stroke: '#8E99A8', 'stroke-width': 1.5 }, lid);
  el('rect', { x: -10, y: -22, width: 20, height: 8, rx: 4, fill: '#3E4655' }, lid);
  el('path', { d: `M ${-PW / 2 + 10} -4 Q -10 -14 0 -14`, stroke: '#fff', 'stroke-width': 2, opacity: 0.6, fill: 'none' }, lid);
  const A = arms(k, b, S, { back: ['L'] });
  // ふたの通り道：台の上（左）→ 持ち上げて → 鍋の上へ
  const L0 = { x: 196, y: TOP - 1 };
  return {
    update(t) {
      const lift = easeInOut(seg(t, 0.8, 1.4)), over = easeInOut(seg(t, 1.4, 2.2)), down = easeOut(seg(t, 2.2, 2.6));
      const rattle = wobble(seg(t, 2.6, 3.6), 3, 4) * 1.6;
      P(b, { lean: 6 + 4 * over, look: 0.6, blink: blinkAt(t), mood: t > 2.8 ? 'grin' : 'smile' });
      const x = lerp(L0.x, PX, over), y = lerp(L0.y, rim - 30, lift) + (rim - (rim - 30)) * down * (over >= 1 ? 1 : 0) + 0;
      const yy = t < 2.2 ? lerp(L0.y, rim - 30 - 10 * hump(over), lift) : lerp(rim - 30, rim, down);
      k.tf(lid, x, yy + (t > 2.6 ? -Math.abs(rattle) : 0), lerp(0, 0, over));
      const away = easeInOut(seg(t, 2.8, 3.3));
      const hand = { x: x, y: yy - 20 };
      A.to('R', lerp(hand.x, 214, away), lerp(hand.y, TOP - 30, away) - (t < 0.8 ? 0 : 0));
      if (t < 0.8) A.to('R', lerp(204, L0.x, easeInOut(seg(t, 0.2, 0.8))), lerp(TOP - 10, L0.y - 20, easeInOut(seg(t, 0.2, 0.8))));
      A.to('L', 136, TOP + 4);
      sv.set(1, t);
      st.set(PX, rim - 4, 1 - easeOut(seg(t, 2.3, 2.8)), t);
      void y;
    }
  };
}
