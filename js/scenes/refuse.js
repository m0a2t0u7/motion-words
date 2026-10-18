// refuse：質問されても、彼は手のひらを向け首を振って答えない（答えの吹き出しに×）（例文 He refused to answer the question.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { bubble } from './weigh.js';

export const meta = { duration: 4.2, beats: [[0, '質問される'], [1.6, '手を向ける'], [3.0, '答えない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 150, y: 46, width: 100, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 200, y1: 46, x2: 200, y2: 110, stroke: '#fff', 'stroke-width': 4 });
  el('ellipse', { cx: 200, cy: 262, rx: 150, ry: 14, fill: '#F1D9CF' });
  const C = k.buddy({ x: 110, y: FY, facing: 1, color: pal.coral, dark: pal.coralDark });
  const H = k.buddy({ x: 290, y: FY, facing: -1 });
  const P = (b, o) => b.pose({ armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'smile', blink: 0, lift: 0, ...o });
  const qB = bubble(k, 50, 36); k.text(0, 0, '?', { 'font-size': 26, fill: pal.blue }, qB);
  const aB = bubble(k, 56, 36); k.text(0, 0, 'A', { 'font-size': 24, fill: pal.sub }, aB);
  const cross = el('path', { d: 'M -15 -13 L 15 13 M 15 -13 L -15 13', stroke: pal.red, 'stroke-width': 5, 'stroke-linecap': 'round', fill: 'none' }, aB);
  return {
    update(t) {
      const talk = t > 0.5 && t < 1.5 && Math.sin(t * 20) > 0;
      const stop = easeOut(seg(t, 1.6, 2.2)), sh = seg(t, 1.8, 3.6);
      const shake = sh > 0 && sh < 1 ? Math.sin(sh * Math.PI * 7) * (1 - 0.5 * sh) : 0;
      P(C, { armR: 70 * hump(seg(t, 0.3, 1.6)) + 8, look: 0.5, mood: talk ? 'open' : t > 3.0 ? 'sad' : 'smile', lean: 4 * hump(seg(t, 0.4, 1.4)) });
      P(H, { armR: lerp(8, 105, stop), look: t > 1.6 ? 0.9 * shake - 0.3 : 0.5, lean: -5 * stop, mood: t > 1.6 ? 'flat' : 'smile', x: 290 + 10 * stop });
      tf(qB, 128, 108, 0, Math.max(0.001, backOut(seg(t, 0.8, 1.2))));
      tf(aB, 276, 108, 0, Math.max(0.001, backOut(seg(t, 2.4, 2.8))));
      k.set(cross, { opacity: seg(t, 2.8, 3.1), 'stroke-dasharray': 44, 'stroke-dashoffset': 44 * (1 - seg(t, 2.8, 3.2)) });
    }
  };
}
