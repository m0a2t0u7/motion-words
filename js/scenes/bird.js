// bird：窓の外の枝で小鳥がさえずり、音符が流れてくる。部屋のまめが気づいて耳をすます（例文 A bird is singing outside.）
// このファイルは音符のヘルパーも書き出す（noteG）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { birdG } from './nature.js';

export function noteG(k, col = '#4A8BE0', parent) {
  const g = k.g({}, parent);
  k.el('ellipse', { cx: 0, cy: 0, rx: 5, ry: 3.8, fill: col, transform: 'rotate(-20)' }, g);
  k.el('path', { d: 'M 4.2 -1 V -18 Q 10 -14 11 -8', stroke: col, 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }, g);
  return g;
}

export const meta = { duration: 4.2, beats: [[0, '部屋の中'], [1.0, '外で鳥が歌う'], [2.6, '聞こえる']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.0;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: '#E7DCCD' });
  // 窓（外に木の枝）
  const WX = 200, WY = 40, WW = 170, WH = 130;
  el('rect', { x: WX, y: WY, width: WW, height: WH, fill: '#CFEAFB' });
  const out = g({}); out.setAttribute('clip-path', k.clip((c) => el('rect', { x: WX, y: WY, width: WW, height: WH }, c)));
  el('circle', { cx: WX + 150, cy: WY + 20, r: 50, fill: '#8ED39E' }, out); el('circle', { cx: WX + 110, cy: WY - 10, r: 40, fill: '#7FCB92' }, out);
  el('path', { d: `M ${WX + WW} ${WY + 70} Q ${WX + 110} ${WY + 76} ${WX + 60} ${WY + 92}`, stroke: '#A8794A', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }, out);
  el('ellipse', { cx: WX + 70, cy: WY + 84, rx: 9, ry: 5, fill: '#7FCB92' }, out);
  const bd = birdG(k, '#F2B84B', out);
  el('rect', { x: WX, y: WY, width: WW, height: WH, fill: 'none', stroke: '#fff', 'stroke-width': 7 });
  el('line', { x1: WX + WW / 2, y1: WY, x2: WX + WW / 2, y2: WY + WH, stroke: '#fff', 'stroke-width': 5 });
  el('rect', { x: WX - 8, y: WY + WH, width: WW + 16, height: 8, rx: 3, fill: '#fff' });
  const beak = el('path', { d: 'M 0 0 L 5 2 L 0 3 Z', fill: '#FFB547' });
  const notes = [0, 1, 2, 3].map((i) => noteG(k, [pal.blueDark, pal.coralDark, pal.violet, pal.mintDark][i]));
  const me = k.buddy({ x: 110, y: FY, scale: S });
  const BX = WX + 110, BY = WY + 74;
  return {
    update(t) {
      const sing = t > 0.8, hop = hump(seg(t % 1.2, 0, 0.25)) * (sing ? 0 : 1);
      bd.set(BX, BY - hop * 3, 0, -1);
      const op = sing ? 0.5 + 0.5 * Math.sin(t * 22) : 0;
      tf(beak, BX - 10, BY - 12, 20 * op, -1, 1); beak.setAttribute('opacity', sing ? 1 : 0);
      notes.forEach((n, i) => {
        const q = ((t - 0.9 - i * 0.45) / 1.6);
        const p = q - Math.floor(q), on = t > 0.9 + i * 0.45;
        tf(n, BX - 16 - 150 * p, BY - 20 - 30 * p + Math.sin(p * 10 + i) * 6, -10 + 20 * Math.sin(p * 6), 1);
        n.setAttribute('opacity', on ? clamp(hump(p) * 1.6) : 0);
      });
      const hear = easeInOut(seg(t, 1.8, 2.4));
      P(me, { x: 110, armR: lerp(8, 160, hear), armL: 8, lean: -4 * hear, look: lerp(-0.2, 0.9, easeInOut(seg(t, 1.4, 1.8))), mood: t > 2.6 ? 'grin' : t > 1.4 ? 'open' : 'smile', blink: t > 2.8 ? 0.7 : blinkAt(t), lift: 4 * hump(seg(t, 1.3, 1.6)) });
    }
  };
}
