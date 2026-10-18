// spread：彼女がたたんだ地図を両手でテーブルいっぱいに広げ、しわを伸ばす（例文 She spread the map on the table.）
import { seg, lerp, easeInOut, easeOut } from '../ease.js';
import { hp } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, 'たたんだ地図'], [1.4, '広げる'], [3.4, '広がった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const S = 1.1, CX = 200;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 40, y: 40, width: 80, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const b = k.buddy({ x: CX, y: FY, scale: S, color: pal.coral, dark: pal.coralDark });
  b.armL.a.setAttribute('display', 'none'); b.armR.a.setAttribute('display', 'none');
  // テーブル（人物の手前）
  el('path', { d: 'M 70 194 L 330 194 L 352 226 L 48 226 Z', fill: '#EBD2A6' });
  el('path', { d: 'M 70 194 L 330 194 L 331 197 L 69 197 Z', fill: '#fff', opacity: 0.5 });
  el('rect', { x: 48, y: 226, width: 304, height: 14, fill: '#D9B07C' });
  el('rect', { x: 48, y: 226, width: 304, height: 3, fill: pal.woodDark, opacity: 0.4 });
  // 地図（全開時の幅 140、高さ 24）
  const MW = 140, MY = 198, MH = 26;
  const map = g({});
  const body = g({}, map);
  el('rect', { x: -MW / 2 + 2, y: 3, width: MW, height: MH, rx: 2, fill: pal.shadow }, body);
  el('rect', { x: -MW / 2, y: 0, width: MW, height: MH, rx: 2, fill: '#FFFDF2', stroke: '#E2D6B0', 'stroke-width': 1.5 }, body);
  el('path', { d: `M -60 8 Q -40 20 -22 10 T 20 14 T 56 6`, fill: 'none', stroke: pal.blue, 'stroke-width': 5, opacity: 0.6, 'stroke-linecap': 'round' }, body);
  el('path', { d: `M -56 18 L -30 6 L -4 14 L 24 4 L 50 14`, fill: 'none', stroke: pal.red, 'stroke-width': 2, 'stroke-dasharray': '4 3' }, body);
  el('circle', { cx: 50, cy: 14, r: 3.5, fill: pal.red }, body);
  el('rect', { x: -52, y: 3, width: 14, height: 9, rx: 2, fill: pal.green, opacity: 0.6 }, body);
  const folds = [0, 1, 2, 3].map((i) => el('rect', { x: 0, y: 0, width: 0, height: MH, fill: pal.ink, opacity: 0 }, map));
  const mk = (st) => ({
    a: el('line', { stroke: pal.coralDark, 'stroke-width': 9 * S, 'stroke-linecap': 'round' }),
    h: el('circle', { r: 6.5 * S, fill: pal.coral, stroke: pal.coralDark, 'stroke-width': 2.5 * S })
  });
  const AL = mk(), AR = mk();
  return {
    update(t) {
      const p = easeInOut(seg(t, 1.0, 2.8)), W = lerp(36, MW, p);
      const smooth = Math.sin(seg(t, 2.8, 3.7) * Math.PI * 2) * 6 * (t > 2.8 && t < 3.7 ? 1 : 0);
      b.pose({ lean: 10 + 4 * p, look: 0.0, mood: t > 3.4 ? 'grin' : 'smile', squash: 1 });
      tf(map, CX, MY + 2, 0, 1);
      tf(body, 0, 0, 0, W / MW, 1);
      const L = -W / 2, R = W / 2;
      folds.forEach((f, i) => {
        const w = W / 4;
        k.set(f, { x: L + i * w, width: w, opacity: i % 2 ? 0.14 * (1 - p * 0.5) : 0.0 });
      });
      const gap = easeOut(seg(t, 0.2, 0.9));
      const lx = lerp(CX - 8, CX + L + 3, gap) + smooth * 0.4, rx = lerp(CX + 8, CX + R - 3, gap) - smooth * 0.4;
      const hy = MY + 15 - 3 * gap;
      const sL = hp(b, S, 'L', 0), sR = hp(b, S, 'R', 0);
      k.set(AL.a, { x1: sL.x, y1: sL.y, x2: lx, y2: hy }); k.set(AL.h, { cx: lx, cy: hy });
      k.set(AR.a, { x1: sR.x, y1: sR.y, x2: rx, y2: hy }); k.set(AR.h, { cx: rx, cy: hy });
    }
  };
}
