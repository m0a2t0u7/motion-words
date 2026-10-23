// low：天井が高い部屋から低い部屋に入り、頭をかがめる（例文 The ceiling is low here.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';

export const meta = { duration: 3.8, beats: [[0, '天井が高い'], [1.4, '低いところへ'], [2.8, 'かがんで通る']] };

export function create(k) {
  const { el, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  const LOW = FY - 80;
  // 天井（左は高く、右は低い）
  el('path', { d: `M 0 0 H 400 V ${LOW} H 220 V 22 H 0 Z`, fill: '#E6DCCB' });
  el('path', { d: `M 220 22 V ${LOW} H 400`, stroke: pal.woodDark, 'stroke-width': 4, fill: 'none' });
  el('rect', { x: 220, y: LOW - 3, width: 180, height: 3, fill: pal.woodDark });
  el('rect', { x: 0, y: 19, width: 220, height: 3, fill: pal.woodDark });
  // 高さの目印
  const arrow = el('path', { d: `M 330 ${LOW + 6} V ${FY - 8} M 324 ${LOW + 14} L 330 ${LOW + 6} L 336 ${LOW + 14} M 324 ${FY - 16} L 330 ${FY - 8} L 336 ${FY - 16}`, stroke: pal.coralDark, 'stroke-width': 2.5, fill: 'none', opacity: 0.8 });
  const b = k.buddy({ x: 40, y: FY + 4, scale: 1 });
  const star = el('path', { d: 'M 0 -9 L 3 -3 L 9 0 L 3 3 L 0 9 L -3 3 L -9 0 L -3 -3 Z', fill: pal.yellow });
  const xf = (u) => lerp(40, 330, easeInOut(seg(u, 0.2, 3.5)));
  return {
    update(t) {
      const w = walkTo(xf, t, 40);
      // 低い天井の下（x>235付近）ではかがむ。天井 LOW は頭上 108 - 本人の高さ約 92 より少し低い
      const duck = seg(w.x, 195, 250);
      const bump = hump(seg(t, 1.9, 2.4));
      P(b, { ...w, y: FY + 4, squash: 1 - 0.14 * duck - 0.06 * bump, lean: w.lean + 7 * duck, armL: w.armL + 10 * duck, armR: w.armR + 10 * duck, mood: bump > 0.3 ? 'open' : duck > 0.5 ? 'flat' : 'smile', look: 0.6, blink: blinkAt(t) });
      star.setAttribute('opacity', bump > 0.1 ? 1 : 0);
      tf(star, w.x + 18, LOW + 14 - bump * 4, t * 200, 0.5 + bump);
    }
  };
}
