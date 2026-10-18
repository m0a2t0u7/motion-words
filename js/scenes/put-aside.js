// put aside：毎月、カレンダーがめくれるたびに、まめが財布から硬貨を何枚か取り出して脇の貯金びんへ入れる。びんが少しずつたまる（例文 She puts aside some money every month.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, wobble } from '../ease.js';
import { hp, table } from './dig.js';
import { coin } from './get-on-with.js';

export const meta = { duration: 4.6, beats: [[0, '月のはじめ'], [1.4, '脇のびんへ'], [3.8, '毎月たまる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const TY = table(k, 160);
  const FY = 236;
  // 壁のカレンダー
  el('rect', { x: 40, y: 40, width: 60, height: 64, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  const head = el('rect', { x: 40, y: 40, width: 60, height: 16, rx: 4, fill: pal.coral });
  const mnum = k.text(70, 82, '1', { 'font-size': 26, fill: pal.ink });
  const page = el('rect', { x: 40, y: 56, width: 60, height: 48, fill: '#fff', stroke: pal.line, 'stroke-width': 2, opacity: 0 });
  // 財布（左寄り）と貯金びん（右の脇）
  const wal = g({}); tf(wal, 250, TY - 6);
  el('rect', { x: -18, y: -10, width: 36, height: 20, rx: 5, fill: pal.coffee }, wal);
  el('rect', { x: -18, y: -10, width: 36, height: 7, rx: 3, fill: '#6E4429' }, wal);
  const JX = 340;
  const fillR = el('rect', { x: JX - 20, y: TY - 4, width: 40, height: 0, fill: pal.yellow });
  el('path', { d: `M ${JX - 22} ${TY - 52} L ${JX - 22} ${TY - 6} Q ${JX - 22} ${TY} ${JX - 16} ${TY} L ${JX + 16} ${TY} Q ${JX + 22} ${TY} ${JX + 22} ${TY - 6} L ${JX + 22} ${TY - 52}`, fill: '#DDEFFA', 'fill-opacity': 0.35, stroke: '#9FC6DE', 'stroke-width': 3 });
  el('rect', { x: JX - 25, y: TY - 58, width: 50, height: 8, rx: 3, fill: pal.sub });
  el('rect', { x: JX - 8, y: TY - 58, width: 16, height: 3, fill: pal.ink });
  const b = k.buddy({ x: 200, y: FY, scale: 0.95 });
  const c = coin(k);
  const months = [0.3, 1.7, 3.1];
  return {
    update(t) {
      let m = 0; months.forEach((s, i) => { if (t >= s) m = i; });
      const u = t - months[m];
      // ページがめくれて月が進む
      const flip = m > 0 ? seg(u, 0, 0.3) : 1;
      mnum.textContent = String(m + 1);
      k.set(page, { opacity: 1 - flip, y: 56 - 20 * flip });
      // 財布から取り出す→びんへ運んで落とす
      const pick = easeInOut(seg(u, 0.2, 0.5)), carry = easeInOut(seg(u, 0.55, 0.95)), back = easeInOut(seg(u, 1.1, 1.35));
      b.pose({ facing: 1, armL: 10, armR: lerp(lerp(30, 80, pick), 92, carry) * (1 - back) + back * 30, lean: lerp(10 * pick, 4, carry) * (1 - back), look: lerp(0.3, 0.8, carry), mood: carry > 0.9 && back < 1 ? 'grin' : 'smile', x: lerp(200, 286, carry) * (1 - back) + back * 200, walk: (carry > 0 && carry < 1) || (back > 0 && back < 1) ? t * 9 : 0 });
      const h = hp(b, 0.95);
      const drop = easeIn(seg(u, 0.95, 1.2));
      const filled = m * 9 + (u > 1.15 ? 9 : 0);
      const cx = carry < 1 ? h.x : JX, cy = carry < 1 ? h.y - 4 : lerp(h.y - 4, TY - 4 - filled, drop);
      tf(c, cx, cy, 0, 1, carry >= 1 && drop > 0 ? 0.6 : 1);
      c.setAttribute('opacity', u > 0.35 && u < 1.2 ? 1 : 0);
      k.set(fillR, { y: TY - 4 - filled, height: filled });
    }
  };
}
