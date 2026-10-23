// class：9時の数学の授業。時計が9時になり、まめが席でノートを開いて黒板の式を写す（I have a math class at nine.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, desk } from './look-over.js';
import { hp } from './dig.js';

export const meta = { duration: 4.2, beats: [[0, '8時55分'], [1.5, '9時になる'], [3.0, '授業が始まる']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.0;
  const FY = roomBg(k, 'home', 240);
  // 黒板
  el('rect', { x: 170, y: 40, width: 210, height: 92, rx: 6, fill: '#3E6B58', stroke: pal.woodDark, 'stroke-width': 5 });
  const eq = k.text(275, 98, '', { 'font-size': 30, fill: '#fff', 'text-anchor': 'middle' });
  // 時計
  const ck = g({}); tf(ck, 90, 76);
  el('circle', { r: 26, fill: '#fff', stroke: pal.ink, 'stroke-width': 3 }, ck);
  const hh = el('line', { x1: 0, y1: 0, x2: 0, y2: -13, stroke: pal.ink, 'stroke-width': 4, 'stroke-linecap': 'round' }, ck);
  const mm = el('line', { x1: 0, y1: 0, x2: 0, y2: -20, stroke: pal.coralDark, 'stroke-width': 3, 'stroke-linecap': 'round' }, ck);
  // 先生
  const tc = k.buddy({ x: 330, y: FY, scale: 0.9, facing: -1, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 150, y: FY, scale: S });
  desk(k, 100, 170, 200);
  const nb = g({});
  el('rect', { x: -26, y: -4, width: 52, height: 8, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, nb);
  const pn = g({});
  el('line', { x1: 0, y1: 0, x2: -18, y2: -5, stroke: pal.yellowDark, 'stroke-width': 4, 'stroke-linecap': 'round' }, pn);
  return {
    update(t) {
      const c = easeInOut(seg(t, 0.5, 1.6));
      const min = lerp(55, 60, c);
      k.set(hh, { transform: `rotate(${(270 + (min / 60) * 30).toFixed(1)})` });
      k.set(mm, { transform: `rotate(${(min * 6).toFixed(1)})` });
      const on = seg(t, 2.0, 2.4);
      eq.textContent = on > 0 ? '2 + 3 = 5'.slice(0, Math.ceil(on * 9)) : '';
      tf(nb, 215, 196);
      const wr = t > 2.8 ? Math.sin(t * 16) : 0;
      P(b, { armR: lerp(20, 62, easeInOut(seg(t, 1.8, 2.6))) + wr * 5, armL: 20, lean: 4, look: t > 1.9 && t < 2.8 ? 0.6 : 0, mood: t > 1.5 ? 'smile' : 'flat', blink: blinkAt(t) });
      const h = hp(b, S, 'R');
      tf(pn, h.x + 2, h.y + 2, 20);
      P(tc, { armR: 90 * easeInOut(seg(t, 1.9, 2.4)), look: 0.5, mood: 'open', blink: blinkAt(t, 1) });
    }
  };
}
