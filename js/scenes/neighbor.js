// neighbor：となりの家の人が大きな犬を連れて出てくる。庭で水やり中のまめが手をふる（例文 Our neighbor has a big dog.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { arms, keys, P, blinkAt, C } from './jam.js';
import { dog } from './run-after.js';
import { gait } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '水やり'], [1.0, 'となりの人'], [2.6, '大きな犬']] };

export function create(k) {
  const { el, pal } = k, FY = 236;
  k.backdrop({ floorY: FY, mood: 'outdoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#CDE8C9' });
  // 2軒の家と間の柵
  el('rect', { x: -10, y: 90, width: 130, height: 146, fill: '#F3E6D0' }); el('path', { d: 'M -20 96 L 130 96 L 55 50 Z', fill: '#6AA8F7' });
  el('rect', { x: 250, y: 84, width: 160, height: 152, fill: '#EDE3F7' }); el('path', { d: 'M 240 90 L 410 90 L 325 40 Z', fill: '#E86F57' });
  el('rect', { x: 268, y: 140, width: 50, height: 96, rx: 3, fill: '#8B5E3C' });
  for (let x = 196; x < 248; x += 10) el('rect', { x, y: 196, width: 7, height: 40, rx: 2, fill: '#fff', stroke: '#D9DFE7' });
  el('rect', { x: 192, y: 204, width: 58, height: 5, fill: '#fff' });
  // 花
  [130, 152].forEach((x) => { el('line', { x1: x, y1: FY, x2: x, y2: FY - 22, stroke: '#59C27A', 'stroke-width': 3 }); el('circle', { cx: x, cy: FY - 24, r: 6, fill: '#FF8FB1' }); });
  const me = k.buddy({ x: 80, y: FY, scale: 1.0 });
  // じょうろ（原点＝取っ手）
  const can = k.g({}); el('rect', { x: -6, y: 0, width: 26, height: 20, rx: 4, fill: pal.yellow }, can); el('path', { d: 'M 20 6 L 34 -4', stroke: pal.yellowDark, 'stroke-width': 4, 'stroke-linecap': 'round' }, can); el('path', { d: 'M -4 0 Q 7 -10 18 0', stroke: pal.yellowDark, 'stroke-width': 3, fill: 'none' }, can);
  const drops = [0, 1, 2].map(() => el('circle', { r: 2, fill: pal.water }));
  const nb = k.buddy({ x: 296, y: FY, scale: 1.1, facing: -1, ...C(k, 'blue') });
  const big = dog(k, '#C98A5A', '#A06A3C'); k.tf(big.g, 0, 0, 0, 1.8);
  const leash = el('path', { stroke: pal.coralDark, 'stroke-width': 2.5, fill: 'none' });
  const A = arms(k, me, 1.0), B = arms(k, nb, 1.1, { col: pal.blue, dark: pal.blueDark, back: ['R'] });
  const xn = keys([[0.8, 296], [2.0, 330]]), xd = keys([[0.8, 300], [2.0, 268]]);
  return {
    update(t) {
      const water = t < 1.6;
      P(me, { look: t > 1.4 ? 0.8 : 0.3, blink: blinkAt(t), mood: t > 2.4 ? 'open' : 'smile', lean: t > 2.4 ? -4 : 0 });
      const hx = 80 + 40, hy = FY - 46;
      A.to('R', hx, hy); k.tf(can, hx, hy, water ? 28 : 0);
      drops.forEach((d, i) => { const u = (t * 2 + i / 3) % 1; k.set(d, { cx: hx + 34 + u * 6, cy: hy + 10 + u * 30, opacity: water ? 1 - u : 0 }); });
      A.ang('L', t > 2.6 ? 150 + Math.sin(t * 10) * 14 : 10);
      // 犬（ふつうの犬の約2倍）とお隣さん
      const gd = gait(xd, t, 300), gn = gait(xn, t, 296);
      const wag = t > 2.0 ? 1 : 0;
      big.set(0, 0, gd.walk, -1, gd.m);
      big.g.setAttribute('transform', `translate(${gd.x.toFixed(1)} ${FY}) scale(1.8)`);
      P(nb, { x: gn.x, walk: gn.walk, lean: gn.lean, facing: -1, look: 0.5, blink: blinkAt(t, 1), mood: 'grin' });
      const nh = B.to('L', gn.x - 34, FY - 40); B.ang('R', t > 2.6 ? 150 + Math.sin(t * 10 + 1) * 14 : 10);
      k.set(leash, { d: `M ${nh.x} ${nh.y} Q ${(nh.x + gd.x - 30) / 2} ${FY - 20} ${gd.x - 30} ${FY - 50}` });
      void wag;
    }
  };
}
