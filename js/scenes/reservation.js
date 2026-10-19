// reservation：レストランの入口で2人が予約を伝え、店員が予約帳を確かめて「RESERVED」の2人席へ案内する（例文 I have a reservation for two.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, walk, path, held, cue, deskFront, popIn, mark } from './vehicle.js';

export const meta = { duration: 4.4, beats: [[0, '予約しています'], [1.4, '2名さま'], [2.8, '予約席へ']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = 236;
  k.backdrop({ floorY: FY, mood: 'evening' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#F7EBDD' });
  [60, 330].forEach((x) => { el('line', { x1: x, y1: 0, x2: x, y2: 30, stroke: pal.ink, 'stroke-width': 2 }); el('path', { d: `M ${x - 14} 44 L ${x} 30 L ${x + 14} 44 Z`, fill: pal.yellow }); });
  // 予約席（右）
  el('rect', { x: 250, y: 176, width: 120, height: 8, rx: 3, fill: pal.woodDark }); [262, 358].forEach((x) => el('rect', { x: x - 3, y: 184, width: 6, height: 52, fill: pal.woodDark }));
  el('rect', { x: 250, y: 160, width: 120, height: 16, fill: '#fff', opacity: 0.9 });
  const card = g({}); el('rect', { x: -22, y: -14, width: 44, height: 18, rx: 3, fill: '#fff', stroke: pal.coral, 'stroke-width': 2 }, card); k.text(0, -5, 'RESERVED', { 'font-size': 7, fill: pal.coralDark }, card); k.tf(card, 310, 160);
  [236, 384].forEach((x) => { el('rect', { x: x - 10, y: 130, width: 8, height: 106, rx: 3, fill: pal.wood }); el('rect', { x: x - 14, y: 196, width: 24, height: 6, fill: pal.wood }); });
  const waiter = k.buddy({ x: 170, y: FY + 4, scale: 0.86, facing: -1, color: pal.blue, dark: pal.blueDark });
  el('path', { d: 'M -14 -32 L 0 -26 L 14 -32 L 14 -20 L 0 -26 L -14 -20 Z', fill: pal.ink }, waiter.body);
  deskFront(k, 140, 60, 186, FY, '#8A5A3C', '#6E4630');
  const book = g({}); el('rect', { x: -14, y: -4, width: 28, height: 10, rx: 2, fill: pal.red }, book);
  k.tf(book, 170, 184);
  const a = k.buddy({ x: 70, y: FY + 6, scale: 0.86 }), b = k.buddy({ x: 20, y: FY + 6, scale: 0.86, color: pal.coral, dark: pal.coralDark });
  const two = cue(k, '2', 40, 32, 1, 20);
  const ok = mark(k, 'check');
  const XA = path([[2.8, 70], [4.2, 270]]), XB = path([[2.9, 20], [4.3, 220]]), XW = path([[2.6, 170], [3.8, 340]]);
  return {
    update(t) {
      const tk = t > 0.6 && t < 1.6 && Math.sin(t * 22) > 0 ? 'open' : 'grin';
      walk(a, XA, t, { mood: tk, look: 0.6, blink: blinkAt(t) });
      if (t < 2.6) a.pose({ armR: 8 + 100 * hump(seg(t, 0.6, 1.8)) });
      walk(b, XB, t, { mood: 'smile', look: 0.6, blink: blinkAt(t, 1) });
      two.show(seg(t, 0.7, 1.0) * (1 - seg(t, 2.0, 2.3)), 104, 120);
      // 店員：予約帳を見る → チェック → 先に立って席へ
      walk(waiter, XW, t, { facing: t > 2.5 ? 1 : -1, look: t < 1.6 ? 0.9 : t < 2.4 ? -0.2 : 0.6, mood: 'grin', blink: blinkAt(t, 0.5) });
      if (t < 2.5) { waiter.body.children[3].setAttribute('transform', t > 1.4 && t < 2.2 ? 'translate(0 6)' : 'translate(0 0)'); waiter.pose({ armR: 30 + 20 * hump(seg(t, 1.6, 2.2)), lean: t > 1.4 && t < 2.2 ? 10 : 0 }); }
      else { waiter.body.children[3].setAttribute('transform', 'translate(0 0)'); waiter.pose({ armR: 80 }); }
      k.tf(ok, 196, 160, 0, popIn(seg(t, 2.0, 2.3)) * (1 - seg(t, 2.8, 3.0)) * 1.4 + 0.001);
      k.tf(card, 310, 160, 0, 1 + 0.15 * hump(seg(t, 3.6, 4.2)));
      void lerp; void easeInOut; void easeOut; void held;
    }
  };
}
