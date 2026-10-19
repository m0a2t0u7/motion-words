// contain：まめが段ボール箱のふたを開けると、中に古い本が5冊入っている。1冊ずつ数える（例文 This box contains five old books.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg } from './look-over.js';

export const meta = { duration: 4.2, beats: [[0, '箱を開ける'], [1.4, '中に古い本'], [3.0, '5冊入っている']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 240;
  roomBg(k, 'home', FY);
  const BX = 236, BW = 120, BT = 164; // 箱の左端・幅・上端
  // 本（古い：くすんだ色、すり切れ、背の線）
  const cols = ['#9C7B5B', '#7E8F6E', '#A0675A', '#6F7F95', '#B39662'];
  const books = cols.map((c, i) => {
    const b = g({});
    const h = 46 + (i % 2) * 8, w = 18;
    el('rect', { x: -w / 2, y: -h, width: w, height: h, rx: 2, fill: c }, b);
    el('rect', { x: -w / 2, y: -h + 8, width: w, height: 3, fill: '#E9D7A6', opacity: 0.7 }, b);
    el('rect', { x: -w / 2, y: -14, width: w, height: 3, fill: '#E9D7A6', opacity: 0.7 }, b);
    el('path', { d: `M ${-w / 2 + 3} ${-h + 20} l 4 6 l -2 5`, stroke: '#000', 'stroke-width': 1, opacity: 0.25, fill: 'none' }, b);
    tf(b, BX + 20 + i * 20, BT + 34);
    return b;
  });
  // 箱の前面（本の下半分を隠す）と ふた
  k.shadow(BX + BW / 2, FY + 1, BW / 2 + 8, 5);
  el('rect', { x: BX, y: BT, width: BW, height: FY - BT, rx: 3, fill: '#E3B77E' });
  el('rect', { x: BX, y: BT, width: BW, height: 6, fill: '#000', opacity: 0.08 });
  el('rect', { x: BX + BW / 2 - 16, y: BT + 20, width: 32, height: 20, rx: 2, fill: '#fff', opacity: 0.7 });
  const flapL = g({}), flapR = g({});
  el('rect', { x: -BW / 2, y: -4, width: BW / 2, height: 8, rx: 2, fill: '#D6A86E' }, flapL);
  el('rect', { x: 0, y: -4, width: BW / 2, height: 8, rx: 2, fill: '#D6A86E' }, flapR);
  const nums = [1, 2, 3, 4, 5].map((n) => { const c = g({}); el('circle', { r: 10, fill: pal.yellow }, c); k.text(0, 1, String(n), { 'font-size': 12 }, c); return c; });
  const me = k.buddy({ x: 176, y: FY, scale: 1.0, facing: 1 });
  return {
    update(t) {
      // ふたを左右に開く（手で）
      const op = easeOut(seg(t, 0.4, 1.1));
      tf(flapL, BX + BW / 2, BT, 0, 1, 1); flapL.setAttribute('transform', `translate(${BX} ${BT}) rotate(${(-170 * op).toFixed(2)}) translate(${BW / 2} 0)`);
      flapR.setAttribute('transform', `translate(${BX + BW} ${BT}) rotate(${(170 * op).toFixed(2)}) translate(${-BW / 2} 0)`);
      // 本は箱の中で静止（開いたら上部が見える）。開く前は隠す
      books.forEach((b) => b.setAttribute('opacity', op > 0.35 ? 1 : 0));
      // まめ：ふたを開ける → のぞく → 1冊ずつ指して数える
      const cnt = seg(t, 1.5, 3.1) * 5;
      const pointX = BX + 20 + Math.min(4, Math.floor(cnt)) * 20;
      const pointing = t > 1.5 && t < 3.3;
      P(me, { look: 0.9, blink: blinkAt(t), lean: t < 1.2 ? 14 * hump(seg(t, 0.3, 1.2)) : pointing ? 10 : 0, armL: t < 1.2 ? 80 * hump(seg(t, 0.3, 1.2)) : 10,
        armR: t < 1.2 ? 90 * hump(seg(t, 0.3, 1.2)) : pointing ? 70 + (pointX - BX) * 0.2 : 10 + 140 * easeOut(seg(t, 3.4, 3.7)),
        mood: t > 3.3 ? 'grin' : pointing && Math.sin(t * 20) > 0 ? 'open' : 'smile' });
      me.body.children[3].setAttribute('transform', `translate(${t > 1.2 ? 6 : 3} 0)`);
      nums.forEach((n, i) => { const q = seg(cnt - i, 0, 0.6); tf(n, BX + 20 + i * 20, BT - 30 - (i % 2) * 8, 0, q > 0 ? Math.max(0.001, backOut(q)) : 0.001); });
    }
  };
}
