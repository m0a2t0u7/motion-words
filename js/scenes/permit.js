// permit：授業中にスマホを出すと、先生が「スマホ禁止」の掲示を指して首を振り、まめはしまう（例文 The school does not permit phones in class.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { hp, held, reach } from './dig.js';
import { desk } from './get-on-with.js';
import { P, blinkAt } from './run-after.js';
import { phone } from './look-over.js';

// 禁止マーク付きの掲示（中心原点）
export function noSign(k, drawIcon, parent) {
  const g = k.g({}, parent), pal = k.pal;
  k.el('rect', { x: -34, y: -34, width: 68, height: 68, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, g);
  drawIcon(g);
  k.el('circle', { r: 26, fill: 'none', stroke: pal.red, 'stroke-width': 5 }, g);
  k.el('line', { x1: -18, y1: -18, x2: 18, y2: 18, stroke: pal.red, 'stroke-width': 5 }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '授業中'], [1.0, 'スマホ禁止'], [3.0, 'しまう']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 236, S = 1.05, ST = 1.0;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 196, y: 36, width: 180, height: 92, rx: 4, fill: '#3E6B5A', stroke: pal.woodDark, 'stroke-width': 6 });
  el('path', { d: 'M 214 62 h 60 M 214 82 h 100 M 214 102 h 40', stroke: '#fff', 'stroke-width': 3, opacity: 0.55, 'stroke-linecap': 'round' });
  k.text(330, 66, 'A+B', { 'font-size': 14, fill: '#fff', opacity: 0.7 });
  // 学校の掲示：スマホ禁止
  const sign = noSign(k, (p) => { el('rect', { x: -9, y: -15, width: 18, height: 30, rx: 3, fill: pal.ink }, p); el('rect', { x: -6.5, y: -11, width: 13, height: 20, rx: 1, fill: '#9FB4CC' }, p); });
  tf(sign, 134, 74, 0, 0.8);
  const teacher = k.buddy({ x: 318, y: FY, scale: ST, facing: -1, color: pal.coral, dark: pal.coralDark });
  const me = k.buddy({ x: 84, y: FY, scale: S });
  desk(k, 30, 120, FY);
  el('rect', { x: 46, y: 176, width: 30, height: 14, rx: 2, fill: pal.blue });
  const ph = phone(k);
  return {
    update(t) {
      const out = easeOut(seg(t, 0.4, 0.9)), away = easeInOut(seg(t, 2.9, 3.5));
      // まめ：スマホを出して見る→しまう（机の下へ）
      const arm = lerp(10, 100, out) * (1 - away) + 6 * away;
      const caught = easeOut(seg(t, 1.6, 1.9));
      P(me, { armR: arm, armL: 10, look: lerp(0.4, 1, caught) * (1 - away) + 0.8 * away, blink: blinkAt(t), lean: 4 * out * (1 - caught),
        mood: caught > 0 && t < 3.4 ? 'open' : t >= 3.4 ? 'smile' : 'grin', squash: 1 - 0.05 * hump(seg(t, 1.6, 2.1)) });
      const h = held(k, me, S, ph.g, 'R', 0, 30);
      ph.g.setAttribute('transform', `translate(${h.x.toFixed(2)} ${(h.y - 8).toFixed(2)}) scale(${S})`);
      ph.scr.setAttribute('fill', t < 3.0 ? '#BFE3FF' : '#9FB4CC');
      ph.g.setAttribute('opacity', h.y > 200 ? 0 : 1);
      // 先生：振り向き→掲示を指さして首を振る
      const turn = seg(t, 1.0, 1.3), point = easeInOut(seg(t, 1.5, 1.9)) * (1 - easeInOut(seg(t, 3.4, 3.8)));
      const shake = t > 1.9 && t < 2.9 ? Math.sin((t - 1.9) * 16) * 5 : 0;
      P(teacher, { facing: turn > 0.5 ? -1 : 1, look: 0.7, blink: blinkAt(t, 1), mood: point > 0.2 ? 'flat' : 'smile', armL: 10, armR: turn < 0.5 ? 130 + 12 * Math.sin(t * 9) : 10 });
      if (turn > 0.5) teacher.pose({ armR: lerp(10, reach(teacher, ST, 'R', 140, 40), point) });
      teacher.body.children[3].setAttribute('transform', `translate(${(5 + shake).toFixed(2)} 0)`);
      // 指さされた掲示が小さくはずむ
      tf(sign, 134, 74, 0, 0.8 * (1 + 0.08 * wobble(seg(t, 1.9, 2.8), 2, 4)));
    }
  };
}
