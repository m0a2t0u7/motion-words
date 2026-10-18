// turn to：悩んでいるまめが、姉の方へ体を向けて相談し、助言をもらって明るくなる（例文 She always turns to her sister for advice.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt, walkTo, sofa, win } from './run-after.js';
import { bubble } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '悩んでいる'], [1.3, '姉の方を向く'], [3.2, '助言をもらう']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const w = win(k, 160, 40, 80, 64); w.frame();
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  el('rect', { x: 300, y: 80, width: 60, height: 6, rx: 3, fill: pal.woodDark });
  [[306, pal.yellow], [324, pal.blue], [342, pal.coral]].forEach(([x, c]) => el('rect', { x, y: 58, width: 12, height: 22, rx: 2, fill: c }));
  const S = 0.85;
  const sis = k.buddy({ x: 300, y: FY, scale: S * 1.06, facing: -1, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 120, y: FY, scale: S, facing: -1 });
  // 悩みのもやもや
  const fog = g({}); el('path', { d: 'M -14 0 q 4 -10 10 -2 q 4 -10 10 0 q 8 -4 8 6 q -4 8 -12 4 q -6 6 -12 0 q -8 2 -4 -8 Z', fill: '#B8C1CE' }, fog);
  el('path', { d: 'M -6 2 q 4 -6 8 0 q 4 6 8 0', stroke: pal.ink, 'stroke-width': 1.8, fill: 'none' }, fog);
  // 助言の吹き出し（電球）
  const tip = bubble(k, 46, 40);
  el('circle', { cx: 0, cy: -3, r: 9, fill: pal.yellow }, tip); el('rect', { x: -4, y: 6, width: 8, height: 6, rx: 1, fill: pal.sub }, tip);
  const xf = (t) => lerp(120, 196, easeInOut(seg(t, 1.5, 2.4)));
  return {
    update(t) {
      const turn = t > 1.25;
      const wk = walkTo(xf, t, 120, -1);
      const glum = 1 - easeInOut(seg(t, 3.2, 3.6));
      P(b, { ...wk, facing: turn ? 1 : -1, armL: t < 1.25 ? 150 : wk.armL, armR: t < 1.25 ? 150 : t > 2.4 ? lerp(8, 60, hump(seg(t, 2.4, 3.0))) : wk.armR, lean: t < 1.25 ? 10 : wk.lean + 4 * glum,
        look: turn ? 0.6 : 0.2, mood: t > 3.3 ? 'grin' : 'sad', squash: 1 - 0.05 * glum, blink: blinkAt(t) });
      const fq = 1 - seg(t, 3.0, 3.4);
      tf(fog, b.state.x, 112 + 3 * Math.sin(t * 3), 0, 1.2 * fq); fog.setAttribute('opacity', fq > 0.02 ? 1 : 0);
      const talk = t > 2.6 && t < 3.6;
      P(sis, { x: 300, facing: -1, look: 0.5, armR: talk ? 60 + 16 * Math.sin(t * 6) : lerp(8, 20, seg(t, 3.6, 3.9)), lean: talk ? 4 : 0, mood: talk && Math.sin(t * 14) > 0 ? 'open' : 'smile', blink: blinkAt(t, 1) });
      const tq = easeOut(seg(t, 2.8, 3.2)) * (1 - seg(t, 4.1, 4.4) * 0);
      tf(tip, 254, 104 - 6 * tq, 0, backOut(seg(t, 2.8, 3.2))); tip.setAttribute('opacity', tq > 0 ? 1 : 0);
    }
  };
}
