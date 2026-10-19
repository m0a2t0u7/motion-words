// satisfy：100点を期待していたまめが、結果の62点を見て納得できず首を振る（例文 The result did not satisfy him.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { held } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, cloud } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, '100点のつもり'], [1.6, '結果は62点'], [3.0, '満足できない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'office', 240);
  el('rect', { x: 170, y: 40, width: 110, height: 70, rx: 4, fill: '#3E6B5A', stroke: pal.woodDark, 'stroke-width': 5 });
  const S = 1.05;
  const me = k.buddy({ x: 170, y: FY, scale: S });
  // 答案用紙（手に持つ。原点＝持つ所）
  const paper = g({});
  const pp = g({}, paper);
  el('rect', { x: -26, y: -46, width: 52, height: 64, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 1.6 }, pp);
  [-30, -22, -14, -6, 2, 10].forEach((y) => el('line', { x1: -18, y1: y, x2: 18, y2: y, stroke: pal.line, 'stroke-width': 2 }, pp));
  const back = el('rect', { x: -26, y: -46, width: 52, height: 64, rx: 2, fill: '#F4F6F9', stroke: pal.line, 'stroke-width': 1.6 }, pp);
  const score = k.text(4, -16, '62', { 'font-size': 26, fill: pal.red }, pp);
  const ring = el('ellipse', { cx: 4, cy: -16, rx: 19, ry: 14, fill: 'none', stroke: pal.red, 'stroke-width': 2.5 }, pp);
  // 期待の雲
  const th = cloud(k, 84, 56, -1);
  k.text(0, -2, '100', { 'font-size': 22, fill: pal.red }, th.g);
  el('path', { d: 'M 30 -26 L 33 -20 L 39 -19 L 34 -15 L 36 -9 L 30 -12 L 24 -9 L 26 -15 L 21 -19 L 27 -20 Z', fill: pal.yellow }, th.g);
  const sigh = el('path', { d: 'M 0 0 q 8 -4 14 2 q 6 6 14 0', stroke: '#C9D3E0', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' });
  return {
    update(t) {
      const flip = seg(t, 1.3, 1.7);
      const look = easeOut(seg(t, 1.7, 2.1));
      th.show(seg(t, 0.2, 0.6) * (1 - seg(t, 1.9, 2.2)), 96, 70);
      const shake = seg(t, 2.6, 3.4);
      const droop = easeInOut(seg(t, 3.2, 3.8));
      P(me, { x: 170, armR: lerp(lerp(40, 92, easeOut(seg(t, 0.8, 1.3))), 40, droop), armL: 8, lean: 4 * look - 8 * droop * 0,
        look: 0.5 + (shake > 0 && shake < 1 ? 0.6 * Math.sin(shake * Math.PI * 6) : 0), mood: t < 1.8 ? 'grin' : t < 2.4 ? 'open' : 'flat',
        blink: blinkAt(t), squash: 1 - 0.05 * droop });
      const h = held(k, me, S, paper, 'R', 0);
      tf(paper, h.x + 10, h.y + 2, 0, 1);
      // めくって裏 → 表
      pp.setAttribute('transform', `scale(${Math.abs(Math.cos(flip * Math.PI)).toFixed(3)} 1)`);
      const front = flip > 0.5;
      back.setAttribute('opacity', front ? 0 : 1);
      score.setAttribute('opacity', front ? 1 : 0); ring.setAttribute('opacity', front ? 1 : 0);
      tf(sigh, 150, FY - 64, 0, 1);
      sigh.setAttribute('opacity', seg(t, 3.6, 3.8) * (1 - seg(t, 4.2, 4.4)));
      tf(sigh, 130 - 16 * seg(t, 3.6, 4.4), FY - 60);
    }
  };
}
