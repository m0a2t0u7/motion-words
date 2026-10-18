// call out：まめが口に手を当てて、広い原っぱの向こうの彼女の名前を大声で呼ぶ→声が届き、彼女がふり向いて手を振る（例文 He called out her name across the field.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { say, faceAt } from './look-over.js';

export const meta = { duration: 4.2, beats: [[0, '遠くの彼女'], [1.0, '大声で呼ぶ'], [2.8, 'ふり向いた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 220 });
  el('path', { d: 'M 0 220 Q 200 200 400 214 L 400 300 L 0 300 Z', fill: '#BFE5B5' });
  el('path', { d: 'M 0 260 Q 200 248 400 262', fill: 'none', stroke: '#A9D99E', 'stroke-width': 3 });
  [[300, 196], [360, 202]].forEach(([x, y]) => { el('rect', { x: x - 3, y: y - 20, width: 6, height: 20, fill: pal.woodDark }); el('circle', { cx: x, cy: y - 30, r: 15, fill: '#7FD3A0' }); });
  const her = k.buddy({ x: 340, y: 238, scale: 0.55, color: pal.coral, dark: pal.coralDark, facing: 1 });
  const b = k.buddy({ x: 70, y: 262, scale: 1 });
  const bub = say(k, 40, 34, -1);
  const ic = g({}, bub.g); el('circle', { r: 10, fill: pal.coral }, ic); el('circle', { cx: -3, cy: -2, r: 1.6, fill: pal.ink }, ic); el('circle', { cx: 3, cy: -2, r: 1.6, fill: pal.ink }, ic);
  const arcs = [0, 1, 2, 3].map(() => el('path', { d: 'M 0 -14 Q 10 0 0 14', fill: 'none', stroke: pal.mintDark, 'stroke-width': 4, 'stroke-linecap': 'round' }));
  return {
    update(t) {
      const cup = easeOut(seg(t, 0.4, 0.8)) * (1 - easeInOut(seg(t, 2.8, 3.2)));
      const yell = t > 0.9 && t < 2.4;
      b.pose({ armR: 8 + 120 * cup, armL: 8 + 120 * cup + 50 * easeOut(seg(t, 3.0, 3.3)), lean: -6 * hump(seg(t, 0.6, 1.0)) + 8 * (yell ? 1 : 0) * cup, squash: 1 + 0.05 * hump(seg(t, 0.6, 1.0)), mood: yell ? 'open' : t > 3.0 ? 'grin' : 'smile', look: 0.8 });
      faceAt(b, 5, -3);
      bub.show(seg(t, 0.9, 1.1) * (1 - seg(t, 2.6, 2.8)), 116, 150);
      arcs.forEach((a, i) => { const u = (t - 0.9 - i * 0.3) / 1.4; const on = u > 0 && u < 1 && t < 3.2; tf(a, lerp(110, 318, u), lerp(204, 210, u), 0, lerp(0.8, 1.6, u)); a.setAttribute('opacity', on ? 0.85 * (1 - u * 0.6) : 0); });
      const turn = seg(t, 2.3, 2.5) > 0.5;
      her.pose({ facing: turn ? -1 : 1, armR: turn ? 8 + 150 * easeOut(seg(t, 2.6, 2.9)) + 15 * Math.sin(t * 10) * seg(t, 2.9, 3.1) : 10, lift: 6 * hump(seg(t, 2.3, 2.6)), mood: turn ? 'grin' : 'smile', look: 0.6, walk: turn ? 0 : t * 2 });
    }
  };
}
