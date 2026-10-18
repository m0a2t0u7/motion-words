// separate：山積みの洗濯物から白いものを左のかご、色物を右のかごへ、一枚ずつ分ける（例文 Separate the white clothes from the colored ones.）
import { seg, lerp, easeInOut, easeOut } from '../ease.js';
import { hp, reach } from './dig.js';

export const meta = { duration: 4.6, beats: [[0, 'ごちゃ混ぜの山'], [1.6, '一枚ずつ分ける'], [4.0, '白と色物に分かれた']] };

const SHIRT = 'M -10 -9 L -4 -11 Q 0 -7 4 -11 L 10 -9 L 15 -2 L 10 1 L 8 -3 L 8 10 L -8 10 L -8 -3 L -10 1 L -15 -2 Z';
const COL = ['#FF8E77', '#6AA8F7', '#FFCF5C'];
const N = 6, S0 = 0.55, CY = 0.55, RELA = 105, FLY = 0.42;
const dir = (i) => (i % 2 === 0 ? -1 : 1);
const rel = (i) => S0 + i * CY + 0.275;

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 150, y: 44, width: 100, height: 60, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const b = k.buddy({ x: 200, y: FY });
  // 洗濯物をのせる台（人物の手前）
  el('rect', { x: 164, y: 214, width: 72, height: 8, fill: pal.woodDark });
  k.shadow(200, 238, 38, 5);
  el('rect', { x: 170, y: 222, width: 6, height: 16, fill: pal.woodDark }); el('rect', { x: 224, y: 222, width: 6, height: 16, fill: pal.woodDark });
  el('rect', { x: 158, y: 206, width: 84, height: 10, rx: 3, fill: pal.wood });
  const PILE = { x: 200, y: 200 };
  const shirts = [];
  const rot0 = [-18, 12, 24, -8, 6, -28], off = [[-9, 2], [7, 0], [-2, -3], [10, 3], [-6, -4], [3, 4]];
  for (let i = 0; i < N; i++) {
    const s = g({}), white = i % 2 === 0;
    el('path', { d: SHIRT, fill: white ? '#fff' : COL[(i >> 1) % 3], stroke: white ? '#BAC3D1' : 'rgba(40,52,70,0.25)', 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, s);
    shirts.push(s);
  }
  const LBX = 62, RBX = 338;
  [LBX, RBX].forEach((x, j) => {
    const c = g({}); tf(c, x, 240);
    k.shadow(0, 0, 38, 5, c);
    el('path', { d: 'M -32 -26 L -28 0 L 28 0 L 32 -26 Z', fill: '#E6C48E', stroke: pal.woodDark, 'stroke-width': 2, 'stroke-linejoin': 'round' }, c);
    el('rect', { x: -34, y: -29, width: 68, height: 6, rx: 3, fill: pal.woodDark }, c);
    [-14, 0, 14].forEach((dx) => el('line', { x1: dx, y1: -21, x2: dx * 0.9, y2: -2, stroke: pal.woodDark, 'stroke-width': 1.5, opacity: 0.5 }, c));
    if (j === 0) el('circle', { cy: -11, r: 6, fill: '#fff', stroke: '#BAC3D1', 'stroke-width': 1.5 }, c);
    else COL.forEach((cl, i) => el('circle', { cx: (i - 1) * 9, cy: -11, r: 4, fill: cl }, c));
  });
  const slot = (i) => ({ x: (i % 2 === 0 ? LBX : RBX) + ((i >> 1) - 1) * 15, y: 208 - ((i >> 1) % 2) * 3 });
  const relPos = (j) => { const a = (RELA * Math.PI) / 180; return { x: 200 + dir(j) * (27 + 24 * Math.sin(a)), y: 236 - 10 - 46 + 24 * Math.cos(a) }; };
  return {
    update(t) {
      const act = t >= S0 && t < S0 + N * CY, done = t >= S0 + N * CY;
      const i = Math.max(0, Math.min(N - 1, Math.floor((t - S0) / CY)));
      const u = (t - (S0 + i * CY)) / CY;
      const prev = i === 0 ? 1 : dir(i - 1);
      let face = 1;
      if (act) face = lerp(prev, dir(i), easeInOut(seg(u, 0, 0.14)));
      else if (done) face = lerp(dir(N - 1), 1, easeInOut(seg(t, S0 + N * CY + 0.1, S0 + N * CY + 0.3)));
      if (Math.abs(face) < 0.05) face = face < 0 ? -0.05 : 0.05;
      b.pose({ armL: 8, armR: 8, squash: 1, walk: 0, blink: 0, lift: 0, facing: face, lean: act && u > 0.1 && u < 0.5 ? 6 : 0, mood: done ? 'grin' : 'smile', look: 0.3 });
      const g0 = reach(b, 1, 'R', PILE.x, PILE.y - 4);
      let ang = 8;
      if (act) ang = u < 0.15 ? lerp(8, g0, easeInOut(u / 0.15)) : u < 0.3 ? g0 : u < 0.5 ? lerp(g0, RELA, easeOut((u - 0.3) / 0.2)) : lerp(RELA, 8, easeInOut((u - 0.5) / 0.5));
      b.pose({ armR: ang });
      const hand = hp(b, 1, 'R', 24);
      shirts.forEach((s, j) => {
        const r = rel(j), land = r + FLY, grab = S0 + j * CY + 0.08, sl = slot(j);
        if (t < grab) tf(s, PILE.x + off[j][0], PILE.y + off[j][1] - 2 * (N - j) * 0.4, rot0[j], 0.9);
        else if (t < r) tf(s, hand.x, hand.y, dir(j) * -25, 0.9);
        else if (t < land) {
          const q = (t - r) / FLY, st = relPos(j);
          tf(s, lerp(st.x, sl.x, easeOut(q)), lerp(st.y, sl.y, q * q) - 62 * Math.sin(q * Math.PI), dir(j) * -25 + dir(j) * -300 * q, 0.9);
        } else tf(s, sl.x, sl.y, ((j >> 1) - 1) * 9, 0.9);
      });
    }
  };
}
