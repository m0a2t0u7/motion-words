// happen：腕を吊った友だちが来て、まめが驚いて「腕どうしたの？」と指さす（例文 What happened to your arm?）
import { seg, lerp, easeInOut, easeOut, wobble, hump } from '../ease.js';
import { gait, reach } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { say } from './look-over.js';

// 包帯と三角巾（b の右腕＝手前の腕に付ける）
export function sling(k, b, col = '#FFFFFF') {
  const { el, pal } = k;
  const a = k.g({}, null); b.armR.a.insertBefore(a, b.armR.hand);
  el('rect', { x: -8, y: -2, width: 16, height: 28, rx: 6, fill: col }, a);
  [4, 10, 16, 22].forEach((y) => el('line', { x1: -7.5, y1: y, x2: 7.5, y2: y + 2.5, stroke: '#D9DFE7', 'stroke-width': 1.4 }, a));
  b.armR.hand.setAttribute('fill', col); b.armR.hand.setAttribute('stroke', '#D9DFE7');
  const s = el('path', { d: 'M -14 -72 L 30 -30', stroke: '#8DB4DE', 'stroke-width': 5, 'stroke-linecap': 'round' }, null);
  b.body.appendChild(s);
  return s;
}

export const meta = { duration: 4.2, beats: [[0, '友だちが来る'], [1.6, '腕に気づく'], [2.8, 'どうしたの？']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  // 学校の前の道
  el('rect', { x: 230, y: 70, width: 170, height: 166, fill: '#F3E6DC' });
  el('rect', { x: 222, y: 62, width: 186, height: 12, rx: 3, fill: '#E5CDB9' });
  [250, 310, 370].forEach((x) => el('rect', { x: x - 20, y: 92, width: 36, height: 30, rx: 4, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 3 }));
  el('rect', { x: 300, y: 160, width: 50, height: 76, rx: 4, fill: '#C9A577' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: '#E3E8EE' });
  el('circle', { cx: 60, cy: 50, r: 18, fill: '#FFE8A3' });
  const S = 0.95;
  const me = k.buddy({ x: 110, y: FY, scale: S });
  const fr = k.buddy({ x: 440, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  sling(k, fr);
  const q = say(k, 46, 40, -1);
  k.text(0, 2, '?', { 'font-size': 28, fill: pal.coralDark }, q.g);
  const ex = g({}); el('path', { d: 'M -3 -14 L 3 -14 L 1.5 2 L -1.5 2 Z', fill: pal.red }, ex); el('circle', { cx: 0, cy: 7, r: 2.6, fill: pal.red }, ex);
  const fx = (t) => lerp(440, 220, easeInOut(seg(t, 0.1, 1.6)));
  return {
    update(t) {
      const w = gait(fx, t, 440);
      const sad = t > 2.2;
      P(fr, { x: w.x, walk: w.walk, armL: w.armL, armR: 62, lean: w.lean - 4 * hump(seg(t, 2.2, 3.0)), look: sad ? 0.2 : 0.6, mood: sad ? 'sad' : 'smile', blink: blinkAt(t, 1) });
      // 気づく → のけぞる → 指さして聞く
      const notice = seg(t, 1.5, 1.8), jump = hump(seg(t, 1.6, 2.0));
      const pt = easeOut(seg(t, 2.1, 2.5));
      const arm = fr.state.x - 24, ay = FY - 52;
      P(me, { x: 110, lift: 8 * jump, lean: -10 * hump(seg(t, 1.6, 2.4)) + 6 * pt, squash: 1 + 0.05 * wobble(seg(t, 2.0, 2.5), 2, 5),
        armR: lerp(8, 0, 0), armL: 8 + 30 * jump, look: 0.8, mood: notice > 0 ? 'open' : 'smile', blink: blinkAt(t) });
      if (pt > 0) me.pose({ armR: lerp(8, reach(me, S, 'R', arm, ay), pt) });
      tf(ex, 140, 120 - 10 * easeOut(seg(t, 1.6, 1.9)), 0, Math.max(0.001, notice));
      ex.setAttribute('opacity', 1 - seg(t, 2.3, 2.6));
      q.show(seg(t, 2.5, 2.9), 150, 92);
    }
  };
}
