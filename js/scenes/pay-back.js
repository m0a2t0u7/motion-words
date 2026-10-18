// pay back：借りていたお金を、カレンダーが1週間進んだ日に相手へ手渡しで返す（例文 I'll pay you back next week.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt, walkTo, bill } from './run-after.js';
import { hp, grip, decor } from './hand-over.js';

export const meta = { duration: 4.4, beats: [[0, '借りたお金'], [1.4, '次の週'], [3.2, '返した']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 246, mood: 'indoor' });
  decor(k, FY);
  // 週めくりのカレンダー
  el('rect', { x: 180, y: 46, width: 60, height: 62, rx: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: 180, y: 46, width: 60, height: 15, rx: 5, fill: pal.blue });
  const pg = g({}); el('rect', { x: -28, y: 0, width: 56, height: 44, rx: 3, fill: '#fff' }, pg);
  k.text(0, 22, 'W1', { 'font-size': 18 }, pg);
  k.text(210, 85, 'W2', { 'font-size': 18, fill: pal.coralDark });
  pg.parentNode.appendChild(pg);
  const S = 1;
  const c = k.buddy({ x: 320, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const a = k.buddy({ x: 90, y: FY, scale: S });
  const money = bill(k);
  const ga = grip(k, pal.mint, pal.mintDark, S), gc = grip(k, pal.coral, pal.coralDark, S);
  const back = el('path', { d: 'M 0 0 Q 40 -24 80 0', stroke: pal.green, 'stroke-width': 3, fill: 'none', 'stroke-dasharray': '5 4', opacity: 0 });
  const head = el('path', { d: 'M 0 0 l -8 -6 l 1 9 Z', fill: pal.green, opacity: 0 });
  const xf = (t) => lerp(90, 170, easeInOut(seg(t, 1.4, 2.2)));
  return {
    update(t) {
      const flip = easeInOut(seg(t, 0.6, 1.2));
      tf(pg, 210, 62 + 0, 0, 1, 1 - flip); pg.setAttribute('opacity', flip < 1 ? 1 : 0);
      const wk = walkTo(xf, t, 90);
      const rA = t < 2.2 ? lerp(18, 30, seg(t, 0, 0.4)) : lerp(lerp(30, 88, easeInOut(seg(t, 2.2, 2.6))), 14, easeInOut(seg(t, 3.2, 3.7)));
      const rC = lerp(lerp(10, 88, easeInOut(seg(t, 2.4, 2.8))), 40, easeInOut(seg(t, 3.2, 3.7)));
      P(a, { ...wk, facing: 1, armR: rA, look: 0.5, lean: wk.lean + 3 * hump(seg(t, 2.2, 3.4)), mood: t > 3.1 ? 'grin' : 'smile', blink: blinkAt(t) });
      P(c, { x: 320, facing: -1, armR: rC, look: 0.5, mood: t > 3.0 ? 'grin' : 'smile', squash: 1 - 0.05 * hump(seg(t, 3.0, 3.4)), blink: blinkAt(t, 1) });
      const ha = hp(a, S), hc = hp(c, S);
      const m = easeInOut(seg(t, 2.75, 3.1));
      tf(money, lerp(ha.x + 4, hc.x - 4, m), lerp(ha.y - 8, hc.y - 8, m), lerp(-5, 5, m));
      ga(ha); gc(hc);
      const q = seg(t, 3.1, 3.5);
      back.setAttribute('transform', `translate(${ha.x} ${ha.y - 40})`); back.setAttribute('opacity', q);
      head.setAttribute('transform', `translate(${ha.x + 80} ${ha.y - 40})`); head.setAttribute('opacity', q);
    }
  };
}
