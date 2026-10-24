// survive：まめがサボテンに水を数滴だけやり、日が過ぎてもサボテンは元気で花が咲く（例文 Cactuses can survive with very little water.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { hp } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, '水を数滴'], [1.6, '日が過ぎる'], [3.5, '元気で花が咲く']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = k.backdrop({ floorY: 232, mood: 'outdoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 70, fill: '#F2DDA8' });
  el('rect', { x: 0, y: FY, width: 400, height: 2, fill: '#E3C98A' });
  el('path', { d: `M 0 ${FY} Q 90 ${FY - 30} 200 ${FY - 8} T 400 ${FY - 14} V ${FY} Z`, fill: '#F7E7B8' });
  // 太陽
  const sun = g({}); el('circle', { r: 24, fill: '#FFD66B' }, sun);
  const rays = [...Array(8)].map((_, i) => el('line', { x1: 0, y1: -33, x2: 0, y2: -42, stroke: '#FFC24A', 'stroke-width': 4, 'stroke-linecap': 'round', transform: `rotate(${i * 45})` }, sun));
  // カレンダー
  const cal = g({}); tf(cal, 70, 56);
  el('rect', { x: -28, y: -26, width: 56, height: 56, rx: 7, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, cal);
  el('path', { d: 'M -28 -19 Q -28 -26 -21 -26 L 21 -26 Q 28 -26 28 -19 L 28 -10 L -28 -10 Z', fill: pal.red }, cal);
  const num = k.text(0, 20, '1', { 'font-size': 26 }, cal);
  // サボテン（鉢の中央が 300）
  const POT = FY - 22;
  const cactus = g({});
  el('rect', { x: -12, y: -58, width: 24, height: 60, rx: 12, fill: '#4FB27A' }, cactus);
  el('path', { d: 'M -12 -22 Q -28 -22 -28 -36 L -28 -44', fill: 'none', stroke: '#4FB27A', 'stroke-width': 11, 'stroke-linecap': 'round' }, cactus);
  el('path', { d: 'M 12 -30 Q 28 -30 28 -42 L 28 -50', fill: 'none', stroke: '#4FB27A', 'stroke-width': 11, 'stroke-linecap': 'round' }, cactus);
  [[-4, -44], [4, -26], [-3, -12]].forEach(([x, y]) => el('line', { x1: x, y1: y, x2: x, y2: y - 4, stroke: '#2E8A58', 'stroke-width': 2, 'stroke-linecap': 'round' }, cactus));
  const fl = g({}, cactus);
  [0, 72, 144, 216, 288].forEach((r) => el('ellipse', { cx: 0, cy: -7, rx: 4.5, ry: 7, fill: '#FF8FB0', transform: `rotate(${r})` }, fl));
  el('circle', { r: 3.6, fill: pal.yellow }, fl);
  tf(fl, 0, -64);
  k.shadow(300, FY + 2, 34, 6);
  el('path', { d: `M 278 ${POT} L 322 ${POT} L 316 ${FY} L 284 ${FY} Z`, fill: '#D98C5F' });
  el('rect', { x: 274, y: POT - 4, width: 52, height: 8, rx: 3, fill: '#C97A4E' });
  const b = k.buddy({ x: 218, y: FY + 4, scale: S });
  // 水のカップ（手の位置に付く）と水滴
  const cup = g({});
  el('rect', { x: 0, y: -20, width: 22, height: 24, rx: 4, fill: pal.blue }, cup);
  el('rect', { x: 0, y: -20, width: 22, height: 6, rx: 3, fill: '#DDEFFA' }, cup);
  const drops = [0, 1, 2].map(() => el('path', { d: 'M 0 -5 Q 4 1 0 4 Q -4 1 0 -5 Z', fill: pal.water || pal.blue }));

  return {
    update(t) {
      const lift = easeInOut(seg(t, 0.2, 0.8)), tip = easeInOut(seg(t, 0.8, 1.3)) * (1 - easeInOut(seg(t, 2.0, 2.4)));
      const ar = lerp(lerp(10, 120, lift) - 12 * tip, 22, easeInOut(seg(t, 2.5, 3.1)));
      P(b, { armR: ar, lean: 4 * tip, look: 0.7, mood: t > 3.3 ? 'grin' : 'smile', blink: blinkAt(t), armL: t > 3.4 ? lerp(8, 70, easeOut(seg(t, 3.4, 3.8))) : 8 });
      const h = hp(b, S, 'R');
      const th = 62 * tip + 6 * lift * (1 - tip), r = (th * Math.PI) / 180;
      tf(cup, h.x - 2, h.y + 6, th, S, S);
      const lipX = h.x - 2 + S * (22 * Math.cos(r) + 20 * Math.sin(r)), lipY = h.y + 6 + S * (22 * Math.sin(r) - 20 * Math.cos(r));
      drops.forEach((d, i) => {
        const s0 = 1.0 + i * 0.3, p = seg(t, s0, s0 + 0.5);
        k.set(d, { transform: `translate(${lipX.toFixed(1)} ${(lipY + p * p * (POT - 2 - lipY)).toFixed(1)})`, opacity: p > 0 && p < 1 ? 1 : 0 });
      });
      // 日がたつ：カレンダーの数字と太陽の動き
      const d = seg(t, 1.7, 3.4), day = Math.round(lerp(1, 14, d));
      num.textContent = String(day);
      tf(cal, 70, 56, 0, 1 + 0.1 * hump(((d * 6) % 1)));
      const sa = lerp(0, 1, seg(t, 0, 4.4));
      tf(sun, lerp(330, 130, sa), lerp(70, 54, hump(sa) * 1) , 0, 1 + 0.05 * Math.sin(t * 6));
      rays.forEach((r, i) => r.setAttribute('transform', `rotate(${i * 45 + t * 20})`));
      // サボテン：水で一瞬ふくらむ→日がたっても元気→花が咲く
      const sq = 1 + 0.08 * wobble(seg(t, 1.5, 2.3), 2, 4);
      tf(cactus, 300, POT, 0, 2 - sq, sq);
      const bloom = seg(t, 3.4, 3.9);
      tf(fl, 0, -64, bloom * 40, bloom <= 0 ? 0.001 : backOut(bloom), bloom <= 0 ? 0.001 : backOut(bloom));
    }
  };
}
