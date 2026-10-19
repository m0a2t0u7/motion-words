// zipper：かばんのファスナーを引っぱるが、布がかんで動かない。何度引いても開かない（例文 The zipper on my bag is stuck, and I can't open it.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { reach, hp, P, blinkAt } from './skirt.js';
import { mark } from './so-far-so-good.js';

export const meta = { duration: 4.2, beats: [[0, 'ファスナーを持つ'], [1.0, '引っぱる'], [3.0, '開かない']] };

export function create(k) {
  const { el, g, pal, tf } = k, S = 1.3;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  el('rect', { x: 40, y: 50, width: 80, height: 62, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  // テーブル
  k.shadow(290, FY + 1, 96, 5);
  el('rect', { x: 186, y: 178, width: 210, height: 9, rx: 3, fill: pal.wood });
  [198, 384].forEach((x) => el('rect', { x: x - 3, y: 187, width: 6, height: FY - 187, fill: pal.woodDark }));
  // かばん（上面にファスナー）
  const bag = g({}); tf(bag, 296, 178);
  k.shadow(0, 0, 66, 4, bag);
  const bb = g({}, bag);
  el('path', { d: 'M -64 0 L -60 -62 Q -58 -74 -44 -74 L 44 -74 Q 58 -74 60 -62 L 64 0 Z', fill: pal.violet }, bb);
  el('path', { d: 'M -40 -74 Q -40 -104 0 -104 Q 40 -104 40 -74', fill: 'none', stroke: '#8C70DD', 'stroke-width': 7, 'stroke-linecap': 'round' }, bb);
  el('rect', { x: -40, y: -36, width: 80, height: 26, rx: 6, fill: '#8C70DD' }, bb);
  el('line', { x1: -54, y1: -64, x2: 54, y2: -64, stroke: '#6E55C2', 'stroke-width': 6 }, bb);
  el('line', { x1: -54, y1: -64, x2: 54, y2: -64, stroke: '#D9DFE7', 'stroke-width': 3, 'stroke-dasharray': '2 2' }, bb);
  // かんだ布（スライダーの先）
  el('path', { d: 'M -34 -64 q 2 -12 8 -6 q 3 -9 8 -1 q 4 -6 5 6 Z', fill: '#F6F1FF', stroke: '#8C70DD', 'stroke-width': 1.4 }, bb);
  const slider = g({}, bb);
  el('rect', { x: -6, y: -69, width: 12, height: 10, rx: 3, fill: '#C9D3E0', stroke: pal.sub, 'stroke-width': 1.4 }, slider);
  const tab = el('rect', { x: -3, y: -62, width: 6, height: 14, rx: 3, fill: '#C9D3E0', stroke: pal.sub, 'stroke-width': 1.4 }, slider);
  const SX = -40; // スライダー位置（左端近く）
  const X = 172;
  const b = k.buddy({ x: X, y: FY, scale: S });
  const strain = [0, 1].map(() => el('path', { d: 'M 0 -6 L 4 0 L 0 6', fill: 'none', stroke: pal.coralDark, 'stroke-width': 2.6, 'stroke-linecap': 'round' }));
  const sweat = el('path', { d: 'M 0 -7 Q 5 0 0 5 Q -5 0 0 -7 Z', fill: pal.water });
  const ex = mark(k, 'x', k.root, 1.4);
  return {
    update(t) {
      const grab = easeInOut(seg(t, 0.2, 0.7));
      const tugs = [[1.0, 1.4], [1.6, 2.0], [2.2, 2.8]];
      let tug = 0; tugs.forEach(([a, c], i) => { tug = Math.max(tug, hump(seg(t, a, c)) * (1 + i * 0.5)); });
      const give = easeInOut(seg(t, 2.95, 3.3));
      P(b, { x: X - 4 * tug, lean: 8 * grab - 8 * tug, squash: 1 - 0.03 * tug, look: 0.5, mood: t > 2.9 ? 'sad' : tug > 0.3 ? 'flat' : 'smile', blink: blinkAt(t) });
      // スライダーはほんの少し動いては戻る（かんでいる）
      const sx = SX - 2 * tug + 0.8 * Math.sin(t * 60) * (tug > 0.2 ? 1 : 0);
      tf(slider, sx, 0);
      tf(tab, 0, 0, 0, 1, 1);
      const tabW = { x: 296 + sx, y: 178 - 50 };
      const armR = reach(b, S, 'R', tabW.x - 4 * tug, tabW.y);
      b.pose({ armR: lerp(8, armR, grab * (1 - give)), armL: lerp(8, reach(b, S, 'L', 296 - 60, 178 - 30), grab * (1 - give)) * 1 });
      if (give > 0) b.pose({ armR: lerp(armR, 8, give) });
      // かばん：引かれるたびに少したわむ（位置は動かない）
      tf(bb, 0, 0, -1.2 * tug, 1 - 0.01 * tug, 1 + 0.006 * tug);
      const h = hp(b, S, 'R');
      strain.forEach((n, i) => { tf(n, X + (i ? 46 : -46), FY - 70, 0, i ? 1 : -1); n.setAttribute('opacity', tug > 0.4 ? 1 : 0); });
      const sq = seg(t, 2.4, 3.6);
      tf(sweat, X - 22, FY - 112 + 20 * sq); sweat.setAttribute('opacity', hump(sq));
      tf(ex, tabW.x, tabW.y - 40, 0, t > 3.1 ? easeOut(seg(t, 3.1, 3.4)) * 1.4 : 0.001);
      void h; void wobble;
    }
  };
}
