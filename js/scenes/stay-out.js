// stay out：家の灯りは消えたのに、まめは外で遊び続ける（例文 He stayed out until midnight.）
import { seg, lerp, easeInOut, easeOut, wobble } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, '夕方の外'], [1.4, '日が暮れる'], [2.8, '0時まで外']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const sky = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#FCE6D6' });
  const night = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#6A6598', opacity: 0 });
  const FY = 238;
  el('rect', { x: 0, y: FY, width: 400, height: 62, fill: '#E4E7EC' });
  const stars = [[300, 40], [350, 70], [250, 56], [70, 36], [150, 70]].map(([x, y]) => el('circle', { cx: x, cy: y, r: 2, fill: '#fff', opacity: 0 }));
  const moon = el('path', { d: 'M 330 40 a 16 16 0 1 0 10 30 a 13 13 0 1 1 -10 -30 Z', fill: '#FFE9A8', opacity: 0 });
  // 家
  el('rect', { x: 14, y: 110, width: 130, height: 128, rx: 4, fill: '#FBE9DC' });
  el('path', { d: 'M 4 116 L 79 62 L 154 116 Z', fill: pal.coral, stroke: pal.coral, 'stroke-width': 6, 'stroke-linejoin': 'round' });
  const win = el('rect', { x: 28, y: 138, width: 40, height: 34, rx: 4, fill: '#FFE9A8' });
  el('rect', { x: 88, y: 150, width: 38, height: 88, rx: 4, fill: pal.blue });
  el('circle', { cx: 118, cy: 196, r: 3, fill: pal.yellow });
  // 時計
  const clk = g({});
  el('rect', { x: -34, y: -18, width: 68, height: 36, rx: 8, fill: pal.ink }, clk);
  const tm = k.text(0, 1, '6:00', { 'font-size': 22, fill: '#fff' }, clk);
  tf(clk, 270, 100);
  // 街灯
  el('line', { x1: 220, y1: FY, x2: 220, y2: 130, stroke: pal.ink, 'stroke-width': 5, 'stroke-linecap': 'round' });
  const lamp = el('circle', { cx: 220, cy: 126, r: 11, fill: pal.yellow });
  const halo = el('ellipse', { cx: 220, cy: FY, rx: 60, ry: 10, fill: '#FFF3C4', opacity: 0 });
  const b = k.buddy({ x: 290, y: FY, scale: 0.95 });
  const ball = el('circle', { r: 9, fill: pal.red });
  return {
    update(t) {
      const dk = easeInOut(seg(t, 0.8, 2.6));
      night.setAttribute('opacity', 0.75 * dk);
      stars.forEach((s) => s.setAttribute('opacity', dk));
      moon.setAttribute('opacity', dk);
      win.setAttribute('fill', t < 2.0 ? '#FFE9A8' : '#7C7AA6');
      halo.setAttribute('opacity', dk);
      const hr = t < 0.8 ? '6:00' : t < 1.6 ? '9:00' : t < 2.4 ? '11:00' : '12:00';
      tm.textContent = hr;
      // ボールで遊ぶ
      const ph = (t * 2.2) % 1;
      const by = FY - 12 - 70 * Math.sin(Math.PI * ph);
      tf(ball, lerp(250, 330, 0.5 + 0.5 * Math.sin(t * 1.3)), by);
      const up = Math.sin(Math.PI * ph);
      b.pose({ x: lerp(250, 330, 0.5 + 0.5 * Math.sin(t * 1.3)) - 10, armL: 100 * (1 - up) + 8, armR: 100 * (1 - up) + 8, look: 0.2, mood: 'grin', squash: 1 - 0.05 * (ph < 0.15 ? 1 - ph / 0.15 : 0) });
    }
  };
}
