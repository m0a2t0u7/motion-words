// training：新人のまめが、先輩の説明を聞いてメモし、研修期間のバーがたまって一人前になる（例文 New staff get two weeks of training.）
import { seg, lerp, easeOut, easeInOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, hat } from './look-over.js';
import { reach } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '説明を聞く'], [1.6, '2週間の研修'], [3.5, '身についた']] };

export function create(k) {
  const { el, pal } = k, S = 0.9;
  const FY = roomBg(k, 'office', 240);
  const bx = 170, by = 36, bw = 150, bh = 92;
  el('rect', { x: bx, y: by, width: bw, height: bh, rx: 5, fill: '#fff', stroke: pal.woodDark, 'stroke-width': 4 });
  [0, 1, 2].forEach((i) => { el('circle', { cx: bx + 16, cy: by + 18 + i * 22, r: 6, fill: [pal.coral, pal.yellow, pal.mint][i] }); el('line', { x1: bx + 30, x2: bx + 104 - i * 14, y1: by + 18 + i * 22, y2: by + 18 + i * 22, stroke: pal.line, 'stroke-width': 4, 'stroke-linecap': 'round' }); });
  const checks = [0, 1, 2].map((i) => el('path', { d: `M ${bx + 118} ${by + 18 + i * 22} l 4 5 l 9 -10`, fill: 'none', stroke: pal.green, 'stroke-width': 3, 'stroke-linecap': 'round' }));
  const px = 176, py = 150;
  el('rect', { x: px, y: py, width: 140, height: 14, rx: 7, fill: '#EDE9E0', stroke: pal.line, 'stroke-width': 2 });
  const fill = el('rect', { x: px + 2, y: py + 2, width: 1, height: 10, rx: 5, fill: pal.mint });
  k.text(px + 70, py + 32, '2週間', { 'font-size': 12, fill: pal.sub, 'text-anchor': 'middle' });
  const tr = k.buddy({ x: 135, y: FY, scale: 0.9, facing: 1, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 345, y: FY, scale: S, facing: -1 });
  const star = k.text(0, 0, '★', { 'font-size': 26, fill: pal.yellow });
  return {
    update(t) {
      const ti = Math.min(2, Math.floor(seg(t, 0.4, 3.0) * 3));
      P(tr, { armL: 8, armR: 8, look: 0.4, mood: 'open', blink: blinkAt(t, 1) });
      tr.pose({ armR: reach(tr, 0.9, 'R', bx + 10 + ti * 0, by + 18 + ti * 22 + 4) * (t < 3.0 ? 1 : 0) + 8 * (t < 3.0 ? 0 : 1) });
      P(b, { facing: -1, armL: 8, armR: 8, look: 0.5, mood: t > 3.3 ? 'grin' : 'smile', blink: blinkAt(t), lean: 3 + 3 * Math.max(0, Math.sin(t * 6)) * (t < 3 ? 1 : 0) });
      b.pose({ armR: 55 + 8 * Math.sin(t * 7) * (t < 3 ? 1 : 0) });
      checks.forEach((c, i) => c.setAttribute('opacity', seg(t, 0.4, 3.0) * 3 > i + 0.9 ? 1 : 0));
      k.set(fill, { width: Math.max(1, 136 * easeInOut(seg(t, 0.4, 3.2))) });
      k.tf(star, 330, FY - 100 - 6 * hump(seg(t, 3.4, 4.2)));
      star.setAttribute('opacity', t > 3.4 ? 1 : 0);
    }
  };
}
