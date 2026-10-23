// personal：他の人からの個人的な質問に、まめが手を出して「やめて」と断る（例文 Please don't ask me personal questions.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, say } from './look-over.js';

export const meta = { duration: 4.0, beats: [[0, '質問される'], [1.2, '手でとめる'], [2.8, 'お断り']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  k.shadow(120, FY + 2, 26, 5); k.shadow(300, FY + 2, 26, 5);
  const me = k.buddy({ x: 120, y: FY, scale: 1 });
  const you = k.buddy({ x: 300, y: FY, scale: 1, facing: -1, color: pal.coral, dark: pal.coralDark });
  const q = say(k, 64, 44, -1);
  k.text(0, 0, '?', { 'font-size': 26, 'font-weight': 700, fill: pal.coralDark, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, q.g);
  const no = say(k, 64, 44, 1);
  el('circle', { r: 14, fill: 'none', stroke: pal.red, 'stroke-width': 4 }, no.g);
  el('path', { d: 'M -10 -10 L 10 10', stroke: pal.red, 'stroke-width': 4, 'stroke-linecap': 'round' }, no.g);
  return {
    update(t) {
      const a = seg(t, 0.3, 0.8), stop = easeInOut(seg(t, 1.3, 1.9)), n = seg(t, 2.1, 2.5);
      P(you, { x: 300, facing: -1, armR: 8 + 25 * hump(seg(t, 0.2, 0.9)), mood: 'smile', blink: blinkAt(t, 1) });
      P(me, { x: 120, armR: lerp(8, 92, stop), armL: 8 + 20 * stop, lean: -6 * stop, mood: n > 0 ? 'flat' : 'smile', look: 0.6, blink: blinkAt(t) });
      q.show(a * (1 - 0.4 * n), 262, 112, 1);
      no.show(n, 170, 112, 1);
    }
  };
}
