// bridge：川の上に架かったアーチ橋を、2人で歩いて向こう岸まで渡る（例文 We walked across the bridge.）
import { seg, lerp, easeInOut } from '../ease.js';
import { P, blinkAt, walkTo } from './bag.js';
import { tree } from './run-after.js';

export const meta = { duration: 4.4, beats: [[0, 'こちら岸'], [1.2, '橋を渡る'], [3.6, '向こう岸へ']] };

export function create(k) {
  const { el, tf, pal } = k, DY = 170;
  k.backdrop({ floorY: 300 });
  el('rect', { x: 0, y: 190, width: 400, height: 110, fill: '#8FD3F4' });
  const waves = [0, 1, 2, 3].map((i) => el('path', { d: 'M 0 0 q 6 -4 12 0 t 12 0', stroke: '#fff', 'stroke-width': 2, fill: 'none', opacity: 0.7 }));
  // 両岸
  el('path', { d: `M 0 ${DY} L 70 ${DY} L 90 300 L 0 300 Z`, fill: '#9ED3B2' });
  el('path', { d: `M 400 ${DY} L 330 ${DY} L 310 300 L 400 300 Z`, fill: '#9ED3B2' });
  tree(k, 30, DY, 0.6); tree(k, 375, DY, 0.6);
  // アーチ橋
  el('path', { d: `M 70 ${DY + 8} Q 200 ${DY + 110} 330 ${DY + 8} L 330 ${DY + 20} Q 200 ${DY + 118} 70 ${DY + 20} Z`, fill: pal.woodDark, opacity: 0 });
  el('path', { d: `M 80 ${DY + 12} Q 200 ${DY + 100} 320 ${DY + 12}`, stroke: '#C98D5B', 'stroke-width': 8, fill: 'none' });
  el('path', { d: `M 80 ${DY + 12} Q 200 ${DY - 0} 320 ${DY + 12}`, stroke: 'none', fill: 'none' });
  el('rect', { x: 60, y: DY, width: 280, height: 10, fill: '#C98D5B' });
  for (let x = 110; x <= 290; x += 30) el('line', { x1: x, y1: DY + 10, x2: x, y2: DY + 10 + 28 * (1 - Math.pow((x - 200) / 120, 2)), stroke: '#C98D5B', 'stroke-width': 3 });
  const a = k.buddy({ x: 20, y: DY, scale: 0.8 });
  const c = k.buddy({ x: -20, y: DY, scale: 0.75, color: pal.coral, dark: pal.coralDark });
  // 手すり（人物の手前）
  el('rect', { x: 60, y: DY - 26, width: 280, height: 4, rx: 2, fill: '#E3B77E' });
  for (let x = 64; x <= 336; x += 24) el('rect', { x, y: DY - 26, width: 3, height: 26, fill: '#E3B77E' });
  const xa = (t) => lerp(20, 370, easeInOut(seg(t, 0.1, 4.1))), xc = (t) => xa(t) - 40;
  return {
    update(t) {
      const wa = walkTo(xa, t, 20), wc = walkTo(xc, t, -20);
      P(a, { x: wa.x, y: DY, walk: wa.walk, armL: wa.armL, armR: wa.armR, lean: wa.lean, look: 0.6, blink: blinkAt(t), mood: t > 3.6 ? 'grin' : 'smile' });
      P(c, { x: wc.x, y: DY, walk: wc.walk, armL: wc.armL, armR: wc.armR, lean: wc.lean, look: 0.6, blink: blinkAt(t, 1), mood: 'smile' });
      waves.forEach((w, i) => tf(w, (i * 110 + t * 20) % 420 - 20, 220 + (i % 2) * 40));
    }
  };
}
