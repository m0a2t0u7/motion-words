// absent：先生のまめが教室の席を数えると、3つの席に誰もいない。空席を1・2・3と指さす（例文 Three students were absent from class today.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, hp, aim, person, sym, paper, hold, walkTo, path } from './confused.js';

export const meta = { duration: 4.4, beats: [[0, '出席をとる'], [1.2, '空いた席'], [3.2, '3人お休み']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 40, y: 26, width: 230, height: 76, rx: 4, fill: '#3E6B5A', stroke: pal.woodDark, 'stroke-width': 6 });
  el('rect', { x: 0, y: FY - 12, width: 400, height: 12, fill: '#ECE6DC' });
  // 6つの席（いす＋机）。0,2,5 番がいない
  const X = [40, 92, 144, 196, 248, 300], gone = [1, 3, 4];
  const kids = [];
  X.forEach((x, i) => {
    el('rect', { x: x - 14, y: FY - 70, width: 28, height: 34, rx: 5, fill: '#9FB4CC' });
    if (!gone.includes(i)) kids.push(person(k, ['coral', 'blue', 'yellow', 'violet', 'blue', 'coral'][i], { x, y: FY - 26, scale: 0.55 }));
  });
  X.forEach((x) => {
    k.shadow(x, FY + 1, 26, 3);
    el('rect', { x: x - 24, y: FY - 44, width: 48, height: 6, rx: 2, fill: pal.wood });
    el('rect', { x: x - 20, y: FY - 38, width: 40, height: 22, fill: '#EAD3B0' });
    el('rect', { x: x - 20, y: FY - 16, width: 4, height: 16, fill: pal.woodDark }); el('rect', { x: x + 16, y: FY - 16, width: 4, height: 16, fill: pal.woodDark });
  });
  const b = k.buddy({ x: 362, y: FY, scale: S, facing: -1 });
  const book = g({}); paper(k, book, 26, 32, 4, '#FFF7E0');
  const nums = gone.map((_, i) => sym(k, String(i + 1), pal.red, 26));
  const rings = gone.map((i) => el('circle', { cx: X[i], cy: FY - 56, r: 20, fill: 'none', stroke: pal.red, 'stroke-width': 3, 'stroke-dasharray': '5 4', opacity: 0 }));
  return {
    update(t) {
      const ti = [1.2, 1.9, 2.6];
      let target = null;
      ti.forEach((a, j) => { if (t > a && t < a + 0.7) target = gone[j]; });
      const end = seg(t, 3.3, 3.7);
      P(b, { x: 362, facing: -1, armL: 40, armR: 20, look: 0.6, lean: 4, mood: t > 3.3 ? 'sad' : 'flat', blink: blinkAt(t) });
      if (target !== null) aim(b, S, 'R', X[target], FY - 60);
      else if (end > 0) b.pose({ armR: lerp(20, 150, easeOut(end)) });
      hold(k, b, S, book, 'L', 0, 28, 0.9);
      gone.forEach((i, j) => {
        const q = seg(t, ti[j] + 0.15, ti[j] + 0.45);
        nums[j](q, X[i], FY - 98);
        rings[j].setAttribute('opacity', q);
      });
      kids.forEach((p, i) => P(p, { y: FY - 26, look: 0.6 * Math.sin(t * 2 + i), blink: blinkAt(t, i), mood: 'smile' }));
    }
  };
}
