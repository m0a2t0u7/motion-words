// magazine：彼女（まめ）が売店で雑誌を買う。カレンダーのめくりで「毎月」を示す（She buys a fashion magazine every month.）
import { seg, lerp, easeInOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, desk } from './look-over.js';
import { hp } from './dig.js';

export const meta = { duration: 4.2, beats: [[0, '売店へ'], [1.3, 'お金を払う'], [2.8, '雑誌を買った']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.0;
  const FY = roomBg(k, 'home', 240);
  // 月カレンダー
  const cal = g({}); tf(cal, 60, 80);
  el('rect', { x: -32, y: -28, width: 64, height: 58, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, cal);
  el('rect', { x: -32, y: -28, width: 64, height: 16, rx: 6, fill: pal.violet }, cal);
  const mo = k.text(0, 17, '1', { 'font-size': 26, fill: pal.ink, 'text-anchor': 'middle' }, cal);
  // 店員
  const sk = k.buddy({ x: 335, y: FY, scale: 0.9, facing: -1, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 70, y: FY, scale: S });
  desk(k, 215, 130, 196);
  // 棚の雑誌
  const mags = [pal.coral, pal.blue, pal.yellow].map((c, i) => {
    const m = g({}); tf(m, 240 + i * 30, 192, 0);
    el('rect', { x: -12, y: -36, width: 24, height: 34, rx: 2, fill: c }, m);
    el('rect', { x: -8, y: -30, width: 16, height: 10, rx: 1, fill: '#fff', opacity: 0.8 }, m);
    return m;
  });
  const coin = g({});
  el('circle', { r: 6, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, coin);
  const mg = g({});
  el('rect', { x: -14, y: -3, width: 28, height: 38, rx: 2, fill: pal.coral, stroke: pal.coralDark, 'stroke-width': 2 }, mg);
  el('rect', { x: -9, y: 4, width: 18, height: 12, rx: 1, fill: '#fff', opacity: 0.85 }, mg);
  return {
    update(t) {
      const walk = easeInOut(seg(t, 0.2, 1.4));
      const x = lerp(70, 165, walk), pay = seg(t, 1.4, 2.0), take = seg(t, 2.1, 2.8);
      const m = Math.sin(walk * Math.PI);
      P(b, { x, walk: walk * 11, armL: 8 + m * 12, armR: lerp(lerp(8 - m * 12, 70, pay), 40, take), lean: 3 * m, look: 0.5, mood: take > 0.9 ? 'grin' : 'smile', blink: blinkAt(t), facing: 1 });
      const h = hp(b, S, 'R');
      tf(coin, lerp(h.x, 262, easeInOut(pay)), lerp(h.y, 190, easeInOut(pay)) - 10 * Math.sin(pay * Math.PI));
      coin.setAttribute('opacity', pay > 0 && pay < 1 ? 1 : 0);
      mags[2].setAttribute('opacity', take > 0 ? 0 : 1);
      tf(mg, h.x + 2, h.y + 4, -8);
      mg.setAttribute('opacity', take > 0 ? 1 : 0);
      mo.textContent = t < 1.4 ? '1' : t < 2.8 ? '2' : '3';
      P(sk, { armR: 8, armL: lerp(8, 70, hump(pay)), look: 0.4, mood: 'smile', blink: blinkAt(t, 1) });
    }
  };
}
