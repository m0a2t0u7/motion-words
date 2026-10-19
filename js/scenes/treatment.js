// treatment：医師がけがをした腕に包帯を巻く治療が、カレンダーで2か月続き、最後に包帯が取れて腕が動く（例文 The treatment for the injury took two months.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { doctor, medRoom } from './surgery.js';
import { hp, reach } from './dig.js';
import { calendar } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '腕のけが'], [1.5, '治療が2か月'], [3.3, '治った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = medRoom(k, 238);
  const cal = calendar(k, 200, 34, 54);
  el('rect', { x: 300, y: 46, width: 70, height: 56, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  // 診察台
  el('rect', { x: 40, y: 168, width: 130, height: 16, rx: 6, fill: '#8CC7B8' });
  [50, 152].forEach((x) => el('rect', { x, y: 184, width: 8, height: FY - 184, fill: '#9AA4B4' }));
  k.shadow(105, FY + 1, 70, 4);
  const S = 0.95, b = k.buddy({ x: 112, y: 186, scale: S });
  b.g.children[0].setAttribute('opacity', 0);
  const band = el('line', { stroke: '#fff', 'stroke-width': 13, 'stroke-linecap': 'round' });
  const bandL = el('line', { stroke: '#D5DCE5', 'stroke-width': 13, 'stroke-dasharray': '2 5', opacity: 0.9 });
  const dr = k.buddy({ x: 200, y: FY, scale: 1.15, facing: -1, color: pal.coral, dark: pal.coralDark });
  doctor(k, dr);
  const months = ['APR', 'MAY', 'JUN'];
  return {
    update(t) {
      const mi = t < 1.9 ? 0 : t < 2.7 ? 1 : 2;
      const fp = t > 1.6 && t < 1.9 ? seg(t, 1.6, 1.9) : t > 2.4 && t < 2.7 ? seg(t, 2.4, 2.7) : 0;
      cal.set(months[mi], fp);
      const healed = easeOut(seg(t, 3.25, 3.6));
      const swing = 66 + 50 * hump(seg(t, 3.4, 4.2)) * (0.5 + 0.5 * Math.sin((t - 3.4) * 9));
      b.pose({ armR: t < 3.25 ? 66 : swing, armL: 10, mood: t < 3.25 ? (t < 1.4 ? 'sad' : 'flat') : 'grin', look: 0.5, squash: 1 + 0.03 * wobble(seg(t, 3.4, 4.2), 2, 3) });
      const sh = hp(b, S, 'R', 4), hd = hp(b, S, 'R', 22);
      const wrap = easeInOut(seg(t, 0.3, 1.4)) * (1 - healed);
      const e = { x: lerp(sh.x, hd.x, Math.max(0.02, wrap)), y: lerp(sh.y, hd.y, Math.max(0.02, wrap)) };
      [band, bandL].forEach((n) => k.set(n, { x1: sh.x, y1: sh.y, x2: e.x, y2: e.y, opacity: wrap > 0.02 ? 1 : 0 }));
      const work = easeInOut(seg(t, 0.15, 0.4)) * (1 - easeInOut(seg(t, 1.4, 1.7))) + hump(seg(t, 2.9, 3.4));
      const ax = e.x + 4 * Math.sin(t * 16), ay = e.y + 6 * Math.cos(t * 16);
      dr.pose({ lean: 8 * work, look: 0.6, armR: lerp(8, reach(dr, 1.15, 'R', ax, ay), Math.min(1, work)), armL: 8, mood: t > 3.5 ? 'grin' : 'smile' });
    }
  };
}
