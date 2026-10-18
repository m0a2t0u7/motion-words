// give out：入口の前で2人のまめがチラシを持ち、通りかかる人に1枚ずつ配る（例文 They gave out leaflets at the entrance.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { hp, gait } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '入口でチラシ'], [1.6, '1枚ずつ渡す'], [3.8, '配り終えた']] };

function leaflet(k) {
  const g = k.g({});
  k.el('rect', { x: -8, y: -11, width: 16, height: 22, rx: 1.5, fill: '#fff', stroke: k.pal.line, 'stroke-width': 1.2 }, g);
  k.el('rect', { x: -5, y: -8, width: 10, height: 6, rx: 1, fill: k.pal.yellow }, g);
  [1, 5].forEach((y) => k.el('line', { x1: -5, x2: 5, y1: y, y2: y, stroke: k.pal.sub, 'stroke-width': 1.4 }, g));
  return g;
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  // 建物の入口
  el('rect', { x: 60, y: 60, width: 280, height: 170, rx: 6, fill: '#F3E6DC' });
  el('rect', { x: 50, y: 52, width: 300, height: 14, rx: 4, fill: pal.coralDark });
  el('rect', { x: 160, y: 120, width: 80, height: 110, rx: 4, fill: '#BFE3F5', stroke: '#fff', 'stroke-width': 4 });
  el('line', { x1: 200, y1: 120, x2: 200, y2: 230, stroke: '#fff', 'stroke-width': 4 });
  [[76, 120], [266, 120]].forEach(([x, y]) => el('rect', { x, y, width: 58, height: 44, rx: 4, fill: '#DDEFFA' }));
  el('rect', { x: 140, y: 228, width: 120, height: 8, rx: 3, fill: '#D9DFE7' });
  const S = 0.85;
  const A = k.buddy({ x: 150, y: FY - 8, scale: S, facing: -1 }), B = k.buddy({ x: 250, y: FY - 8, scale: S, facing: 1 });
  const stacks = [leaflet(k), leaflet(k)];
  const c1 = k.buddy({ x: -30, y: FY + 12, scale: S, color: pal.coral, dark: pal.coralDark });
  const c2 = k.buddy({ x: 430, y: FY + 12, scale: S, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const f1 = leaflet(k), f2 = leaflet(k);
  const x1 = (t) => t < 1.9 ? lerp(-30, 92, easeInOut(seg(t, 0.0, 1.2))) : lerp(92, 360, easeInOut(seg(t, 1.9, 3.7)));
  const x2 = (t) => t < 2.7 ? lerp(430, 308, easeInOut(seg(t, 0.8, 2.0))) : lerp(308, 40, easeInOut(seg(t, 2.7, 4.4)));
  return {
    update(t) {
      const give = [easeInOut(seg(t, 1.05, 1.4)) * (1 - easeInOut(seg(t, 1.7, 2.0))), easeInOut(seg(t, 1.85, 2.2)) * (1 - easeInOut(seg(t, 2.5, 2.8)))];
      [A, B].forEach((m, i) => {
        m.pose({ armR: lerp(20, 80, give[i]), armL: 40, look: 0.5, lean: 6 * give[i], mood: 'grin', squash: 1 + 0.01 * Math.sin(t * 4 + i) });
        const h = hp(m, S, 'L');
        tf(stacks[i], h.x, h.y - 6, 0, 1.1, 1.1);
      });
      const p1 = gait(x1, t, -30), p2 = gait(x2, t, 430);
      const r1 = lerp(10, 80, easeInOut(seg(t, 1.2, 1.4))), r2 = lerp(10, 80, easeInOut(seg(t, 2.0, 2.2)));
      c1.pose({ x: p1.x, walk: p1.walk, armL: p1.armL, armR: t < 1.2 ? p1.armR : t < 1.9 ? r1 : 70, lean: p1.lean, look: t < 1.9 ? 0.5 : 0.2, mood: t > 1.5 ? 'grin' : 'smile' });
      c2.pose({ x: p2.x, walk: p2.walk, armL: p2.armL, armR: t < 2.0 ? p2.armR : t < 2.7 ? r2 : 70, lean: p2.lean, look: 0.5, mood: t > 2.3 ? 'grin' : 'smile' });
      // チラシ：配る人の手→もらう人の手
      [[f1, A, c1, 1.42, 1.62], [f2, B, c2, 2.22, 2.42]].forEach(([f, m, c, a, b]) => {
        const hm = hp(m, S), hc = hp(c, S), q = easeInOut(seg(t, a, b));
        tf(f, lerp(hm.x, hc.x, q), lerp(hm.y, hc.y, q) - 8, lerp(-8, 6, q));
        f.setAttribute('opacity', t > a - 0.35 ? 1 : 0);
      });
    }
  };
}
