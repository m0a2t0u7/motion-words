// speed up：下り坂で自転車がだんだん加速する（例文 The bike sped up on the hill.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, 'ゆっくり走る'], [1.7, '加速していく'], [3.4, '速い']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236 });
  // 坂（静止）：左が高く右が低い
  const SL = 0.2, Y0 = 156;
  const gy = (x) => Y0 + SL * x;
  el('path', { d: `M 0 ${Y0} L 400 ${gy(400)} L 400 300 L 0 300 Z`, fill: '#CDEBD2' });
  el('path', { d: `M 0 ${Y0} L 400 ${gy(400)}`, stroke: '#A9D8B3', 'stroke-width': 6 });
  [[70, 60, 1], [300, 40, 0.8]].forEach(([x, y, z]) => {
    el('ellipse', { cx: x, cy: y, rx: 34 * z, ry: 12 * z, fill: '#fff' });
    el('ellipse', { cx: x + 16 * z, cy: y - 9 * z, rx: 18 * z, ry: 11 * z, fill: '#fff' });
  });
  const ang = (Math.atan(SL) * 180) / Math.PI;
  const streak = g({});
  [0, 1, 2].forEach((i) => el('line', { x1: 0, y1: -30 - i * 16, x2: -(40 + i * 10), y2: -30 - i * 16, stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' }, streak));
  const bike = g({});
  const mkWheel = (cx) => {
    const w = g({}, bike); tf(w, cx, -20);
    el('circle', { r: 20, fill: 'none', stroke: pal.ink, 'stroke-width': 4 }, w);
    const sp = g({}, w);
    [0, 60, 120].forEach((a) => el('line', { x1: -18, y1: 0, x2: 18, y2: 0, stroke: pal.sub, 'stroke-width': 1.6, transform: `rotate(${a})` }, sp));
    el('circle', { r: 3, fill: pal.ink }, w);
    return sp;
  };
  const sh = k.shadow(0, 0, 40, 5, bike);
  const wr = mkWheel(-28), wf = mkWheel(28);
  el('path', { d: 'M -28 -20 L -4 -26 L 22 -54 L 14 -34 L -4 -26 M -4 -26 L -8 -40 M 22 -54 L 28 -20 M 16 -60 L 28 -62', fill: 'none', stroke: pal.coral, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, bike);
  el('rect', { x: -16, y: -44, width: 16, height: 5, rx: 2.5, fill: pal.ink }, bike);
  const b = k.buddy({ x: -6, y: -32, scale: 0.72, parent: bike });
  b.g.firstChild.setAttribute('display', 'none');
  el('line', { x1: 22, y1: -56, x2: 30, y2: -64, stroke: pal.ink, 'stroke-width': 4, 'stroke-linecap': 'round' }, bike);
  const P = (t) => seg(t, 0.2, 3.9);
  const X = (t) => lerp(50, 325, Math.pow(P(t), 2.0));
  return {
    update(t) {
      const x = X(t), p = P(t);
      const dist = (x - 50) / Math.cos((ang * Math.PI) / 180);
      tf(bike, x, gy(x) - 1, ang);
      const spin = (dist / 20) * (180 / Math.PI);
      wr.setAttribute('transform', `rotate(${spin})`); wf.setAttribute('transform', `rotate(${spin})`);
      const v = Math.pow(p, 1.0) * 2; // 速さの目安（微分に比例）
      b.pose({ walk: dist / 7, armR: 52, armL: 52, lean: 4 + 10 * p, look: 0.6, mood: p > 0.6 ? 'grin' : 'smile', squash: 1 });
      tf(streak, x - 24, gy(x) - 4, ang);
      streak.setAttribute('opacity', clamp((p - 0.25) * 1.6));
    }
  };
}
