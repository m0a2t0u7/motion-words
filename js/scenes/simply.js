// simply：電話の予定メモがあるのに、まめは別のことをしていて、気づいて「あっ」と頭をかく（例文 He simply forgot to call you.）
import { seg, lerp, easeInOut, backOut, hump } from '../ease.js';
import { P, blinkAt, clock } from './run-after.js';
import { roomBg, desk, hp, say } from './look-over.js';

export const meta = { duration: 4.2, beats: [[0, '電話のメモ'], [1.4, '別のことに夢中'], [3.0, 'あっ忘れてた']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'home', 240);
  clock(k, 200, 56, 18);
  const memo = g({}); tf(memo, 330, 96, -4);
  el('rect', { x: -32, y: -26, width: 64, height: 52, rx: 3, fill: '#FFF3A8', stroke: pal.yellowDark, 'stroke-width': 2 }, memo);
  el('rect', { x: -7, y: -13, width: 14, height: 24, rx: 3, fill: pal.ink }, memo);
  el('rect', { x: -5, y: -10, width: 10, height: 15, rx: 1.5, fill: '#9FB4CC' }, memo);
  k.text(0, 20, '15:00', { 'font-size': 9, fill: pal.sub }, memo);
  desk(k, 215, 150, 198);
  // 別のこと：ブロック積み
  const blocks = [pal.coral, pal.blue, pal.yellow, pal.green].map((c, i) => el('rect', { width: 20, height: 20, rx: 3, fill: c, stroke: '#fff', 'stroke-width': 1.5 }));
  const m = k.buddy({ x: 150, y: FY, scale: S });
  const bub = say(k, 52, 32, -1); k.text(0, 6, 'あっ', { 'font-size': 14, fill: pal.ink }, bub.g);
  const bub2 = say(k, 40, 30, -1); k.text(0, 6, '!', { 'font-size': 18, fill: pal.red }, bub2.g);
  return {
    update(t) {
      const notice = seg(t, 2.7, 3.1), scratch = hump(seg(t, 3.1, 4.0) * 3 % 1);
      const play = 1 - notice;
      const gx = 270, lookX = lerp(1, -1, notice);
      const pos = [[0, 0], [22, 0], [11, -20], [11, -40]];
      blocks.forEach((b, i) => {
        const on = i < Math.floor(seg(t, 0.6, 2.6) * 4.4) ? 1 : 0;
        tf(b, 262 + pos[i][0], 178 + pos[i][1], 0, on || 0.001); b.setAttribute('opacity', on);
      });
      P(m, { x: 150 + 40 * easeInOut(seg(t, 0.2, 1.0)), armR: notice < 0.1 ? 50 + Math.sin(t * 7) * 10 : lerp(60, 175, easeInOut(notice)) - scratch * 8,
        armL: 8, look: notice > 0 ? -1 : 1, mood: notice > 0.3 ? 'open' : 'smile', blink: blinkAt(t), lean: notice * -3 });
      bub.show(seg(t, 3.0, 3.3), 150, 90);
      bub2.show(seg(t, 2.8, 3.1), 190, 118);
    }
  };
}
