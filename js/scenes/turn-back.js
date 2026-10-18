// turn back：ふたりで道を進むと通行止め。立ち止まって向きを変え、来た道を引き返す（例文 The road was closed, so we turned back.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, walkTo, tree } from './run-after.js';

export const meta = { duration: 4.6, beats: [[0, '道を進む'], [1.9, '通行止め'], [3.6, '引き返す']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 226 });
  el('path', { d: `M 0 ${FY - 24} Q 120 ${FY - 60} 240 ${FY - 30} T 400 ${FY - 36} V ${FY} H 0 Z`, fill: '#E3F2E0' });
  tree(k, 40, FY, 0.8); tree(k, 380, FY, 0.75);
  el('rect', { x: 0, y: FY, width: 400, height: 74, fill: '#C9CED6' });
  for (let x = 10; x < 400; x += 50) el('rect', { x, y: FY + 34, width: 26, height: 5, rx: 2, fill: '#fff' });
  // 通行止めの柵
  const bar = g({});
  [292, 372].forEach((x) => { el('rect', { x: x - 3, y: FY - 40, width: 6, height: 60, fill: '#8F9BB0' }, bar); k.shadow(x, FY + 20, 12, 3, bar); });
  el('rect', { x: 278, y: FY - 34, width: 108, height: 18, rx: 3, fill: '#fff', stroke: pal.red, 'stroke-width': 2 }, bar);
  for (let i = 0; i < 6; i++) el('path', { d: `M ${284 + i * 18} ${FY - 33} l 10 0 l -8 16 l -10 0 Z`, fill: pal.red }, bar);
  el('circle', { cx: 332, cy: FY - 66, r: 20, fill: '#fff', stroke: pal.red, 'stroke-width': 6 }, bar);
  el('rect', { x: 318, y: FY - 69, width: 28, height: 6, fill: pal.red }, bar);
  el('rect', { x: 329, y: FY - 46, width: 6, height: 10, fill: '#8F9BB0' }, bar);
  const S = 0.78, Y = FY + 22;
  const c = k.buddy({ x: 0, y: Y - 6, scale: S * 0.94, color: pal.coral, dark: pal.coralDark });
  const a = k.buddy({ x: 0, y: Y, scale: S });
  const xa = (t) => t < 2.6 ? lerp(40, 240, easeInOut(seg(t, 0.1, 1.9))) : lerp(240, 60, easeInOut(seg(t, 2.9, 4.6)));
  const xc = (t) => t < 2.6 ? lerp(-10, 190, easeInOut(seg(t, 0.15, 1.95))) : lerp(190, 10, easeInOut(seg(t, 2.8, 4.5)));
  return {
    update(t) {
      const wa = walkTo(xa, t, 40, 1), wc = walkTo(xc, t, -10, 1);
      const stopped = t > 1.9 && t < 2.8;
      const point = easeInOut(seg(t, 2.0, 2.3)) * (1 - easeInOut(seg(t, 2.5, 2.8)));
      P(a, { ...wa, facing: t > 2.6 ? -1 : 1, armR: lerp(wa.armR, 90, point), look: 0.7, mood: stopped ? 'open' : t > 2.8 ? 'flat' : 'smile', blink: blinkAt(t), squash: 1 - 0.04 * hump(seg(t, 1.9, 2.2)) });
      P(c, { ...wc, facing: t > 2.55 ? -1 : 1, look: 0.7, mood: t > 2.0 ? 'flat' : 'smile', blink: blinkAt(t, 1) });
    }
  };
}
