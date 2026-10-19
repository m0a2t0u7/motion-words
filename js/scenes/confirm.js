// confirm：まめが予約票を見ながら店に電話し、店員が予約台帳で名前を見つけて確認できる（例文 Please confirm your reservation by phone.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P } from './run-after.js';
import { hp } from './dig.js';
import { phone, inset } from './look-over.js';
import { mark } from './so-far-so-good.js';
import { check } from './work-on.js';

export const meta = { duration: 4.2, beats: [[0, '電話をかける'], [1.4, '台帳で探す'], [2.8, '予約を確認']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 30, y: 46, width: 80, height: 60, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const me = k.buddy({ x: 92, y: FY, scale: S });
  const ph = phone(k);
  // 予約票（左手）：テーブルと時刻
  const tk = g({});
  el('rect', { x: -16, y: -20, width: 32, height: 40, rx: 3, fill: '#fff', stroke: pal.coral, 'stroke-width': 2 }, tk);
  el('rect', { x: -16, y: -20, width: 32, height: 10, rx: 3, fill: pal.coral }, tk);
  el('rect', { x: -9, y: -4, width: 18, height: 4, rx: 1, fill: pal.woodDark }, tk);
  el('line', { x1: -6, y1: 0, x2: -6, y2: 7, stroke: pal.woodDark, 'stroke-width': 2 }, tk);
  el('line', { x1: 6, y1: 0, x2: 6, y2: 7, stroke: pal.woodDark, 'stroke-width': 2 }, tk);
  k.text(0, 14, '7:00', { 'font-size': 8, fill: pal.ink }, tk);
  // 店（小窓）：店員と予約台帳
  const ins = inset(k, 186, 30, 200, 150);
  const clerk = k.buddy({ parent: ins.inner, x: 236, y: ins.floor + 2, scale: 0.75, facing: 1, color: pal.coral, dark: pal.coralDark });
  const cph = phone(k, ins.inner);
  const book = g({}, ins.inner); tf(book, 322, 112);
  el('rect', { x: -44, y: -40, width: 88, height: 80, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, book);
  el('line', { x1: 0, y1: -40, x2: 0, y2: 40, stroke: pal.line, 'stroke-width': 2 }, book);
  const lines = [-26, -12, 2, 16, 30];
  lines.forEach((y, i) => { el('line', { x1: -38, x2: -6, y1: y, y2: y, stroke: pal.sub, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, book); el('line', { x1: 6, x2: 36, y1: y, y2: y, stroke: i === 2 ? pal.mintDark : pal.sub, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, book); });
  const finger = el('circle', { r: 5, fill: pal.coral, stroke: pal.coralDark, 'stroke-width': 2 }, ins.inner);
  const ck = check(k, 0, 0, 0.9, pal.green, book);
  const ckG = book.lastChild; ckG.setAttribute('transform', 'translate(40 2)');
  const big = mark(k, 'check', null, 1.8);
  return {
    update(t) {
      const talkOn = (t > 0.5 && t < 1.2) || (t > 3.0 && t < 3.5);
      P(me, { x: 92, armR: 150, armL: lerp(8, 70, easeOut(seg(t, 0.2, 0.6))), look: 0.6, mood: talkOn && Math.sin(t * 22) > 0 ? 'open' : t > 3.0 ? 'grin' : 'smile', lean: -4 * hump(seg(t, 2.9, 3.3)) });
      const h = hp(me, S, 'R', 28), lh = hp(me, S, 'L', 28);
      tf(ph.g, h.x - 2, h.y + 4, 10, 1);
      tf(tk, lh.x + 14, lh.y - 10, -6, 1);
      ins.show(seg(t, 0.3, 0.6));
      // 店員：指で台帳をたどる → 3行目で止まる → チェック
      const look = easeInOut(seg(t, 1.2, 1.5));
      P(clerk, { x: 236, y: ins.floor + 2, facing: 1, armR: lerp(8, 70, look), armL: 150, look: 0.8, lean: 8 * look, mood: t > 2.6 ? 'grin' : 'flat' });
      const ch = hp(clerk, 0.75, 'L', 28); tf(cph.g, ch.x + 1, ch.y + 2, 10, 0.7);
      const r = t < 1.4 ? 0 : t < 2.4 ? easeInOut(seg(t, 1.4, 2.3)) * 2 : 2;
      const fy = lerp(lines[0], lines[2], r / 2) + (r < 2 ? 0 : 0);
      k.set(finger, { cx: 322 + 22, cy: 112 + fy + 6, opacity: look > 0.1 ? 1 : 0 });
      ck(easeOut(seg(t, 2.4, 2.8)));
      const bp = seg(t, 3.0, 3.4);
      tf(big, lh.x + 60, lh.y - 72, 0, bp > 0 ? backOut(bp) * 1.8 : 0.001);
    }
  };
}
