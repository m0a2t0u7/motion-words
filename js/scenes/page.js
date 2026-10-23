// page：本を手に取って開き、20ページを開く（例文 Open your books to page 20.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, desk, hp, reach } from './look-over.js';
import { grip } from './hand-over.js';

export const meta = { duration: 4.0, beats: [[0, '閉じた本'], [1.6, '開く'], [3.2, '20ページ']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'home', 240);
  const b = k.buddy({ x: 190, y: FY, scale: S });
  desk(k, 250, 140, 200);
  const book = g({});
  const L = el('rect', { x: -30, y: -30, width: 30, height: 60, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, book);
  const R = el('rect', { x: 0, y: -30, width: 30, height: 60, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, book);
  [-14, -6, 2, 10].forEach((y) => { el('line', { x1: -24, x2: -6, y1: y, y2: y, stroke: pal.line, 'stroke-width': 2 }, book); el('line', { x1: 6, x2: 24, y1: y, y2: y, stroke: pal.line, 'stroke-width': 2 }, book); });
  const cover = g({}, book);
  const cv = el('rect', { x: -24, y: -33, width: 48, height: 66, rx: 4, fill: pal.blue, stroke: pal.blueDark, 'stroke-width': 2 }, cover);
  el('rect', { x: -12, y: -18, width: 24, height: 8, rx: 2, fill: '#fff', opacity: 0.8 }, cover);
  const flip = el('rect', { x: 0, y: -30, width: 30, height: 60, rx: 3, fill: '#F4F1EA', stroke: pal.line, 'stroke-width': 2 }, book);
  const num = k.text(15, 12, '20', { 'font-size': 20, 'font-weight': 800, fill: pal.coralDark }, book);
  const gr = grip(k, pal.mint, pal.mintDark, S);
  return {
    update(t) {
      const up = easeInOut(seg(t, 0.3, 1.5)), op = easeOut(seg(t, 1.6, 2.2)), fl = easeInOut(seg(t, 2.3, 3.0));
      P(b, { armR: lerp(30, 85, up), armL: 8, lean: 3, mood: t > 3.1 ? 'grin' : 'smile', blink: blinkAt(t), look: 3 });
      const h = hp(b, S, 'R');
      tf(book, lerp(290, h.x + 18, up), lerp(174, h.y - 14, up), 0, 0.8, 0.8);
      gr(h);
      // 閉じた表紙→見開き
      cover.setAttribute('opacity', 1 - seg(t, 1.6, 1.9));
      tf(cover, 0, 0, 0, 1 - op * 0.2, 1);
      const open = op;
      L.setAttribute('opacity', open); R.setAttribute('opacity', open);
      // めくるページ：右から左へ
      const ang = lerp(1, -1, fl);
      k.set(flip, { x: ang >= 0 ? 0 : 30 * ang, width: Math.abs(ang) * 30 + 0.01, opacity: op > 0.9 && fl < 1 ? 1 : 0 });
      num.setAttribute('opacity', fl > 0.98 ? 1 : 0);
    }
  };
}
