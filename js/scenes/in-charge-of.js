// in charge of：営業チームの前に立ち、売上グラフを示しながら一人ずつ指示を出す→全員がうなずいて動く（She is in charge of the sales team.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, backOut } from '../ease.js';
import { officeBg } from './get-on-with.js';
import { person } from './queue-up.js';
import { P, blinkAt, mark } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, 'チームの前'], [1.2, '一人ずつ指示'], [3.4, 'まとめ役']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = officeBg(k, 236, 250);
  // 売上グラフのボード
  el('rect', { x: 20, y: 40, width: 120, height: 92, rx: 6, fill: '#fff', stroke: '#C4CCD8', 'stroke-width': 5 });
  el('line', { x1: 34, y1: 120, x2: 128, y2: 120, stroke: pal.sub, 'stroke-width': 2 });
  const bars = [30, 44, 58, 76].map((h, i) => el('rect', { x: 40 + i * 22, y: 120 - h, width: 14, height: h, rx: 2, fill: i === 3 ? pal.green : pal.blue }));
  el('path', { d: 'M 46 96 L 68 84 L 90 70 L 114 50', stroke: pal.coralDark, 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' });
  el('rect', { x: 76, y: 132, width: 8, height: FY - 132, fill: '#C4CCD8' });
  k.shadow(80, FY + 1, 26, 4);
  const G = k.buddy({ x: 140, y: FY });
  el('path', { d: 'M 0 -8 L 2.4 -2.6 L 8 -2.4 L 3.6 1.4 L 5 7 L 0 3.8 L -5 7 L -3.6 1.4 L -8 -2.4 L -2.4 -2.6 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.2, transform: 'translate(-12 -26)' }, G.body);
  const team = [['blue', 236], ['yellow', 296], ['violet', 356]].map(([c, x]) => person(k, c, { x, y: FY, facing: -1, scale: 0.82 }));
  const cks = team.map(() => mark(k, 'check'));
  const T0 = [1.0, 1.8, 2.6];
  return {
    update(t) {
      const i = t < 1.0 ? -1 : Math.min(2, Math.floor((t - 1.0) / 0.8));
      const toBoard = hump(seg(t, 0.1, 0.9)), fin = easeOut(seg(t, 3.5, 3.9));
      const ang = i < 0 ? 0 : [96, 86, 80][i];
      const pt = i >= 0 && t < 3.4 ? 1 : 0;
      P(G, { facing: t < 0.95 ? -1 : 1, armR: t < 0.95 ? 8 + 110 * toBoard : pt ? ang + 6 * Math.sin(t * 10) : lerp(8, 40, fin), armL: fin ? lerp(8, 30, fin) : 8,
        lean: pt ? 4 : 0, look: t < 0.95 ? 0.6 : 0.6, mood: pt && Math.sin(t * 18) > 0 ? 'open' : 'grin', squash: 1 + 0.02 * fin, blink: blinkAt(t) });
      team.forEach((b, j) => {
        const n = seg(t, T0[j] + 0.25, T0[j] + 0.75), nod = Math.max(0, Math.sin(n * Math.PI * 2)) * (n > 0 && n < 1 ? 1 : 0);
        const all = Math.max(0, Math.sin(seg(t, 3.5, 4.2) * Math.PI * 2));
        P(b, { facing: -1, lean: 9 * (nod + all * 0.7), look: t < 0.9 ? 0.2 : 0.6, mood: t > T0[j] + 0.3 ? 'smile' : 'flat', armR: 8 + 40 * hump(seg(t, T0[j] + 0.4, T0[j] + 1.0)), blink: blinkAt(t, j) });
        const s = seg(t, T0[j] + 0.4, T0[j] + 0.7);
        tf(cks[j], b.state.x, FY - 96, 0, Math.max(0.001, backOut(s)));
      });
    }
  };
}
