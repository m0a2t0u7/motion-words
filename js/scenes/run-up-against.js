// run up against：ふたりで道を進んでいくと、大きな岩（問題）に突き当たって止まる（例文 We ran up against a big problem last week.）
import { seg, lerp, easeInOut, easeOut, wobble, hump } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { streetBg } from './weigh.js';

export const meta = { duration: 4.0, beats: [[0, '進んでいく'], [1.9, 'ぶつかる'], [3.2, '行き詰まる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  el('path', { d: `M 0 ${FY - 20} Q 120 ${FY - 60} 240 ${FY - 26} T 400 ${FY - 34} V ${FY} H 0 Z`, fill: '#E3F2E0' });
  el('rect', { x: 0, y: FY, width: 400, height: 16, fill: '#E6DCCB' });
  // 大きな岩（問題）
  const rock = g({});
  k.shadow(330, FY + 4, 74, 7, rock);
  el('path', { d: `M 262 ${FY + 4} Q 252 ${FY - 70} 290 ${FY - 120} Q 330 ${FY - 156} 372 ${FY - 118} Q 410 ${FY - 70} 400 ${FY + 4} Z`, fill: '#9AA3B2' }, rock);
  el('path', { d: `M 290 ${FY - 104} Q 316 ${FY - 132} 344 ${FY - 120}`, stroke: '#C2C9D3', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }, rock);
  el('path', { d: `M 300 ${FY - 40} l 18 -22 l 10 14 l 16 -20`, stroke: '#7B8494', 'stroke-width': 3, fill: 'none' }, rock);
  const ex = g({});
  el('circle', { r: 15, fill: pal.red }, ex); k.text(0, 1, '!', { 'font-size': 22, fill: '#fff' }, ex);
  const S = 0.78;
  const c = k.buddy({ x: 20, y: FY + 4, scale: S * 0.94, color: pal.coral, dark: pal.coralDark });
  const a = k.buddy({ x: 70, y: FY + 8, scale: S });
  const xa = (t) => t < 1.9 ? lerp(40, 222, easeInOut(seg(t, 0.1, 1.9)) * 0.9 + seg(t, 0.1, 1.9) * 0.1) : 222 - 12 * easeOut(seg(t, 1.9, 2.3));
  const xc = (t) => xa(t) - 54;
  return {
    update(t) {
      const hit = seg(t, 1.88, 2.5);
      const sq = 1 - 0.14 * Math.max(0, wobble(hit, 1.5, 4));
      const wa = walkTo(xa, t, 40), wc = walkTo(xc, t, -14);
      const up = easeInOut(seg(t, 2.4, 2.9));
      P(a, { ...wa, facing: 1, squash: sq, lean: t > 1.9 ? -8 * hump(hit) - 4 * up : wa.lean, armL: t > 2.4 ? lerp(8, 40, up) : wa.armL, armR: t > 2.4 ? lerp(8, 60, up) : wa.armR, mood: t > 1.9 ? (t > 2.6 ? 'sad' : 'open') : 'smile', look: 0.9, blink: blinkAt(t) });
      P(c, { ...wc, facing: 1, lean: t > 2.0 ? -3 * up : wc.lean, mood: t > 2.1 ? 'sad' : 'smile', look: 0.9, blink: blinkAt(t, 1) });
      const q = seg(t, 2.0, 2.4);
      tf(ex, 230, FY - 120 - 8 * easeOut(q), 0, 0.3 + 0.7 * easeOut(q)); ex.setAttribute('opacity', q > 0 ? 1 : 0);
    }
  };
}
