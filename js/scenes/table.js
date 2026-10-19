// table：重ねた皿を持ってきて、テーブルのランチョンマットの上に1枚ずつ置く（例文 Put the plates on the table.）
// 共通ヘルパー：diningTable（正面から見たテーブル）
import { seg, lerp, easeInOut, easeOut, wobble, clamp } from '../ease.js';
import { reach, hp } from './dig.js';
import { gait } from './weigh.js';
import { P, blinkAt } from './run-after.js';
import { plate } from './diet.js';
import { homeBg } from './furniture.js';

// 正面から見たテーブル（x0〜x1、天板の上面 y=TY）。front() 以降の図形は天板より手前
export function diningTable(k, x0, x1, TY, FY) {
  const { el, pal } = k;
  k.shadow((x0 + x1) / 2, FY + 1, (x1 - x0) / 2 + 4, 5);
  [x0 + 10, x1 - 22].forEach((x) => el('rect', { x, y: TY + 12, width: 12, height: FY - TY - 12, rx: 3, fill: pal.woodDark }));
  el('path', { d: `M ${x0 + 8} ${TY - 12} L ${x1 - 8} ${TY - 12} L ${x1} ${TY} L ${x0} ${TY} Z`, fill: '#EBD2AC' });
  el('rect', { x: x0, y: TY, width: x1 - x0, height: 12, rx: 3, fill: pal.wood });
  el('rect', { x: x0, y: TY + 9, width: x1 - x0, height: 3, rx: 1.5, fill: pal.woodDark, opacity: 0.5 });
}

export const meta = { duration: 4.5, beats: [[0, '皿を運ぶ'], [1.4, '1枚置く'], [3.0, 'テーブルにそろう']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.86;
  const FY = homeBg(k, { winX: 250, winW: 90 });
  const TY = 182;
  diningTable(k, 180, 384, TY, FY);
  const spots = [228, 318];
  spots.forEach((x) => {
    el('ellipse', { cx: x, cy: TY - 6, rx: 34, ry: 5.5, fill: '#BFE3D6' });
    el('rect', { x: x + 34, y: TY - 8, width: 14, height: 2.6, rx: 1.3, fill: pal.sub });
    el('rect', { x: x - 48, y: TY - 8, width: 14, height: 2.6, rx: 1.3, fill: pal.sub });
  });
  // 花びん
  el('path', { d: `M 268 ${TY - 6} q -8 -12 0 -24 h 8 q 8 12 0 24 Z`, fill: pal.violet });
  [[-8, -38, pal.coral], [4, -42, pal.yellow], [14, -36, pal.red]].forEach(([dx, dy, c]) => {
    el('line', { x1: 272, y1: TY - 28, x2: 272 + dx, y2: TY + dy + 2, stroke: pal.green, 'stroke-width': 2 });
    el('circle', { cx: 272 + dx, cy: TY + dy, r: 5, fill: c });
  });
  const b = k.buddy({ x: 50, y: FY, scale: S });
  const pl = [0, 1].map(() => { const p = g({}); plate(k, 0, 0, 56, p); return p; });
  const xf = (t) => t < 2 ? lerp(50, 160, easeInOut(seg(t, 0.2, 1.2))) : t < 3.6 ? lerp(160, 252, easeInOut(seg(t, 2.1, 2.8))) : lerp(252, 150, easeInOut(seg(t, 3.75, 4.35)));
  const put = [[1.3, 1.9], [2.9, 3.5]];
  return {
    update(t) {
      const w = gait(xf, t, 50, 0, 0.12);
      const away = t > 3.7 && t < 4.35;
      P(b, { x: w.x, walk: w.walk, lean: w.lean, look: 0.5, blink: blinkAt(t), mood: t > 3.6 ? 'grin' : 'smile' });
      const hold = 70;
      let armR = hold, tgt = null;
      put.forEach(([a, c], i) => {
        if (t >= a - 0.05 && t < c + 0.45) {
          tgt = { x: spots[i], y: TY - 13 };
          const go = easeInOut(seg(t, a, c)), back = easeInOut(seg(t, c + 0.05, c + 0.45));
          armR = lerp(hold, reach(b, S, 'R', tgt.x, tgt.y), go * (1 - back));
          if (i === 1) armR = lerp(armR, 8, back);
        }
      });
      if (t > put[1][1] + 0.45) armR = 8;
      P(b, { x: w.x, walk: w.walk, facing: away ? -1 : 1, lean: w.lean + (tgt ? 6 : 0), look: 0.5, blink: blinkAt(t), mood: t > 3.6 ? 'grin' : 'smile', armR, armL: 8 + w.armL - 8 });
      const { x: hx, y: hy } = hp(b, S, 'R', 30);
      pl.forEach((p, i) => {
        const [a, c] = put[i];
        if (t < c) tf(p, hx + 6, hy - 1 + (i === 1 && t < put[0][1] ? 4 : 0));
        else {
          const q = wobble(seg(t, c, c + 0.5), 2.5, 7);
          tf(p, spots[i], TY - 7, 0, 1 + 0.03 * q, 1 - 0.1 * q);
        }
      });
    }
  };
}
