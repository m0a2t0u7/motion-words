// keep one's word：カレンダーの「本を返す日」（丸印）に、まめが本を持って来て相手に返す。約束どおりでチェックが付く（例文 He kept his word and returned the book.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, reach, held, walk, path, icon, check, popIn } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '約束の日'], [1.6, '本を返す'], [3.2, '約束を守った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  // カレンダー：丸印の日に本マーク
  const CX = 40, CY = 44;
  el('rect', { x: CX, y: CY, width: 120, height: 88, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: CX, y: CY, width: 120, height: 16, rx: 6, fill: pal.coral });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) el('rect', { x: CX + 8 + c * 22, y: CY + 22 + r * 21, width: 18, height: 17, rx: 3, fill: '#F4F7FA' });
  const dx = CX + 8 + 3 * 22 + 9, dy = CY + 22 + 1 * 21 + 8;
  el('circle', { cx: dx, cy: dy, r: 12, fill: 'none', stroke: pal.red, 'stroke-width': 2.5 });
  const bi = icon(k, 'book', k.root); tf(bi, dx, dy, 0, 0.45);
  const tick = check(k, dx + 2, dy + 1, 1.1, pal.green);
  el('rect', { x: 250, y: 46, width: 90, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const C = k.buddy({ x: 170, y: FY, scale: 0.88, color: pal.coral, dark: pal.coralDark });
  const A = k.buddy({ x: 450, y: FY, scale: 0.88, facing: -1 });
  const book = g({}); icon(k, 'book', book);
  const xa = path([[0.2, 450], [1.4, 270]]);
  return {
    update(t) {
      walk(A, xa, t, { look: 0.5, mood: 'grin' });
      const give = easeInOut(seg(t, 1.5, 2.0));
      const ret = easeOut(seg(t, 2.6, 3.0));
      if (t > 1.3) A.pose({ armR: lerp(lerp(30, 85, give), 8, ret) });
      else A.pose({ armR: 30 });
      // ピンク：カレンダーを見て待つ→受け取って喜ぶ→カレンダーにチェック
      const take = easeOut(seg(t, 1.8, 2.2));
      P(C, { facing: t < 1.0 || t > 2.9 ? -1 : 1, look: t > 2.9 ? 0.2 : 0.6, mood: t > 2.0 ? 'grin' : 'flat', armR: lerp(8, 82, take) - 30 * easeOut(seg(t, 2.4, 2.9)), lift: 4 * hump(seg(t, 2.2, 2.6)) });
      const ha = held(k, A, 0.88, k.g({}), 'R'), hc = held(k, C, 0.88, k.g({}), 'R');
      const mine = t > 2.15;
      tf(book, mine ? hc.x : ha.x, (mine ? hc.y : ha.y) - 10, 0, 0.9);
      tick(easeOut(seg(t, 3.3, 3.7)));
    }
  };
}
