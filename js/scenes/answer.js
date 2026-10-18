// answer：先生が質問し、生徒が少し考えてから声に出して答える（例文 Please answer the question.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { bubble } from './weigh.js';

export const meta = { duration: 4.2, beats: [[0, '質問される'], [1.5, '考える'], [2.8, '答えた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 150, y: 46, width: 100, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 200, y1: 46, x2: 200, y2: 110, stroke: '#fff', 'stroke-width': 4 });
  el('ellipse', { cx: 200, cy: 262, rx: 150, ry: 14, fill: '#F1D9CF' });
  const T = k.buddy({ x: 305, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark });
  const S = k.buddy({ x: 95, y: FY, facing: 1 });
  const P = (b, o) => b.pose({ armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'smile', blink: 0, lift: 0, ...o });
  const qB = bubble(k, 50, 36); k.text(0, 0, '?', { 'font-size': 26, fill: pal.blue }, qB);
  const aB = bubble(k, 56, 36); k.text(-9, 0, 'A', { 'font-size': 24, fill: pal.coralDark }, aB);
  const ck = el('path', { d: 'M 6 1 L 11 6 L 20 -5', stroke: pal.green, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, aB);
  const dots = [0, 1, 2].map((i) => el('circle', { r: 3.2, fill: pal.sub }));
  return {
    update(t) {
      const ask = seg(t, 0.4, 1.4), think = seg(t, 1.5, 2.7), ans = seg(t, 2.8, 3.4);
      const talkQ = t > 0.5 && t < 1.5 ? Math.sin(t * 20) > 0 : false, talkA = t > 2.9 && t < 3.9 ? Math.sin(t * 20) > 0 : false;
      P(T, { armR: lerp(8, 75, easeOut(seg(t, 0.4, 0.9))) - 70 * easeInOut(seg(t, 2.4, 3.0)) * 0 , look: 0.6, mood: talkQ ? 'open' : 'smile', squash: 1 - 0.06 * hump(seg(t, 3.0, 3.5)) });
      const scratch = think > 0 && think < 1 ? 1 : 0;
      P(S, { look: lerp(0.6, -0.2, think), armR: lerp(8, 150, easeOut(seg(t, 1.5, 1.9))) * (1 - seg(t, 2.6, 3.0)) + 8 * seg(t, 2.6, 3.0) + scratch * 8 * Math.sin(t * 14), mood: ans > 0 ? (talkA ? 'open' : 'grin') : think > 0 ? 'flat' : 'smile', lean: 4 * ans, squash: 1 + 0.015 * Math.sin(t * 3) });
      tf(qB, 262, 112, 0, Math.max(0.001, backOut(seg(t, 0.8, 1.2)) * (1 - 0.0 * seg(t, 3, 3.6))));
      qB.setAttribute('opacity', 1 - 0.55 * seg(t, 3.0, 3.5));
      tf(aB, 98, 108, 0, Math.max(0.001, backOut(ans)));
      k.set(ck, { opacity: seg(t, 3.3, 3.6) });
      dots.forEach((d, i) => {
        const q = think > 0 && ans === 0 ? 1 : 0;
        k.set(d, { cx: 86 + i * 14, cy: 108 - 6 * Math.max(0, Math.sin(t * 7 - i * 1.2)), opacity: q });
      });
    }
  };
}
