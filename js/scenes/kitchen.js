// kitchen：台所のコンロで、お母さんが鍋をおたまで混ぜて料理している（例文 Mom is cooking in the kitchen.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { reach, hp } from './dig.js';
import { kitchenBg } from './weigh.js';

export const meta = { duration: 4.2, beats: [[0, '台所に立つ'], [1.4, 'かき混ぜる'], [3.0, '湯気が立つ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = kitchenBg(k, 240);
  // 壁：吊り下げ調理器具、冷蔵庫、棚
  el('rect', { x: 330, y: 64, width: 62, height: 176, rx: 6, fill: '#EEF3F7', stroke: pal.line, 'stroke-width': 2 }); el('line', { x1: 330, y1: 120, x2: 392, y2: 120, stroke: pal.line, 'stroke-width': 2 }); el('rect', { x: 337, y: 90, width: 4, height: 22, rx: 2, fill: pal.sub }); el('rect', { x: 337, y: 140, width: 4, height: 30, rx: 2, fill: pal.sub });
  [[148, 'ladle'], [168, 'whisk']].forEach(([x]) => { el('line', { x1: x, y1: 52, x2: x, y2: 74, stroke: pal.sub, 'stroke-width': 2 }); el('circle', { cx: x, cy: 80, r: 7, fill: 'none', stroke: pal.sub, 'stroke-width': 3 }); });
  el('rect', { x: 140, y: 46, width: 40, height: 4, rx: 2, fill: pal.woodDark });
  // カウンターとコンロ
  el('rect', { x: 120, y: 198, width: 220, height: 10, fill: pal.wood });
  const sink = el('rect', { x: 262, y: 200, width: 52, height: 6, rx: 3, fill: '#BFE3F5' });
  el('rect', { x: 120, y: 208, width: 220, height: 32, fill: '#F6D9B3' }); el('rect', { x: 120, y: 208, width: 220, height: 3, fill: pal.woodDark, opacity: 0.4 });
  [136, 190].forEach((x) => el('rect', { x: x, y: 216, width: 48, height: 18, rx: 3, fill: 'none', stroke: pal.woodDark, 'stroke-width': 1.5, opacity: 0.55 }));
  const stove = g({}); tf(stove, 196, 198);
  el('rect', { x: -26, y: -5, width: 52, height: 6, rx: 3, fill: '#5C6678' }, stove);
  const flame = el('path', { d: 'M -10 -5 q 3 -7 5 0 q 3 -8 5 0 q 3 -7 5 0 q 3 -8 5 0 Z', fill: pal.yellow }, stove);
  const pot = g({}); tf(pot, 196, 192);
  el('rect', { x: -22, y: -26, width: 44, height: 28, rx: 6, fill: '#9FB0C4', stroke: '#6E839B', 'stroke-width': 2 }, pot); el('rect', { x: -26, y: -29, width: 52, height: 6, rx: 3, fill: '#B7C3D2', stroke: '#6E839B', 'stroke-width': 1.5 }, pot);
  el('rect', { x: -28, y: -16, width: 6, height: 5, rx: 2, fill: '#6E839B' }, pot); el('rect', { x: 22, y: -16, width: 6, height: 5, rx: 2, fill: '#6E839B' }, pot);
  const soup = el('ellipse', { cx: 0, cy: -27, rx: 20, ry: 3.2, fill: '#E8955A' }, pot);
  const veg = [[-8, pal.green], [4, pal.coral], [11, pal.yellow]].map(([x, c]) => el('circle', { cx: x, cy: -27, r: 3.2, fill: c }, pot));
  const steam = [0, 1, 2].map((i) => el('path', { d: 'M 0 0 q 6 -8 0 -16 q -6 -8 0 -16', fill: 'none', stroke: '#C9D3DF', 'stroke-width': 3.4, 'stroke-linecap': 'round' }));
  const mom = k.buddy({ x: 130, y: FY, scale: 1.0, color: pal.coral, dark: pal.coralDark });
  // エプロンとお玉
  const ap = el('path', { d: 'M -22 -32 L 22 -32 L 26 -6 Q 0 0 -26 -6 Z', fill: '#fff', opacity: 0.92 }); mom.body.appendChild(ap);
  const ladle = g({}); el('line', { x1: 0, y1: -4, x2: 0, y2: 32, stroke: pal.woodDark, 'stroke-width': 3.4, 'stroke-linecap': 'round' }, ladle); el('ellipse', { cx: 0, cy: 34, rx: 6, ry: 4.5, fill: pal.woodDark }, ladle);
  return {
    update(t) {
      const a = easeOut(seg(t, 0.3, 1.2)), sw = Math.sin(t * 5.5) * a;
      const tx = 196 + 11 * Math.sin(t * 5.5) * a, ty = 168 + 3 * Math.cos(t * 5.5) * a;
      mom.pose({ armR: lerp(8, reach(mom, 1, 'R', tx, ty), a), armL: 8 + 6 * a + 0, lean: 7 * a, mood: t > 2.8 ? 'grin' : 'smile', look: 0.6, squash: 1 + 0.01 * Math.sin(t * 3), blink: hump(seg(t, 3.3, 3.5)) });
      const h = hp(mom, 1, 'R', 28);
      const dx = tx - h.x, dy = ty - h.y;
      tf(ladle, h.x, h.y, Math.atan2(-dx, dy) * 180 / Math.PI + 0, 1, 1);
      ladle.setAttribute('transform', `translate(${h.x.toFixed(1)} ${h.y.toFixed(1)}) rotate(${(Math.atan2(-(tx - h.x), (ty + 18 - h.y)) * 180 / Math.PI).toFixed(1)})`);
      k.set(flame, { transform: `scale(${1 + 0.12 * Math.sin(t * 17)} ${1 + 0.35 * Math.sin(t * 13)})` });
      veg.forEach((v, i) => k.set(v, { cx: -9 + 9 * i + 4 * Math.sin(t * 5.5 + i) * a, cy: -27 + 1.4 * Math.sin(t * 7 + i) }));
      steam.forEach((s, i) => { const q = ((t * 0.5 + i / 3) % 1); tf(s, 188 + i * 8 + 6 * Math.sin(t * 2 + i), 166 - 26 * q, 0, 0.7 + 0.5 * q, 0.7 + 0.4 * q); s.setAttribute('opacity', seg(t, 0.8, 1.6) * Math.sin(q * Math.PI) * 0.9); });
    }
  };
}
