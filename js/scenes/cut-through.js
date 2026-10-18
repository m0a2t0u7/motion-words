// cut through：大通りを回らず、建物と建物のあいだの細い路地を通り抜けて、向こう側の家へ帰る（例文 He cut through the alley to get home.）
import { seg, lerp, easeInOut } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '路地の入口'], [1.6, '路地を抜ける'], [3.6, '家に着いた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 300, mood: 'evening' });
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#E3E8EE' });
  // 上から見た街区：2つの大きな建物、そのあいだに細い路地
  el('rect', { x: 40, y: 30, width: 150, height: 240, rx: 4, fill: '#C9B6A4' });
  el('rect', { x: 214, y: 30, width: 150, height: 240, rx: 4, fill: '#B8C4D4' });
  for (let i = 0; i < 4; i++) { el('rect', { x: 60, y: 50 + i * 54, width: 110, height: 30, rx: 3, fill: '#fff', opacity: 0.35 }); el('rect', { x: 234, y: 50 + i * 54, width: 110, height: 30, rx: 3, fill: '#fff', opacity: 0.35 }); }
  el('rect', { x: 190, y: 30, width: 24, height: 240, fill: '#9AA6B6' });
  // 遠回りの大通り（点線）
  el('path', { d: 'M 202 286 L 20 286 L 20 14 L 202 14', stroke: pal.sub, 'stroke-width': 3, fill: 'none', 'stroke-dasharray': '8 8' });
  // 家（路地の出口の先）
  const home = g({}); tf(home, 202, 14);
  el('rect', { x: -14, y: -4, width: 28, height: 16, fill: '#FBE9DC', stroke: pal.coralDark, 'stroke-width': 2 });
  el('rect', { x: 188, y: 10, width: 28, height: 16, fill: '#FBE9DC', stroke: pal.coralDark, 'stroke-width': 2 });
  el('path', { d: 'M 184 10 L 202 -2 L 220 10 Z', fill: pal.coral });
  const lamp = el('circle', { cx: 210, cy: 18, r: 3, fill: pal.yellow, opacity: 0 });
  const S = 0.3;
  const b = k.buddy({ scale: S });
  return {
    update(t) {
      const q = easeInOut(seg(t, 0.5, 3.7));
      const y = lerp(290, 44, q);
      const moving = t > 0.5 && t < 3.75, w = (290 - y) * 0.35;
      b.pose({ x: 202, y, walk: moving ? w : 0, armL: moving ? 8 + 14 * Math.sin(w) : 8, armR: moving ? 8 - 14 * Math.sin(w) : 30, look: 0.4, mood: t > 3.7 ? 'grin' : 'smile', facing: 1 });
      lamp.setAttribute('opacity', seg(t, 3.7, 3.9));
    }
  };
}
