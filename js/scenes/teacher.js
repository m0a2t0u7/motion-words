// teacher：先生のまめが黒板に HOMEWORK と書いた後、生徒たちの机にプリントを1枚ずつ配る（例文 My teacher gave us homework.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { CO, BL, YE, hp, reach, P, blinkAt, walkTo, path, wear, deskFront } from './member.js';
import { paper } from './bag.js';

export const meta = { duration: 4.4, beats: [[0, '宿題を出す'], [1.0, 'プリントを配る'], [3.4, '宿題が出た']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.85, FY = 236;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 20, y: 30, width: 160, height: 84, rx: 4, fill: '#3E6B5A', stroke: pal.woodDark, 'stroke-width': 6 });
  k.text(100, 62, 'HOMEWORK', { 'font-size': 16, fill: '#fff' });
  el('path', { d: 'M 50 86 h 70 M 50 98 h 40', stroke: '#fff', 'stroke-width': 3, opacity: 0.6, 'stroke-linecap': 'round' });
  // 生徒と机（右側に3人）
  const ST = [[170, CO(k)], [270, BL(k)], [370, YE(k)]];
  const kids = ST.map(([x, c]) => k.buddy({ x, y: FY, scale: 0.68, facing: -1, ...c }));
  const TOP = FY - 34;
  ST.forEach(([x]) => deskFront(k, x - 24, 44, TOP, FY));
  const handed = ST.map(([x]) => { const p = paper(k, k.root, 18, 12, 2); return p; });
  const b = k.buddy({ x: 60, y: FY, scale: S, facing: 1 }); wear(k, b, 'glasses');
  const pile = g({}); for (let i = 0; i < 3; i++) el('rect', { x: -10, y: -8 - i * 2, width: 20, height: 14, rx: 1, fill: '#fff', stroke: pal.line }, pile);
  const give = [1.3, 2.3, 3.2];
  const bx = path([[0.4, 60], [1.0, 120], [1.6, 120], [2.0, 220], [2.5, 220], [2.9, 320]]);
  return {
    update(t) {
      const w = walkTo(bx, t, 60, 1);
      P(b, { x: w.x, walk: w.walk, armL: 60, armR: w.armR, lean: w.lean, look: 0.7, blink: blinkAt(t), mood: t > 3.4 ? 'grin' : 'smile' });
      const hl = hp(b, S, 'L', 26); tf(pile, hl.x + 8, hl.y - 4, 0, Math.max(0.001, 1 - seg(t, 3.0, 3.1)));
      give.forEach((tg, i) => {
        const dx = ST[i][0] - 12, q = seg(t, tg - 0.3, tg + 0.3);
        if (q > 0 && q < 1) b.pose({ armR: lerp(w.armR, reach(b, S, 'R', dx, TOP - 8), hump(q)) });
        const h = hp(b, S, 'R', 30);
        if (t < tg - 0.3) tf(handed[i], 0, -100, 0, 0.001);
        else if (t < tg) tf(handed[i], h.x, h.y);
        else tf(handed[i], dx, TOP - 4, 0, 1);
      });
      kids.forEach((kd, i) => P(kd, { look: t > give[i] ? 0.2 : 0.7, blink: blinkAt(t, i * 0.6), mood: t > give[i] + 0.2 ? (i === 1 ? 'sad' : 'open') : 'smile', lean: t > give[i] ? 8 : 0 }));
    }
  };
}
