// selfish：みんなで分けるはずのケーキを、まめが大皿ごと自分の前へ引き寄せて抱えこむ。2人はがっかり（例文 It was selfish of him to take all the cake.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, hp, aim, person, homeBg, sym, mark } from './confused.js';

export const meta = { duration: 4.2, beats: [[0, 'みんなのケーキ'], [1.3, '全部取る'], [2.8, '自分だけ']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const FY = homeBg(k, { winX: 160 });
  const ppl = [['coral', 230], ['blue', 320]].map(([c, x]) => person(k, c, { x, y: FY, scale: 0.92, facing: -1 }));
  const b = k.buddy({ x: 80, y: FY, scale: S });
  // テーブル（手前）と小皿
  const top = FY - 50;
  k.shadow(200, FY + 2, 150, 5);
  el('rect', { x: 40, y: top, width: 320, height: 9, rx: 4, fill: pal.wood });
  [52, 340].forEach((x) => el('rect', { x, y: top + 9, width: 8, height: 41, fill: pal.woodDark }));
  [230, 320].forEach((x) => el('ellipse', { cx: x - 14, cy: top - 2, rx: 14, ry: 3.5, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }));
  // 大皿のホールケーキ（4切れ）
  const cake = g({});
  el('ellipse', { cx: 0, cy: 0, rx: 34, ry: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, cake);
  el('rect', { x: -26, y: -26, width: 52, height: 24, rx: 4, fill: '#FFF1D6' }, cake);
  el('rect', { x: -26, y: -16, width: 52, height: 4, fill: '#F7B7C4' }, cake);
  el('rect', { x: -26, y: -28, width: 52, height: 6, rx: 3, fill: '#fff' }, cake);
  [-13, 0, 13].forEach((x) => el('line', { x1: x, y1: -28, x2: x, y2: -2, stroke: '#E9D3B0', 'stroke-width': 1.2 }, cake));
  [-18, -6, 6, 18].forEach((x) => el('circle', { cx: x, cy: -31, r: 3.5, fill: pal.red }, cake));
  const grab = sym(k, '!', pal.coralDark, 24), x = mark(k, 'x', undefined, 1.4);
  return {
    update(t) {
      const pull = easeInOut(seg(t, 1.3, 2.3)), hugP = easeOut(seg(t, 2.3, 2.7));
      const cx = lerp(200, 114, pull), cy = top - 1;
      tf(cake, cx, cy, 0, 1);
      P(b, { x: 80, armR: 20, armL: 10, lean: lerp(0, 18, seg(t, 1.0, 1.3)) - 20 * pull + 6 * hugP, look: 0.8, mood: t > 1.2 ? 'grin' : 'smile', blink: blinkAt(t) });
      if (t > 1.0) aim(b, S, 'R', cx - 30, cy - 14);
      if (t > 2.3) b.pose({ armL: lerp(10, -30, hugP) });
      ppl.forEach((p, i) => {
        const reach = hump(seg(t, 0.4 + i * 0.2, 1.3)) * 0.6;
        P(p, { x: [230, 320][i], facing: -1, look: 0.7, armR: 20 + 50 * reach, armL: 8, lean: lerp(0, 6, reach), mood: t > 2.0 ? 'sad' : 'grin', blink: blinkAt(t, i + 1) });
        if (t > 2.4) p.pose({ squash: 0.97, lean: 4 });
      });
      grab(seg(t, 1.6, 1.9), 270, FY - 120);
      tf(x, 200, FY - 140, 0, t > 2.9 ? 1.5 * easeOut(seg(t, 2.9, 3.2)) : 0.001);
    }
  };
}
