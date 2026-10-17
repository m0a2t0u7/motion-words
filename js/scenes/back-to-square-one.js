// back to square one：ゴール近くまで進んだのに失敗して、最初のマスまで戻される（The plan failed, so we're back to square one.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '最初のマス'], [1.7, '5マス目まで'], [3.4, '振り出しへ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const CX = (i) => 62 + 55 * i;
  for (let i = 0; i < 6; i++) {
    el('rect', { x: CX(i) - 25, y: FY - 2, width: 50, height: 34, rx: 6, fill: i === 0 ? pal.yellow : i % 2 ? '#CFE9F7' : '#E3F4EC', stroke: i === 0 ? pal.yellowDark : '#fff', 'stroke-width': 3 });
    k.text(CX(i), FY + 17, String(i + 1), { 'font-size': 17, fill: i === 0 ? pal.ink : pal.sub });
  }
  const flag = g({});
  el('line', { x1: 0, y1: 0, x2: 0, y2: -30, stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' }, flag);
  el('path', { d: 'M 0 -30 L 22 -24 L 0 -16 Z', fill: pal.red }, flag);
  tf(flag, CX(0) - 32, FY - 2);
  const goal = g({});
  el('line', { x1: 0, y1: 0, x2: 0, y2: -30, stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' }, goal);
  el('path', { d: 'M 0 -30 L 22 -24 L 0 -16 Z', fill: pal.green }, goal);
  tf(goal, CX(5) + 14, FY - 2);
  const b = k.buddy({ x: CX(0), y: FY, scale: 0.62 });
  const ng = g({});
  el('line', { x1: -22, y1: -22, x2: 22, y2: 22, stroke: pal.red, 'stroke-width': 9, 'stroke-linecap': 'round' }, ng);
  el('line', { x1: 22, y1: -22, x2: -22, y2: 22, stroke: pal.red, 'stroke-width': 9, 'stroke-linecap': 'round' }, ng);
  const back = el('path', { fill: 'none', stroke: pal.red, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-dasharray': '2 10' });
  const head = el('path', { d: 'M 14 -10 L 0 0 L 14 10', fill: 'none', stroke: pal.red, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  return {
    update(t) {
      // 1→5マス：ぴょんぴょん
      let x = CX(0), lift = 0, mood = 'smile';
      const hops = 4;
      if (t >= 0.4 && t < 1.8) {
        const u = (t - 0.4) / 0.35, n = Math.min(hops - 1, Math.floor(u)), f = Math.min(1, u - n);
        x = lerp(CX(n), CX(n + 1), easeInOut(f));
        lift = 26 * hump(f);
        if (u >= hops) { x = CX(4); lift = 0; }
      } else if (t >= 1.8) x = CX(4);
      const fail = seg(t, 2.2, 2.5);
      let back_p = easeInOut(seg(t, 2.9, 3.6));
      x = t >= 2.9 ? lerp(CX(4), CX(0), back_p) : x;
      if (t >= 1.8) mood = t < 2.2 ? 'grin' : t < 2.9 ? 'open' : 'sad';
      const sad = t >= 3.6 ? easeOut(seg(t, 3.6, 4.0)) : 0;
      b.pose({
        x, lift: t >= 2.9 ? 0 : lift, walk: 0, mood,
        armL: lift > 2 ? 100 : 8, armR: lift > 2 ? 100 : t > 3.6 ? lerp(8, 8, sad) : 8,
        lean: t >= 2.9 && t < 3.6 ? -16 : 0, squash: 1 - 0.08 * hump(seg(t, 2.2, 2.7)) - 0.04 * sad, look: 0.5
      });
      const np = backOut(seg(t, 2.2, 2.6), 2.2);
      tf(ng, CX(4), FY - 104, 0, np, np);
      ng.setAttribute('opacity', t < 2.2 ? 0 : t < 3.0 ? 1 : 1 - seg(t, 3.0, 3.4));
      const ar = seg(t, 2.8, 3.4);
      k.set(back, { d: 'M ' + (CX(4) - 6) + ' ' + (FY - 66) + ' Q ' + (CX(2)) + ' ' + (FY - 130) + ' ' + (CX(0) + 16) + ' ' + (FY - 66), opacity: ar > 0 ? 1 - seg(t, 3.7, 4.2) : 0, 'stroke-dasharray': '2 10' });
      tf(head, CX(0) + 12, FY - 66, 28, 1, 1);
      head.setAttribute('opacity', ar > 0 ? 1 - seg(t, 3.7, 4.2) : 0);
    }
  };
}
