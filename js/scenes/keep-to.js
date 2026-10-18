// keep to：公園の印のついた道を、立ち入り禁止の花だんの近道には入らず、道に沿って歩く（例文 Please keep to the marked path.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { gait } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '印のある道'], [1.6, '花だんを見る'], [3.4, '道どおり進む']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 170, mood: 'outdoor' });
  el('rect', { x: 0, y: 170, width: 400, height: 130, fill: '#BFE3A8' });
  // 道（曲がっている）：上から見た帯
  const pathD = 'M -20 262 C 80 262 110 262 150 230 C 190 196 210 186 260 186 C 320 186 350 220 420 240';
  el('path', { d: pathD, stroke: '#E9DCC4', 'stroke-width': 40, fill: 'none', 'stroke-linecap': 'round' });
  el('path', { d: pathD, stroke: '#fff', 'stroke-width': 3, fill: 'none', 'stroke-dasharray': '10 10' });
  const P = el('path', { d: pathD, fill: 'none' });
  // 花だんの近道（立ち入り禁止）
  [[170, 262], [210, 270], [250, 262], [290, 270], [230, 248], [190, 246]].forEach(([x, y], i) => { el('line', { x1: x, y1: y, x2: x, y2: y + 10, stroke: pal.green, 'stroke-width': 2 }); el('circle', { cx: x, cy: y, r: 5, fill: [pal.red, pal.yellow, pal.violet][i % 3] }); });
  const sign = g({}); tf(sign, 238, 246);
  el('rect', { x: -2, y: -34, width: 4, height: 34, fill: pal.woodDark }, sign);
  el('circle', { cx: 0, cy: -40, r: 12, fill: '#fff', stroke: pal.red, 'stroke-width': 3 }, sign);
  el('path', { d: 'M -6 -46 L 6 -34 M 6 -46 L -6 -34', stroke: pal.red, 'stroke-width': 3 }, sign);
  // 道の印（矢印の立て札）
  const post = g({}); tf(post, 120, 214);
  el('rect', { x: -2, y: -30, width: 4, height: 30, fill: pal.woodDark }, post);
  el('path', { d: 'M -14 -44 L 8 -44 L 16 -37 L 8 -30 L -14 -30 Z', fill: pal.blue }, post);
  [[60, 238], [330, 214]].forEach(([x, y]) => { el('circle', { cx: x, cy: y - 22, r: 18, fill: '#7FD3A0' }); el('rect', { x: x - 3, y: y - 8, width: 6, height: 10, fill: pal.woodDark }); });
  const S = 0.62;
  const b = k.buddy({ x: 0, y: 262, scale: S });
  const L = P.getTotalLength();
  const sf = (t) => L * (0.04 + 0.86 * easeInOut(seg(t, 0.1, 4.3)));
  return {
    update(t) {
      const s = sf(t), p = P.getPointAtLength(s), q = P.getPointAtLength(Math.min(L, s + 2));
      const look = hump(seg(t, 1.4, 2.6));
      const w = s * 0.17;
      b.pose({ x: p.x, y: p.y + 4, walk: w, armL: 8 + 16 * Math.sin(w), armR: 8 - 16 * Math.sin(w), lean: 3, facing: q.x >= p.x ? 1 : -1, look: lerp(0.5, 0.3, look), mood: 'smile' });
      // 花だんを見るときは顔を少し下（手前）へ
      b.body.children[3].setAttribute('transform', `translate(${(lerp(3, 4, look)).toFixed(2)} ${(4 * look).toFixed(2)})`);
    }
  };
}
