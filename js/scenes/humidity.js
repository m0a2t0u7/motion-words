// humidity：夏の部屋、湿度計の針が90%へ上がり、空気がじめじめ。まめは汗をかきうちわであおぐ（例文 The humidity is high in summer.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { held, P, blinkAt } from './nature.js';

export const meta = { duration: 4.2, beats: [[0, '夏の部屋'], [1.0, '湿度が上がる'], [2.6, 'じめじめ']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: '#E6DCCB' });
  // 窓（夏空）
  el('rect', { x: 30, y: 40, width: 100, height: 80, rx: 6, fill: '#8FD0F5', stroke: '#fff', 'stroke-width': 5 });
  el('circle', { cx: 105, cy: 64, r: 12, fill: '#FFC93C' });
  // 湿度計
  const MX = 290, MY = 100;
  el('circle', { cx: MX, cy: MY, r: 48, fill: '#fff', stroke: pal.ink, 'stroke-width': 4 });
  el('path', { d: `M ${MX - 34} ${MY + 18} A 38 38 0 1 1 ${MX + 34} ${MY + 18}`, stroke: pal.line, 'stroke-width': 6, fill: 'none' });
  el('path', { d: `M ${MX + 30} ${MY - 24} A 38 38 0 0 1 ${MX + 34} ${MY + 18}`, stroke: pal.blue, 'stroke-width': 6, fill: 'none' });
  k.text(MX, MY + 30, '%', { 'font-size': 14, fill: pal.sub });
  const val = k.text(MX, MY + 14, '40', { 'font-size': 16 });
  const needle = el('line', { x1: 0, y1: 0, x2: 0, y2: -32, stroke: pal.red, 'stroke-width': 3, 'stroke-linecap': 'round' });
  el('circle', { cx: MX, cy: MY, r: 4, fill: pal.ink });
  const drops = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => el('path', { d: 'M 0 -6 Q 4 0 0 4 Q -4 0 0 -6 Z', fill: '#9FD3F0', opacity: 0 }));
  const b = k.buddy({ x: 160, y: FY, scale: S });
  const fan = g({});
  el('rect', { x: -2, y: -4, width: 4, height: 16, fill: pal.woodDark }, fan);
  el('ellipse', { cx: 0, cy: 26, rx: 16, ry: 14, fill: '#FF9C8C' }, fan);
  const sweat = [0, 1].map(() => el('path', { d: 'M 0 -6 Q 4 0 0 4 Q -4 0 0 -6 Z', fill: '#7FC3EA' }));
  return {
    update(t) {
      const h = lerp(40, 90, easeInOut(seg(t, 0.6, 2.4)));
      tf(needle, MX, MY, -135 + (h / 100) * 270);
      val.textContent = String(Math.round(h / 5) * 5);
      const hot = easeOut(seg(t, 1.6, 2.6));
      drops.forEach((d, i) => { tf(d, 40 + i * 46 + 6 * Math.sin(t + i), 150 + 30 * Math.sin(t * 0.8 + i * 2)); d.setAttribute('opacity', 0.6 * hot); });
      const fanA = hot * (60 + 25 * Math.sin(t * 16));
      P(b, { look: 0.3, mood: hot > 0.4 ? 'sad' : 'smile', squash: 1 - 0.05 * hot, lean: 3 * hot, armR: lerp(8, fanA + 40, hot), armL: 10, blink: Math.max(blinkAt(t), 0.4 * hot) });
      held(k, b, S, fan, 'R', 180);
      sweat.forEach((s, i) => { const p = ((t * 0.9 + i * 0.5) % 1); tf(s, 140 + i * 38, FY - 86 + 26 * p, 0, hot); s.setAttribute('opacity', hot * (1 - p)); });
    }
  };
}
