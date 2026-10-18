// stick to：ゴールまでの計画の道。相手がわき道のソフトクリームにつられるが、まめが計画書を見せ、ふたりは計画どおり進む（例文 Let's stick to the plan.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, walkTo, tree } from './run-after.js';
import { hp, reach } from './weigh.js';

export const meta = { duration: 4.8, beats: [[0, '計画の道'], [1.4, 'わき道に誘惑'], [3.4, '計画どおり進む']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  el('path', { d: `M 0 ${FY - 20} Q 120 ${FY - 60} 240 ${FY - 26} T 400 ${FY - 34} V ${FY} H 0 Z`, fill: '#E3F2E0' });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#DCEFD9' });
  // 計画の道（まっすぐ）とわき道
  el('path', { d: `M 0 ${FY + 18} L 400 ${FY + 18}`, stroke: '#E6DCCB', 'stroke-width': 26 });
  el('path', { d: `M 210 ${FY + 18} Q 230 ${FY - 2} 250 ${FY - 10}`, stroke: '#EFE7DA', 'stroke-width': 16, 'stroke-linecap': 'round' });
  for (let x = 20; x < 400; x += 34) el('circle', { cx: x, cy: FY + 18, r: 2.5, fill: pal.blue, opacity: 0.6 });
  // わき道の看板（ソフトクリーム）
  el('rect', { x: 262, y: FY - 70, width: 5, height: 60, fill: pal.woodDark });
  el('rect', { x: 244, y: FY - 104, width: 42, height: 38, rx: 6, fill: '#fff', stroke: pal.coral, 'stroke-width': 3 });
  el('path', { d: `M 258 ${FY - 86} L 265 ${FY - 70} L 272 ${FY - 86} Z`, fill: pal.wood });
  el('path', { d: `M 256 ${FY - 86} Q 265 ${FY - 104} 274 ${FY - 86} Z`, fill: '#FFE8EF' });
  tree(k, 330, FY - 4, 0.7);
  // ゴールの旗
  el('line', { x1: 384, y1: FY + 18, x2: 384, y2: FY - 50, stroke: pal.ink, 'stroke-width': 3 });
  el('path', { d: `M 384 ${FY - 50} L 360 ${FY - 42} L 384 ${FY - 34} Z`, fill: pal.red });
  const S = 0.74;
  const c = k.buddy({ x: 0, y: FY + 18, scale: S * 0.95, color: pal.coral, dark: pal.coralDark });
  const a = k.buddy({ x: 0, y: FY + 24, scale: S });
  const map = g({}); el('rect', { x: -14, y: -11, width: 28, height: 22, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, map);
  el('path', { d: 'M -9 6 L -2 -2 L 4 3 L 9 -6', stroke: pal.blue, 'stroke-width': 2, fill: 'none', 'stroke-dasharray': '3 2' }, map); el('circle', { cx: 9, cy: -6, r: 2.5, fill: pal.red }, map);
  const xa = (t) => t < 2.0 ? lerp(30, 176, easeInOut(seg(t, 0.1, 1.6))) : lerp(176, 330, easeInOut(seg(t, 3.2, 4.7)));
  const xc = (t) => t < 2.6 ? lerp(-20, 226, easeInOut(seg(t, 0.15, 1.9))) : lerp(226, 290, easeInOut(seg(t, 3.25, 4.7)));
  return {
    update(t) {
      // 相手：わき道へそれかける（奥へ）→呼ばれて戻る
      const stray = easeInOut(seg(t, 1.4, 2.0)) * (1 - easeInOut(seg(t, 2.8, 3.2)));
      const wc = walkTo(xc, t, -20, 1);
      P(c, { ...wc, x: wc.x + 14 * stray, y: FY + 18 - 22 * stray, facing: t > 2.7 && t < 3.25 ? -1 : 1, look: t < 2.0 ? 0.6 : 0.4, lean: wc.lean + (stray > 0 && t < 2.5 ? 4 : 0), armR: lerp(wc.armR, 120, hump(seg(t, 1.6, 2.4))), mood: stray > 0.3 && t < 2.6 ? 'grin' : 'smile', blink: blinkAt(t, 1) });
      // まめ：計画書を掲げて見せる
      const wa = walkTo(xa, t, 30, 1);
      const show = easeInOut(seg(t, 2.1, 2.5)) * (1 - easeInOut(seg(t, 3.1, 3.4)));
      const tap = Math.sin(t * 10) * 8 * seg(t, 2.5, 2.6) * (1 - seg(t, 3.0, 3.1));
      P(a, { ...wa, facing: 1, armR: lerp(lerp(wa.armR, 30, seg(t, 0, 0.1)), 120 + tap, show), armL: lerp(wa.armL, 60, show), look: 0.8, mood: t > 3.3 ? 'grin' : 'smile', blink: blinkAt(t) });
      const h = hp(a, S, 'R');
      tf(map, h.x + 2, h.y - 8, 0, lerp(0.8, 1.2, show));
    }
  };
}
