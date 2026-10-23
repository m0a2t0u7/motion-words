// new：箱から出した新しい携帯電話を手に取り、ピカピカに光らせて掲げる（例文 I bought a new phone.）
import { seg, lerp, easeInOut, easeOut, hump, backOut, wobble } from '../ease.js';
import { P, blinkAt, star } from './run-after.js';
import { roomBg } from './look-over.js';
import { held } from './dig.js';

export const meta = { duration: 3.6, beats: [[0, '箱の中'], [1.3, '手に取る'], [2.6, '新品を掲げる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  // 机
  k.shadow(260, FY + 2, 70, 5);
  el('rect', { x: 185, y: 211, width: 150, height: 8, rx: 3, fill: pal.wood });
  el('rect', { x: 212, y: 219, width: 7, height: 21, fill: pal.woodDark }); el('rect', { x: 321, y: 219, width: 7, height: 21, fill: pal.woodDark });
  // 箱（ふたは奥に開く）
  el('rect', { x: 195, y: 201, width: 54, height: 10, rx: 3, fill: pal.blue });
  const lid = g({}); el('rect', { x: -27, y: -5, width: 54, height: 7, rx: 2, fill: pal.blueDark }, lid);
  const b = k.buddy({ x: 165, y: FY + 8, scale: 1 });
  const ph = g({}); el('rect', { x: -7, y: -26, width: 14, height: 26, rx: 3, fill: pal.ink }, ph); el('rect', { x: -5.5, y: -23, width: 11, height: 19, rx: 1.5, fill: '#9FD6F5' }, ph);
  const shine = el('path', { d: 'M -5 -23 L 2 -23 L -4 -6 L -5.5 -6 Z', fill: '#fff', opacity: 0.6 }, ph);
  const sp = [0, 1, 2, 3].map(() => star(k));
  return {
    update(t) {
      const lp = easeOut(seg(t, 0.3, 0.9)), r = easeInOut(seg(t, 1.0, 1.7)), up = easeInOut(seg(t, 1.9, 2.7));
      tf(lid, 222, 201 - lp * 4, 0, 1, lerp(1, 0.15, lp));
      const A = lerp(8, 82, r) + (up * 85);
      P(b, { armR: A - (A > 82 ? wobble(seg(t, 2.7, 3.5)) * 6 : 0), armL: 8 + up * 10, lean: -3 * up, look: 0.5, mood: up > 0.5 ? 'grin' : 'smile', blink: blinkAt(t) });
      if (r < 0.85) tf(ph, 222, 203 - lp * 3);
      else held(k, b, 1, ph, 'R', b.state.armR - b.state.lean);
      const on = seg(t, 2.6, 3.6);
      sp.forEach((s, i) => { const u = (on * 1.4 + i * 0.25) % 1; s.set(205 + i * 22 - 20 + b.state.armR * 0.05, 140 - (i % 2) * 14, on > 0 ? u : 0); });
      shine.setAttribute('opacity', 0.35 + 0.4 * hump((t * 0.8) % 1));
    }
  };
}
