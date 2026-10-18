// show：客が切符を持ち上げて駅員に見せる（例文 Please show me your ticket.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';
import { hp } from './dig.js';

export const meta = { duration: 3.8, beats: [[0, '切符を持つ'], [1.5, '見せる'], [3.0, '確認OK']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 駅の改札まわり：案内板と改札機
  el('rect', { x: 120, y: 40, width: 150, height: 36, rx: 8, fill: pal.blue });
  el('path', { d: 'M 150 58 H 196 M 186 49 L 197 58 L 186 67', stroke: '#fff', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  el('rect', { x: 226, y: 52, width: 30, height: 12, rx: 4, fill: '#fff', opacity: 0.85 });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: '#E3E8EE' });
  const gate = g({});
  k.shadow(346, FY + 2, 34, 6, gate);
  el('rect', { x: 322, y: FY - 92, width: 48, height: 92, rx: 8, fill: '#C9D3DF' }, gate);
  el('rect', { x: 330, y: FY - 80, width: 32, height: 20, rx: 4, fill: '#2A3242' }, gate);
  const lamp = el('circle', { cx: 346, cy: FY - 70, r: 5, fill: '#59C27A', opacity: 0.25 }, gate);
  el('rect', { x: 330, y: FY - 50, width: 32, height: 6, rx: 3, fill: '#8F9BAB' }, gate);

  const me = k.buddy({ x: 150, y: FY, scale: 0.96 });
  const staff = k.buddy({ x: 268, y: FY, scale: 0.9, facing: -1, color: pal.coral, dark: pal.coralDark });

  const tk = g({});
  el('rect', { x: -17, y: -10, width: 34, height: 20, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, tk);
  el('rect', { x: -17, y: -10, width: 9, height: 20, rx: 3, fill: pal.yellow }, tk);
  el('line', { x1: -3, x2: 12, y1: -3, y2: -3, stroke: pal.blue, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, tk);
  el('line', { x1: -3, x2: 8, y1: 3, y2: 3, stroke: pal.sub, 'stroke-width': 2, 'stroke-linecap': 'round' }, tk);
  const hand = el('circle', { r: 6.5 * 0.96, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.4 });
  const bub = g({});
  el('rect', { x: -22, y: -16, width: 44, height: 30, rx: 13, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, bub);
  el('path', { d: 'M -4 13 L 2 23 L 8 13 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 2, 'stroke-linejoin': 'round' }, bub);
  el('rect', { x: -6, y: 11, width: 18, height: 4, fill: '#fff' }, bub);
  el('path', { d: 'M -10 0 L -3 7 L 11 -8', stroke: pal.green, 'stroke-width': 4.5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, bub);

  return {
    update(t) {
      const up = easeOut(seg(t, 0.6, 1.5)), lean = easeInOut(seg(t, 1.5, 2.2)), ok = seg(t, 2.6, 3.0);
      const sway = wobble(seg(t, 1.5, 2.6), 3, 4) * 3;
      me.pose({ armR: lerp(24, 104, up) + sway, armL: 8, lean: lerp(0, 3, up), look: 0.5, mood: 'smile', squash: 1 });
      const h = hp(me, 0.96, 'R', 26);
      tf(tk, h.x + 12, h.y - 12 - 3 * up, lerp(-8, 6, up) + sway * 0.8, 0.9);
      k.set(hand, { cx: h.x, cy: h.y });
      staff.pose({ lean: lerp(0, 9, lean) - 3 * easeInOut(seg(t, 2.4, 3.0)), look: lerp(0, 0.8, lean), armR: lerp(8, 62, easeOut(ok)), armL: 8, mood: ok > 0.3 ? 'grin' : 'smile', blink: hump(seg(t, 3.0, 3.3)), squash: 1 - 0.03 * hump(lean) });
      tf(bub, 258, FY - 118 - 6 * (1 - easeOut(ok)), 0, backOut(ok) * 1.0 + 0.001);
      bub.setAttribute('opacity', ok);
      k.set(lamp, { opacity: ok > 0.2 ? 1 : 0.25 });
    }
  };
}
