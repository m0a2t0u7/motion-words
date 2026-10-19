// package：家の人が「あなた宛てに小包が来たよ」と箱を手渡す。まめは受け取って耳もとで振ってみる（例文 A package came for you today.）
import { seg, lerp, easeInOut, hump, wobble } from '../ease.js';
import { hp, reach, homeBg } from './bag.js';
import { give } from './charger.js';

// 小包（原点＝上面の中央、下へ伸びる）
export function parcel(k, parent, w = 40, h = 30) {
  const g = k.g({}, parent), { el, pal } = k;
  el('rect', { x: -w / 2, y: 0, width: w, height: h, rx: 3, fill: '#E3B77E' }, g);
  el('rect', { x: -w / 2, y: h / 2 - 3, width: w, height: 6, fill: '#F4E1C1' }, g);
  el('rect', { x: 2, y: 4, width: 15, height: 10, rx: 1.5, fill: '#fff' }, g);
  el('line', { x1: 4, y1: 7.5, x2: 14, y2: 7.5, stroke: pal.sub, 'stroke-width': 1.2 }, g);
  el('line', { x1: 4, y1: 10.5, x2: 11, y2: 10.5, stroke: pal.sub, 'stroke-width': 1.2 }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '小包が来たよ'], [1.0, '箱を渡す'], [2.6, '何だろう？']] };

export function create(k) {
  const { tf, pal } = k, S = 1.1, FY = 236;
  homeBg(k, { FY, winX: 40, winW: 90 });
  const pc = parcel(k);
  const up = give(k, {
    S, FY, bx: 140, cx: 270, item: pc, g0: 0.9, g1: 1.7, cRest: 60, bRest: 60, bubX: 270, bubbleW: 84,
    ask: (g) => { const p = parcel(k, g, 26, 20); k.tf(p, -18, -10); k.text(16, 0, 'You', { 'font-size': 12 }, g); },
    carry: (t, c, h) => {
      let r = 0;
      if (t > 2.4) {
        const lift = easeInOut(seg(t, 2.3, 2.8));
        c.b.pose({ armR: reach(c.b, S, 'R', 140 + 34, lerp(FY - 70, FY - 96, lift)), look: 0.3 });
        r = Math.sin(t * 30) * 6 * hump(seg(t, 2.9, 3.9));
      }
      const hh = t < 1.7 ? h : hp(c.b, S, 'R');
      tf(pc, hh.x, hh.y - 4 + wobble(seg(t, 1.7, 2.2), 2, 5) * 2, r, S);
      return true;
    }
  });
  pc.parentNode.appendChild(pc);
  return { update: up };
}
