// get ahead：かばんを持った人が仕事の階段を一段ずつ上り、ほかの人より上の段へ出て成功する（例文 She worked hard to get ahead in her career.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { held } from './dig.js';
import { person, officeBg, pop } from './queue-up.js';
import { gait } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '下の段'], [1.8, '上っていく'], [3.8, '一番上へ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = officeBg(k, 236);
  const ST = [[90, 0], [150, 30], [210, 60], [270, 90]]; // [x, 高さ]
  ST.forEach(([x, h], i) => { if (h) el('rect', { x, y: FY - h, width: 400 - x, height: h, fill: i % 2 ? '#DCE6F2' : '#CFDCEB' }); el('rect', { x, y: FY - h, width: 400 - x, height: 4, fill: '#B9C8DA' }); });
  const flag = g({}); tf(flag, 360, FY - 90);
  el('line', { x1: 0, y1: 0, x2: 0, y2: -50, stroke: pal.ink, 'stroke-width': 3 }, flag);
  el('path', { d: 'M 0 -50 L 26 -42 L 0 -34 Z', fill: pal.red }, flag);
  const S = 0.75;
  const o1 = person(k, 'coral', { x: 180, y: FY - 30, scale: S, facing: 1 });
  const o2 = person(k, 'blue', { x: 236, y: FY - 60, scale: S, facing: 1 });
  const me = k.buddy({ x: 50, y: FY, scale: S });
  const bag = g({});
  el('rect', { x: -10, y: 4, width: 20, height: 14, rx: 3, fill: pal.woodDark }, bag);
  el('path', { d: 'M -5 4 L -5 0 L 5 0 L 5 4', stroke: pal.ink, 'stroke-width': 2, fill: 'none' }, bag);
  const star = el('path', { d: 'M 0 -10 L 3 -3 L 10 0 L 3 3 L 0 10 L -3 3 L -10 0 L -3 -3 Z', fill: pal.yellow });
  const pts = [[0.2, 50], [1.0, 120], [1.8, 180], [2.6, 240], [3.4, 320]];
  const xf = (t) => { for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) return lerp(pts[i - 1][1], pts[i][1], easeInOut(seg(t, pts[i - 1][0], pts[i][0]))); return t < pts[0][0] ? 50 : 320; };
  const ground = (x) => { let h = 0; ST.forEach(([sx, sh]) => { if (x > sx + 6) h = sh; }); return FY - h; };
  return {
    update(t) {
      const p = gait(xf, t, 50);
      const gy = lerp(ground(p.x - 8), ground(p.x + 8), 0.5) - 6 * Math.abs(Math.sin(p.walk)) * p.m;
      me.pose({ x: p.x, y: gy, walk: p.walk, armL: p.armL, armR: 14, lean: p.lean + 4 * p.m, look: 0.6, mood: t > 3.5 ? 'grin' : 'flat' });
      held(k, me, S, bag, 'R', 0);
      o1.pose({ look: lerp(0.4, 0.7, seg(t, 1.6, 2.2)), mood: 'flat' });
      o2.pose({ look: lerp(0.4, 0.7, seg(t, 2.4, 3.0)), mood: 'flat' });
      const q = pop(seg(t, 3.5, 3.9));
      star.setAttribute('opacity', t > 3.5 ? 1 : 0);
      tf(star, 320, FY - 90 - 82, 0, Math.max(0.001, q));
      void easeOut; void hump;
    }
  };
}
