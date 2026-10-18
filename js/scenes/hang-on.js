// hang on：相手に「？」と聞かれ、まめが手のひらで「ちょっと待って」→手帳の予定表を開いて確かめ、答える（例文 Hang on a second. I'll check the schedule.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { roomBg, say, faceAt, hp } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, '聞かれる'], [1.0, 'ちょっと待って'], [2.6, '予定を確かめる']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  const b = k.buddy({ x: 140, y: FY, scale: S });
  const o = k.buddy({ x: 300, y: FY, scale: S, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const q = say(k, 34, 32, 1); k.text(0, 1, '?', { 'font-size': 22, fill: pal.blueDark }, q.g);
  // 手帳（見開きの予定表）
  const bk = g({});
  el('rect', { x: -28, y: -18, width: 56, height: 36, rx: 3, fill: pal.violet }, bk);
  const pgs = g({}, bk);
  el('rect', { x: -26, y: -16, width: 52, height: 32, fill: '#fff' }, pgs);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) el('rect', { x: -22 + c * 12, y: -12 + r * 9, width: 9, height: 6, fill: '#EEF1F5' }, pgs);
  const mark = el('rect', { x: 2, y: -3, width: 9, height: 6, fill: pal.yellow }, pgs);
  const ok = say(k, 40, 32, -1); el('rect', { x: -8, y: -6, width: 16, height: 12, rx: 2, fill: pal.yellow }, ok.g); el('path', { d: 'M -4 0 l 3 3 l 6 -6', fill: 'none', stroke: pal.ink, 'stroke-width': 2, 'stroke-linecap': 'round' }, ok.g);
  return {
    update(t) {
      q.show(seg(t, 0.2, 0.4) * (1 - seg(t, 2.0, 2.2)), 270, 134);
      o.pose({ armR: 8 + 40 * hump(seg(t, 0.2, 0.9)), mood: t > 3.6 ? 'grin' : 'smile', look: 0.5 });
      const palm = easeOut(seg(t, 0.9, 1.15)) * (1 - easeInOut(seg(t, 1.9, 2.2)));
      const open = easeInOut(seg(t, 2.0, 2.5)), look = seg(t, 2.4, 3.4);
      b.pose({ armR: 8 + 92 * palm + 62 * open, armL: 8 + 40 * open, lean: 4 * palm + 6 * open, mood: t > 3.4 ? 'grin' : palm > 0.5 ? 'flat' : 'smile', look: 0.5, lift: 2 * hump(seg(t, 0.9, 1.1)) });
      faceAt(b, open > 0.5 ? 2 : 4, 7 * open * (1 - seg(t, 3.4, 3.6)));
      tf(bk, b.state.x + 52, FY - 58, 0, open < 0.01 ? 0.001 : lerp(0.4, 1, open), 1);
      bk.setAttribute('opacity', open > 0.01 ? 1 : 0);
      mark.setAttribute('opacity', 0.3 + 0.7 * Math.abs(Math.sin(look * 6)) * (look > 0 && look < 1) + (look >= 1 ? 0.7 : 0));
      ok.show(seg(t, 3.5, 3.75), 190, 118);
    }
  };
}
