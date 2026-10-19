// include：ホテルのフロントで料金 $80 を払うと、係の人がかぎと一緒に朝食券も渡す。料金の中に朝食が入っている（例文 The price includes breakfast.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, backOut } from '../ease.js';
import { hp, reach } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { hotelBg, breakfast } from './provide.js';
import { bill } from './charge.js';

export const meta = { duration: 4.4, beats: [[0, '料金は$80'], [1.4, '払う'], [2.6, '朝食も込み']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 236, SC = 1.18;
  hotelBg(k, FY);
  // 料金表：$80 の枠の中に「部屋」と「朝食」
  const BX = 236, BY = 72;
  el('rect', { x: BX, y: BY, width: 150, height: 92, rx: 8, fill: '#fff', stroke: pal.ink, 'stroke-width': 2.5 });
  k.text(BX + 75, BY + 16, '$80', { 'font-size': 18 });
  const frame = el('rect', { x: BX + 10, y: BY + 30, width: 130, height: 54, rx: 8, fill: 'none', stroke: pal.green, 'stroke-width': 3, 'stroke-dasharray': '6 4' });
  const bed = g({}); tf(bed, BX + 40, BY + 62);
  el('rect', { x: -20, y: -2, width: 40, height: 12, rx: 3, fill: pal.blue }, bed);
  el('rect', { x: -20, y: -10, width: 12, height: 8, rx: 3, fill: '#fff', stroke: pal.line }, bed);
  el('rect', { x: -22, y: -14, width: 4, height: 30, fill: pal.woodDark }, bed); el('rect', { x: 18, y: 2, width: 4, height: 14, fill: pal.woodDark }, bed);
  const plus = k.text(BX + 74, BY + 60, '+', { 'font-size': 18, fill: pal.green });
  const bf = breakfast(k);
  const clerk = k.buddy({ x: 330, y: FY, scale: SC, facing: -1, color: pal.coral, dark: pal.coralDark });
  el('rect', { x: 230, y: 192, width: 170, height: 8, rx: 3, fill: pal.woodDark });
  el('rect', { x: 236, y: 200, width: 164, height: 36, fill: pal.wood });
  k.shadow(316, FY + 1, 86, 4);
  const me = k.buddy({ x: 176, y: FY, scale: 1.0, facing: 1 });
  const money = [0, 1].map(() => bill(k));
  const key = g({});
  el('circle', { r: 5, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 3 }, key);
  el('path', { d: 'M 5 0 L 16 0 M 12 0 L 12 4', stroke: pal.yellowDark, 'stroke-width': 3, 'stroke-linecap': 'round' }, key);
  const ticket = g({});
  el('rect', { x: -12, y: -8, width: 24, height: 16, rx: 2, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 }, ticket);
  el('circle', { cx: -3, cy: 0, r: 4.5, fill: '#fff' }, ticket); el('circle', { cx: -3, cy: 0, r: 2, fill: pal.yellowDark }, ticket);
  return {
    update(t) {
      // 1) まめが料金表を見る → 2) $80 を出す → 3) かぎと朝食券を受け取る
      const pay = easeInOut(seg(t, 1.2, 1.6)) * (1 - easeInOut(seg(t, 1.8, 2.1)));
      const give = easeInOut(seg(t, 2.3, 2.7)) * (1 - easeInOut(seg(t, 3.0, 3.3)));
      const recv = easeInOut(seg(t, 2.4, 2.7));
      P(me, { facing: 1, look: t < 1.2 ? 0.5 : 0.8, blink: blinkAt(t), armL: 10, armR: lerp(10, 80, Math.max(pay, recv * (1 - easeInOut(seg(t, 3.6, 4.0))))), mood: t > 3.0 ? 'grin' : 'smile', lift: 8 * hump(seg(t, 3.5, 3.9)) });
      me.body.children[3].setAttribute('transform', `translate(${t < 1.2 ? 4 : 5} ${t < 1.2 ? -4 : 0})`);
      const mh = hp(me, 1.0, 'R');
      money.forEach((m, i) => {
        const onDesk = t > 1.6;
        tf(m, onDesk ? 252 + i * 5 : mh.x + 4 + i * 3, onDesk ? 190 - i * 2 : mh.y - 4 - i * 2);
        m.setAttribute('opacity', t > 1.2 ? 1 : 0);
      });
      P(clerk, { facing: -1, look: 0.7, blink: blinkAt(t, 1), mood: t > 2.3 ? 'grin' : 'smile', armL: 10, armR: 10 });
      if (give > 0) clerk.pose({ armR: lerp(10, reach(clerk, SC, 'R', 236, 176), give) });
      const ch = hp(clerk, SC, 'R');
      const hand = t < 2.7 ? ch : mh;
      tf(key, hand.x - 8, hand.y - 4, 0); key.setAttribute('opacity', t > 2.2 ? 1 : 0);
      tf(ticket, hand.x + 2, hand.y - 12, -10); ticket.setAttribute('opacity', t > 2.2 ? 1 : 0);
      // 料金表：朝食の絵が枠の中に入って光る
      const inP = backOut(seg(t, 2.7, 3.1));
      tf(bf, BX + 108, BY + 66, 0, Math.max(0.001, inP));
      plus.setAttribute('opacity', seg(t, 2.7, 2.9));
      frame.setAttribute('stroke-width', (3 + 2 * hump(seg(t, 3.1, 3.6))).toFixed(2));
    }
  };
}
