// departure：搭乗口の案内板で出発時刻 10:00 が 11:00 に変わり「DELAYED」と出る。待っていたまめはがっかりして座り込む（例文 Our departure was delayed an hour.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, hall, board, suitcase, popIn } from './vehicle.js';

export const meta = { duration: 4.4, beats: [[0, '出発は10時'], [1.4, '11時に変更'], [2.8, '1時間遅れ']] };

export function create(k) {
  const { el, pal } = k;
  const FY = 236;
  hall(k, FY);
  const bd = board(k, 100, 40, 220, [['GATE 5', '10:00', 'ON TIME']]);
  const [, tm, st] = bd.cells[0];
  const plus = k.text(330, 98, '+1h', { 'font-size': 16, fill: pal.red });
  // ベンチ
  el('rect', { x: 200, y: FY - 34, width: 140, height: 10, rx: 4, fill: pal.blue }); [210, 330].forEach((x) => el('rect', { x: x - 3, y: FY - 26, width: 6, height: 26, fill: pal.sub }));
  const cs = suitcase(k, pal.coral, pal.coralDark); k.tf(cs, 160, FY - 66);
  const me = k.buddy({ x: 250, y: FY + 6, scale: 0.92 });
  return {
    update(t) {
      const ch = seg(t, 1.3, 1.7);
      tm.textContent = ch > 0.5 ? '11:00' : '10:00';
      tm.setAttribute('fill', ch > 0.5 ? '#FF9A8A' : '#FFE08A');
      st.textContent = ch > 0.5 ? 'DELAYED' : 'ON TIME'; st.setAttribute('fill', ch > 0.5 ? '#FF9A8A' : '#9BE3B0');
      tm.setAttribute('opacity', ch > 0 && ch < 1 ? Math.abs(Math.cos(ch * 12)) : 1);
      k.tf(plus, 0, 0, 0, 1); plus.setAttribute('opacity', seg(t, 1.8, 2.1));
      const sit = easeInOut(seg(t, 2.8, 3.5));
      P(me, { x: 250 + 20 * sit, y: FY + 6 - 26 * sit, look: -0.1, lean: -4 * hump(seg(t, 1.8, 2.4)) + 8 * sit, mood: t > 1.8 ? 'sad' : 'smile', blink: blinkAt(t), squash: 1 - 0.08 * sit, lift: 0 });
      me.body.children[3].setAttribute('transform', t < 2.8 ? 'translate(0 -7)' : `translate(0 ${(4 * sit).toFixed(1)})`);
      void easeOut; void popIn; void lerp;
    }
  };
}
