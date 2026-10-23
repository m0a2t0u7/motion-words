// profession：教員免許を壁にかけた先生のまめ。山のような答案の採点と、次々に上がる質問の手に、汗をかきながら向き合う（例文 Teaching is a hard profession.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, aim, hold, person, pencil, sweat, desk } from './confused.js';

export const meta = { duration: 4.4, beats: [[0.0, '専門の仕事'], [1.34, '採点と質問'], [3.06, '大変な職業']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 12, width: 400, height: 12, fill: '#ECE6DC' });
  // 額に入った免許状
  el('rect', { x: 40, y: 40, width: 70, height: 52, rx: 3, fill: '#fff', stroke: pal.woodDark, 'stroke-width': 5 });
  el('circle', { cx: 75, cy: 74, r: 8, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 });
  el('path', { d: 'M 52 54 h 46 M 56 62 h 38', stroke: pal.sub, 'stroke-width': 2 });
  el('rect', { x: 140, y: 26, width: 150, height: 70, rx: 4, fill: '#3E6B5A', stroke: pal.woodDark, 'stroke-width': 5 });
  const b = k.buddy({ x: 110, y: FY, scale: S, facing: 1 });
  const top = desk(k, 60, 130, FY);
  // 答案の山（減っていく）と採点済みの山
  const pile = [], done = [];
  for (let i = 0; i < 10; i++) pile.push(el('rect', { x: 140, y: top - 4 - i * 4, width: 34, height: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 1 }));
  for (let i = 0; i < 10; i++) done.push(el('rect', { x: 76, y: top - 4 - i * 4, width: 34, height: 4, fill: '#FFEDEA', stroke: pal.coral, 'stroke-width': 1 }));
  const pn = pencil(k);
  const X = [250, 310, 370];
  const kids = X.map((x, i) => person(k, ['coral', 'blue', 'yellow'][i], { x, y: FY, scale: 0.68, facing: -1 }));
  const qs = X.map(() => k.text(0, 0, '?', { 'font-size': 18, fill: pal.blueDark }));
  const sw = sweat(k), sw2 = sweat(k);
  return {
    update(t) {
      t *= 4.6 / 4.4; // 4.4 秒に収める
      const n = Math.floor(seg(t, 0.4, 4.2) * 6);
      pile.forEach((r, i) => r.setAttribute('opacity', i < 10 - n ? 1 : 0));
      done.forEach((r, i) => r.setAttribute('opacity', i < n ? 1 : 0));
      // 採点しつつ、質問の子へ顔を向ける
      const ask = Math.floor(t / 1.1) % 3, turn = hump(((t / 1.1) % 1)) > 0.7;
      P(b, { x: 110, facing: 1, lean: 12, look: turn ? 0.9 : 0.4, mood: t > 3.2 ? 'flat' : 'smile', blink: blinkAt(t), armL: 30, squash: 1 - 0.03 * Math.abs(Math.sin(t * 3)) });
      aim(b, S, 'R', 150 + 10 * Math.sin(t * 22), top - 44 + 4 * (10 - n) * 0 + 4 * n);
      hold(k, b, S, pn, 'R', -40);
      kids.forEach((p, i) => {
        const up = (i === ask) ? 1 : 0.4 + 0.3 * Math.sin(t * 5 + i);
        P(p, { x: X[i], facing: -1, armR: 120 + 50 * up + 8 * Math.sin(t * 12 + i), armL: 8, lift: 4 * Math.abs(Math.sin(t * 8 + i)) * up, mood: 'open', look: 0.5, blink: blinkAt(t, i) });
        tf(qs[i], X[i] - 6, FY - 100 - 8 * up, 0, t > 0.8 + i * 0.3 ? 1 : 0.001);
      });
      sw((t * 1.2) % 1 * seg(t, 1.6, 2.0), 128, FY - 98);
      sw2(((t * 1.2) + 0.5) % 1 * seg(t, 2.6, 3.0), 86, FY - 92);
    }
  };
}
