// thunder：窓の外でゴロゴロッと雷が鳴る。犬はびくっとして、テーブルクロスの下へ逃げ込んで隠れる（例文 The dog hid when it heard thunder.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { fall } from './nature.js';
import { dog } from './run-after.js';
import { P, blinkAt } from './body.js';

export const meta = { duration: 4.4, beats: [[0, 'ゴロゴロ…'], [1.4, '犬がにげる'], [2.8, '隠れた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: '#E7DCCD' });
  // 窓（嵐の夜空）
  const WX = 40, WY = 40, WW = 120, WH = 100;
  el('rect', { x: WX, y: WY, width: WW, height: WH, fill: '#3B4560' });
  const flash = el('rect', { x: WX, y: WY, width: WW, height: WH, fill: '#EAF0FF', opacity: 0 });
  const rg = g({}); rg.setAttribute('clip-path', k.clip((c) => el('rect', { x: WX, y: WY, width: WW, height: WH }, c)));
  const rain = fall(k, { n: 14, FY: WY + WH, kind: 'rain', speed: 260, x0: WX, x1: WX + WW + 30, parent: rg });
  const bolt = el('path', { d: `M ${WX + 70} ${WY} L ${WX + 54} ${WY + 44} L ${WX + 68} ${WY + 44} L ${WX + 48} ${WY + 96} L ${WX + 82} ${WY + 36} L ${WX + 68} ${WY + 36} L ${WX + 80} ${WY} Z`, fill: '#FFE27A', opacity: 0 }, rg);
  el('rect', { x: WX, y: WY, width: WW, height: WH, fill: 'none', stroke: '#fff', 'stroke-width': 6 });
  el('line', { x1: WX + WW / 2, y1: WY, x2: WX + WW / 2, y2: WY + WH, stroke: '#fff', 'stroke-width': 4 });
  const boom = [0, 1, 2].map(() => el('path', { d: 'M 0 0 l 8 -6 l 4 8 l 8 -6', stroke: pal.ink, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0 }));
  // テーブル（右）：脚、犬のあとにクロスを描く
  const TX = 300;
  el('rect', { x: TX - 60, y: FY - 76, width: 8, height: 76, fill: pal.woodDark });
  el('rect', { x: TX + 52, y: FY - 76, width: 8, height: 76, fill: pal.woodDark });
  const me = k.buddy({ x: 70, y: FY, scale: 0.85 });
  const d = dog(k);
  el('path', { d: `M ${TX - 72} ${FY - 82} H ${TX + 72} L ${TX + 70} ${FY - 22} Q ${TX + 52} ${FY - 14} ${TX + 36} ${FY - 22} Q ${TX + 18} ${FY - 14} ${TX} ${FY - 22} Q ${TX - 18} ${FY - 14} ${TX - 36} ${FY - 22} Q ${TX - 52} ${FY - 14} ${TX - 70} ${FY - 22} Z`, fill: '#F2A0A0' });
  el('path', { d: `M ${TX - 72} ${FY - 82} H ${TX + 72}`, stroke: '#E07F7F', 'stroke-width': 4 });
  el('rect', { x: TX - 20, y: FY - 104, width: 16, height: 22, rx: 3, fill: '#fff' });
  const T = 1.0;
  const xf = (t) => lerp(150, 306, easeInOut(seg(t, 1.35, 2.5)));
  return {
    update(t) {
      rain(t);
      const fl = hump(seg(t, T - 0.1, T + 0.15)) + 0.6 * hump(seg(t, T + 0.25, T + 0.4)) + 0.7 * hump(seg(t, 3.3, 3.5));
      flash.setAttribute('opacity', clamp(fl));
      bolt.setAttribute('opacity', clamp(fl * 1.5));
      boom.forEach((n, i) => { const p = seg(t, T + 0.1 + i * 0.08, T + 0.9); tf(n, WX + WW + 10 + i * 6, WY + 20 + i * 26, -10 + i * 12, 1 + 0.3 * p); n.setAttribute('opacity', hump(p)); });
      // 犬：びくっと跳ねる→走る→クロスの下でふるえる
      const jump = hump(seg(t, T + 0.1, T + 0.45));
      const run = seg(t, 1.35, 2.5), x = xf(t), m = run > 0 && run < 1 ? 1 : 0;
      const shake = t > 2.5 ? Math.sin(t * 60) * 1.2 : 0;
      const st = hump(seg(t, T + 0.05, T + 0.6));
      P(me, { x: 70, lift: 14 * st, armL: 150 * st + 10, armR: 150 * st + 10, mood: t > 3.0 ? 'smile' : st > 0.1 || (t > T && t < 2.8) ? 'open' : 'flat', blink: blinkAt(t), look: t > 1.6 ? 1 : 0.3 });
      d.set(x + shake, FY - 22 * jump, (x - 150) * 0.12, 1, m);
    }
  };
}
