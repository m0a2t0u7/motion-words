// hand in hand：浜辺を、2人が手をつないで並んで歩く（例文 The couple walked hand in hand on the beach.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { hp, reach } from './dig.js';
import { heart } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '浜辺'], [1.0, '手をつなぐ'], [3.4, 'つないで歩く']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  el('circle', { cx: 330, cy: 60, r: 22, fill: '#FFE08A' });
  el('rect', { x: 0, y: 150, width: 400, height: 60, fill: '#8FD3F4' });
  const wave = el('path', { d: '', fill: '#BDE6FA' });
  el('rect', { x: 0, y: 206, width: 400, height: 94, fill: '#F6E2B8' });
  const foam = el('path', { d: '', fill: '#fff', opacity: 0.7 });
  // 貝殻（止まっている）
  [[70, 268], [250, 282], [350, 262]].forEach(([x, y]) => el('path', { d: `M ${x - 6} ${y} Q ${x} ${y - 10} ${x + 6} ${y} Z`, fill: '#F7C9B8' }));
  const c = k.buddy({ x: 60, y: 252, facing: 1, color: pal.coral, dark: pal.coralDark, scale: 0.95 });
  const b = k.buddy({ x: 134, y: 256, facing: 1 });
  const grip = el('circle', { r: 7, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.5 });
  const hearts = [0, 1].map(() => { const h = g({}); heart(k, h, pal.red); return h; });
  return {
    update(t) {
      const sw = Math.sin(t * 1.6);
      wave.setAttribute('d', `M 0 196 Q 50 ${190 + 4 * sw} 100 196 T 200 196 T 300 196 T 400 196 V 210 H 0 Z`);
      foam.setAttribute('d', `M 0 ${207 + 2 * sw} Q 100 ${203 + 2 * sw} 200 ${207 + 2 * sw} T 400 ${207 + 2 * sw} V 211 H 0 Z`);
      const xf = (tt) => lerp(50, 230, easeInOut(seg(tt, 0.9, 4.3)));
      const wc = walkTo(xf, t, 60, 1), wb = walkTo((tt) => xf(tt) + 74, t, 134, 1);
      P(c, { ...wc, y: 252, look: 0.6, blink: blinkAt(t, 1), mood: 'grin' });
      P(b, { ...wb, y: 256, look: -0.4, blink: blinkAt(t), mood: 'grin' });
      // つなぐ前（0〜0.9秒）：手を伸ばして、真ん中で握る
      const join = easeInOut(seg(t, 0.2, 0.8));
      const midX = (c.state.x * 1 + b.state.x) / 2 + 2, midY = 214 + 2 * Math.sin(wb.walk);
      const aC = reach(c, 0.95, 'R', midX, midY), aB = reach(b, 1, 'L', midX, midY);
      P(c, { ...wc, y: 252, look: 0.6, blink: blinkAt(t, 1), mood: 'grin', armR: lerp(10, aC, join) });
      P(b, { ...wb, y: 256, look: -0.4, blink: blinkAt(t), mood: 'grin', armL: lerp(10, aB, join) });
      const h = hp(b, 1, 'L');
      tf(grip, h.x, h.y, 0, 1);
      grip.setAttribute('opacity', join > 0.95 ? 1 : 0);
      hearts.forEach((hh, i) => { const q = ((t - 1.2 + i * 0.9) % 1.8) / 1.8; tf(hh, midX + 10 * Math.sin(q * 6), 150 - q * 40, 0, t > 1.2 ? 1 : 0.001); hh.setAttribute('opacity', t > 1.2 ? 1 - q : 0); });
    }
  };
}
