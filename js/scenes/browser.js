import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { hp } from './dig.js';
import { grip } from './hand-over.js';
import { roomBg, say, desk } from './look-over.js';
// browser：パソコンの前で、青いブラウザの画面のページをクリックして、別の色のブラウザで開き直す（例文 Open the page in a different browser.）
export const meta = { duration: 4.2, beats: [[0, 'このブラウザ'], [1.2, 'ページを移す'], [2.8, '別ので開く']] };
export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  const win = (x, col) => { const n = g({}); tf(n, x, 70); el('rect', { width: 130, height: 100, rx: 8, fill: '#fff', stroke: col, 'stroke-width': 4 }, n); el('rect', { width: 130, height: 20, rx: 6, fill: col }, n); el('rect', { x: 8, y: 5, width: 80, height: 10, rx: 5, fill: '#fff', opacity: 0.8 }, n); [0, 1].forEach((i) => el('circle', { cx: 104 + i * 12, cy: 10, r: 3.5, fill: '#fff' }, n)); return n; };
  const wa = win(170, pal.blue), wb = win(260, pal.coral);
  const pg = g({}); el('rect', { x: -26, y: -20, width: 52, height: 40, rx: 5, fill: '#FFF6D6', stroke: pal.yellowDark, 'stroke-width': 2 }, pg); [-8, 2, 12].forEach((y) => el('rect', { x: -17, y, width: 34, height: 4, rx: 2, fill: pal.yellowDark, opacity: 0.6 }, pg));
  desk(k, 120, 250, 200);
  const b = k.buddy({ x: 80, y: FY, scale: S });
  const cur = el('path', { d: 'M 0 0 L 0 16 L 5 12 L 9 20 L 12 18 L 8 11 L 14 11 Z', fill: pal.ink, stroke: '#fff', 'stroke-width': 1.5 });
  return {
    update(t) {
      const q = easeInOut(seg(t, 1.4, 2.6)), pick = hump(seg(t, 1.0, 2.8));
      const px = lerp(205, 295, q), py = lerp(120, 125, q) - 14 * hump(q);
      tf(pg, px, py, 0, 1 + 0.1 * pick, 1 + 0.1 * pick);
      pg.setAttribute('opacity', 1);
      tf(wa, 170, 70, 0, 1 - 0.04 * seg(t, 2.6, 3.2)); tf(wb, 260 + 0, 70, 0, 1 + 0.05 * hump(seg(t, 2.4, 3.4)));
      tf(cur, px - 6, py - 6);
      P(b, { x: 80, armR: 100 + 20 * Math.sin(t * 2) * pick, lean: 8 * pick, look: 0.9, mood: t > 3 ? 'grin' : 'smile', blink: blinkAt(t) });
    }
  };
}
