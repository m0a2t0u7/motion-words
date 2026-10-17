// sew：お母さんがシャツにボタンを当て、針と糸で縫い付ける（例文 My mother sewed a button on my shirt.）
import { seg, lerp, easeInOut, easeOut, backOut, smooth } from '../ease.js';
import { hp, held, reach, room } from './dig.js';

export const meta = { duration: 4.2, beats: [[0, 'ボタンなし'], [1.5, '縫っている'], [3.7, '縫い終わり']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const R = room(k);
  // シャツをかけた台
  el('rect', { x: 248, y: 100, width: 5, height: 100, fill: pal.woodDark });
  const sx = 250;
  el('path', { d: `M ${sx - 14} 96 q 14 14 28 0 L ${sx + 52} 112 L ${sx + 40} 134 L ${sx + 34} 128 L ${sx + 34} 192 L ${sx - 34} 192 L ${sx - 34} 128 L ${sx - 40} 134 L ${sx - 52} 112 Z`, fill: pal.blue });
  el('path', { d: `M ${sx - 14} 96 L ${sx} 112 L ${sx + 14} 96 L ${sx + 8} 94 L ${sx} 104 L ${sx - 8} 94 Z`, fill: '#fff' });
  el('rect', { x: sx - 1, y: 112, width: 2, height: 80, fill: '#4A8BE0' });
  [124, 140].forEach((y) => el('circle', { cx: sx, cy: y, r: 4.5, fill: '#fff', stroke: '#D5DBE5' }));
  const BX = sx, BY = 160;
  el('circle', { cx: BX, cy: BY, r: 9, fill: 'none', stroke: '#fff', 'stroke-width': 1.4, 'stroke-dasharray': '2 3', opacity: 0.8 });
  const b = k.buddy({ x: 184, y: 236, color: pal.coral, dark: pal.coralDark });
  R.front();
  // ボタンと糸
  const btn = g({}); tf(btn, BX, BY);
  el('circle', { r: 8, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 }, btn);
  const H = [[-2.8, -2.8], [2.8, -2.8], [-2.8, 2.8], [2.8, 2.8]];
  const th = [el('line', { x1: H[0][0], y1: H[0][1], x2: H[3][0], y2: H[3][1], stroke: '#fff', 'stroke-width': 1.3 }, btn), el('line', { x1: H[1][0], y1: H[1][1], x2: H[2][0], y2: H[2][1], stroke: '#fff', 'stroke-width': 1.3 }, btn)];
  H.forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 1.3, fill: pal.yellowDark }, btn));
  const holder = g({});
  const nd = g({}, holder);
  el('path', { d: 'M 0 -9 Q -10 -18 -7 -32', fill: 'none', stroke: pal.red, 'stroke-width': 1.6 }, nd);
  el('line', { x1: 0, y1: -9, x2: 0, y2: 18, stroke: '#C9D1DC', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, nd);
  el('ellipse', { cx: 0, cy: -7, rx: 0.9, ry: 2, fill: pal.ink }, nd);
  const spare = g({}); // 左手に持つボタン
  el('circle', { r: 8, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 }, spare);
  return {
    update(t) {
      const grab = easeInOut(seg(t, 0.3, 1.0)), rel = easeInOut(seg(t, 3.4, 3.9));
      const place = t >= 1.1;
      const stitch = seg(t, 1.3, 3.2);
      const cyc = (stitch * 4) % 1, push = Math.sin(Math.PI * Math.min(1, cyc * 1.6));
      const hold = (1 - rel);
      const ex = lerp(0, 1, grab) * hold;
      const rg = easeInOut(seg(t, 0.3, 1.0)), rb = easeInOut(seg(t, 1.1, 1.5));
      b.pose({ lean: 4 * hold, look: 0.7, mood: t > 3.4 ? 'grin' : 'smile', squash: 1 + 0.01 * Math.sin(t * 5), armL: 8, armR: 8 });
      const aBtn = reach(b, 1, 'R', BX - 8, BY + 4), aNd = reach(b, 1, 'R', BX - 18, BY);
      b.pose({ armR: (t < 1.1 ? lerp(8, aBtn, rg) : lerp(aBtn, aNd, rb)) * hold + 8 * (1 - hold) });
      const hl = hp(b, 1, 'R', 26);
      held(k, b, 1, holder, 'R', 0, 30);
      nd.setAttribute('transform', `translate(0 ${(-6 + push * 14).toFixed(2)})`);
      holder.setAttribute('opacity', t > 1.25 && rel < 0.9 ? 1 : 0);
      tf(spare, hl.x, hl.y, 0, 1);
      spare.setAttribute('opacity', t < 1.1 ? 1 : 0);
      btn.setAttribute('opacity', place ? 1 : 0);
      tf(btn, BX, BY, 0, place ? 1 + 0.15 * (1 - smooth(seg(t, 1.1, 1.4))) : 1);
      th[0].setAttribute('opacity', stitch > 0.25 ? 1 : 0);
      th[1].setAttribute('opacity', stitch > 0.75 ? 1 : 0);
    }
  };
}
