// hot：熱いお茶に手を伸ばしかけて、湯気に驚いて手を引っ込める（例文 Be careful. The tea is hot.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg } from './look-over.js';

export const meta = { duration: 3.6, beats: [[0, 'お茶が出る'], [1.2, '手を伸ばす'], [2.6, '熱くて引く']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 244);
  el('rect', { x: 190, y: 176, width: 190, height: 9, rx: 3, fill: pal.wood });
  el('rect', { x: 200, y: 185, width: 8, height: FY - 185, fill: pal.woodDark });
  el('rect', { x: 362, y: 185, width: 8, height: FY - 185, fill: pal.woodDark });
  k.shadow(285, 178, 28, 4);
  // カップ（机の上に置いたまま）
  el('path', { d: 'M 262 148 H 308 V 164 Q 308 176 285 176 Q 262 176 262 164 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('path', { d: 'M 308 154 Q 322 154 320 164 Q 318 172 307 168', fill: 'none', stroke: pal.line, 'stroke-width': 4 });
  el('ellipse', { cx: 285, cy: 148, rx: 23, ry: 4, fill: '#C9843F' });
  const hotTint = el('rect', { x: 262, y: 148, width: 46, height: 28, rx: 10, fill: pal.red, opacity: 0 });
  const steam = [0, 1, 2].map((i) => el('path', { d: 'M 0 0 Q 6 -10 0 -20 Q -6 -30 0 -40', fill: 'none', stroke: '#B9C4D2', 'stroke-width': 4, 'stroke-linecap': 'round' }));
  const bang = k.text(335, 120, '!', { 'font-size': 34, 'font-weight': 800, fill: pal.red, 'text-anchor': 'middle' });
  const b = k.buddy({ x: 130, y: FY, scale: 0.95 });
  return {
    update(t) {
      const reach = easeInOut(seg(t, 1.0, 1.9)), pull = easeOut(seg(t, 2.35, 2.8));
      const arm = lerp(8, 95, reach) - lerp(0, 95, pull) + wobble(seg(t, 2.8, 3.5)) * 6;
      const jump = hump(seg(t, 2.35, 2.9));
      P(b, { x: 130 + lerp(0, 40, reach) - 55 * pull, armR: arm, lean: lerp(0, 10, reach) - 14 * pull, squash: 1 + 0.04 * jump,
        lift: 8 * jump, look: 0.7, mood: pull > 0 ? 'open' : 'smile', blink: blinkAt(t) });
      const grow = easeOut(seg(t, 0.4, 2.2));
      steam.forEach((s, i) => {
        const u = ((t * 0.5 + i / 3) % 1), sc = 0.5 + grow * 0.9;
        tf(s, 272 + i * 13 + Math.sin(t * 3 + i) * 3, 142, 0, sc, sc); s.setAttribute('opacity', (0.25 + 0.7 * grow) * (1 - u));
        tf(s, 272 + i * 13 + Math.sin(t * 3 + i) * 3, 142 - u * 14, 0, sc, sc);
      });
      hotTint.setAttribute('opacity', 0.35 * grow);
      tf(bang, 0, 0, 0, 1, 1); bang.setAttribute('opacity', pull);
    }
  };
}
