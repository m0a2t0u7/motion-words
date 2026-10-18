// cut across：公園のまわりの道（点線＝遠回り）を通らず、2人が公園の芝生をななめに横切って近道する（例文 We cut across the park to save time.）
import { seg, lerp, easeInOut } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '遠回りの道'], [1.2, '公園を横切る'], [3.6, '早く着いた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 300, mood: 'outdoor' });
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#E3E8EE' });
  // 上から見た公園
  el('rect', { x: 70, y: 40, width: 250, height: 190, rx: 10, fill: '#BFE3A8', stroke: '#fff', 'stroke-width': 6 });
  [[120, 80], [270, 90], [130, 190], [250, 200], [200, 70]].forEach(([x, y]) => { el('circle', { cx: x, cy: y, r: 16, fill: '#7FD3A0' }); el('circle', { cx: x - 4, cy: y - 4, r: 6, fill: '#9BE0B5' }); });
  el('ellipse', { cx: 200, cy: 140, rx: 34, ry: 18, fill: pal.water });
  // 遠回りの道（点線）
  el('path', { d: 'M 50 262 L 50 20 L 350 20', stroke: pal.sub, 'stroke-width': 3, fill: 'none', 'stroke-dasharray': '8 8' });
  // スタートと家
  el('circle', { cx: 50, cy: 262, r: 8, fill: pal.blue });
  const home = g({}); tf(home, 352, 22);
  el('rect', { x: -14, y: -6, width: 28, height: 20, fill: '#FBE9DC', stroke: pal.coralDark, 'stroke-width': 2 }, home);
  el('path', { d: 'M -18 -6 L 0 -20 L 18 -6 Z', fill: pal.coral }, home);
  const trail = el('path', { d: 'M 50 262 L 352 30', stroke: pal.red, 'stroke-width': 3, fill: 'none', 'stroke-dasharray': '2 7', 'stroke-linecap': 'round' });
  const S = 0.34;
  const A = k.buddy({ scale: S }), B = k.buddy({ scale: S, color: pal.coral, dark: pal.coralDark });
  const L = Math.hypot(302, 232);
  trail.setAttribute('stroke-dasharray', `2 7`);
  const clipR = el('rect', { x: 0, y: 0, width: 0, height: 300 });
  trail.setAttribute('clip-path', k.clip((cp) => cp.appendChild(clipR)));
  return {
    update(t) {
      const q = easeInOut(seg(t, 0.6, 3.8));
      [[A, 0], [B, -0.06]].forEach(([b, off]) => {
        const u = Math.max(0, Math.min(1, q + off));
        const x = lerp(50, 352, u) + (off ? -10 : 6), y = lerp(262, 40, u) + (off ? 6 : 0);
        const w = u * L * 0.25;
        const moving = t > 0.6 && t < 3.9;
        b.pose({ x, y, walk: moving ? w : 0, armL: 8 + (moving ? 16 * Math.sin(w) : 0), armR: 8 - (moving ? 16 * Math.sin(w) : 0), lean: moving ? 4 : 0, look: 0.6, mood: t > 3.8 ? 'grin' : 'smile' });
      });
      clipR.setAttribute('width', lerp(50, 352, q));
    }
  };
}
