// go on：話の途中で止まったまめに、聞き手が「続けて」と手を回してうながし、まめが話を続ける（例文 Please go on. I'm listening.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, sofa, win } from './run-after.js';
import { bubble } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '話している'], [1.3, '止まる→続けて'], [3.0, '話し続ける']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const w = win(k, 160, 44, 80, 62); w.frame();
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  // 小さな机とカップ
  el('rect', { x: 176, y: 196, width: 48, height: 6, rx: 3, fill: pal.wood }); el('rect', { x: 197, y: 202, width: 6, height: 34, fill: pal.woodDark });
  el('rect', { x: 190, y: 184, width: 12, height: 12, rx: 2, fill: '#fff', stroke: pal.line });
  k.shadow(200, 237, 26, 3);
  const S = 0.85;
  const a = k.buddy({ x: 110, y: FY, scale: S });
  const c = k.buddy({ x: 290, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const talk = bubble(k, 70, 40);
  const lines = [0, 1].map((i) => el('rect', { x: -24, y: -9 + i * 12, width: 48, height: 5, rx: 2.5, fill: pal.blue }, talk));
  const dots = g({}, talk); [-10, 0, 10].forEach((x) => el('circle', { cx: x, cy: 0, r: 3, fill: pal.sub }, dots));
  const roll = g({}); tf(roll, 0, 0);
  el('path', { d: 'M 0 -9 A 9 9 0 1 1 -9 0', stroke: pal.coralDark, 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round' }, roll);
  el('path', { d: 'M -13 -2 L -9 5 L -4 -1 Z', fill: pal.coralDark }, roll);
  return {
    update(t) {
      const paused = t > 1.2 && t < 2.8;
      const speak = !paused;
      const ph = t * 13;
      P(a, { x: 110, look: 0.6, armR: speak ? 50 + 18 * Math.sin(t * 5) : 14, armL: 10, lean: speak ? 3 : -2, mood: speak && Math.sin(ph) > 0 ? 'open' : paused ? 'flat' : 'smile', blink: blinkAt(t) });
      // 文字の行：話すと伸び、止まると「…」
      const p2 = seg(t, 2.8, 4.2), p1 = seg(t, 0, 1.2);
      lines[0].setAttribute('width', 48 * (t < 1.2 ? easeOut(seg(p1, 0, 0.5)) : t < 2.8 ? 1 : 1));
      lines[1].setAttribute('width', 48 * (t < 1.2 ? easeOut(seg(p1, 0.5, 1)) : t < 2.8 ? 0.4 : lerp(0.4, 1, easeOut(p2))));
      lines.forEach((l) => l.setAttribute('opacity', paused ? 0.25 : 1));
      dots.setAttribute('opacity', paused ? 1 : 0);
      tf(talk, 120, 104);
      // 聞き手：うなずき、手をくるくる回して「続けて」
      const rollA = easeInOut(seg(t, 1.5, 1.8)) * (1 - easeInOut(seg(t, 2.7, 3.0)));
      const nod = Math.max(0, Math.sin(t * 5)) * (t > 3.0 ? 1 : 0.3);
      P(c, { x: 290, facing: -1, look: 0.6, armR: lerp(8, 80 + 25 * Math.sin(t * 9), rollA), armL: 8, lean: 6 * nod + 4 * rollA, mood: 'smile', blink: blinkAt(t, 1) });
      tf(roll, 248, 160, -t * 300, rollA); roll.setAttribute('opacity', rollA > 0.05 ? 1 : 0);
    }
  };
}
