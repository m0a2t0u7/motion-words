// coat：雪の中で震えるまめが、厚手の長いコートを着てあたたかくなる（例文 I need a warm coat for the winter.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { top, flat } from './shirt.js';
import { hp } from './dig.js';

export const meta = { duration: 4.2, beats: [[0, '冬は寒い'], [1.3, 'コートを着る'], [3.0, 'あたたかい']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#DCE3EC', opacity: 0.55 });
  [[40, 0.9], [330, 0.75]].forEach(([x, s]) => {
    const tr = g({}); tf(tr, x, FY, 0, s);
    el('path', { d: 'M 0 -130 L -42 -40 L 42 -40 Z M 0 -100 L -50 -4 L 50 -4 Z', fill: '#7FB59A' }, tr);
    el('path', { d: 'M 0 -130 L -22 -84 L 22 -84 Z M -36 -40 L 0 -60 L 36 -40 Z', fill: '#fff' }, tr);
    el('rect', { x: -5, y: -4, width: 10, height: 6, fill: pal.woodDark }, tr);
  });
  el('path', { d: `M 0 ${FY} Q 200 ${FY - 14} 400 ${FY} V 300 H 0 Z`, fill: '#fff' });
  const flakes = Array.from({ length: 16 }, () => el('circle', { r: 2.6, fill: '#fff', stroke: '#D5DEE9', 'stroke-width': 0.8 }));
  const COL = '#9A6A47', DK = '#6E4A30';
  const S = 1.08, b = k.buddy({ x: 196, y: FY, scale: S });
  const tp = top(k, b, 'coat', COL, DK, { sleeve: COL });
  const held = flat(k, 'coat', COL, DK, null, false);
  const warm = [0, 1, 2].map(() => el('path', { d: 'M 0 0 q 5 -6 0 -12 q -5 -6 0 -12', fill: 'none', stroke: pal.coral, 'stroke-width': 3, 'stroke-linecap': 'round' }));
  return {
    update(t) {
      flakes.forEach((f, i) => { const p = (t * 0.22 + i * 0.0627) % 1; k.set(f, { cx: (i * 53) % 400 + 8 * Math.sin(t * 1.5 + i), cy: -6 + p * (FY + 10) }); });
      const lift = easeInOut(seg(t, 0.6, 1.2)), on = easeInOut(seg(t, 1.3, 2.3)), cold = 1 - seg(t, 2.2, 2.6);
      const armR = lerp(lerp(30, 150, lift), 20, on), armL = lerp(14, 150, lift) * (1 - on) + 16 * on;
      b.pose({ x: 196 + Math.sin(t * 55) * 1.5 * cold, armR: t < 0.6 ? 30 + 6 * Math.sin(t * 40) : armR, armL, squash: 1 - 0.05 * cold + 0.02 * hump(seg(t, 2.6, 3.2)),
        mood: cold > 0.5 ? 'sad' : 'grin', blink: t > 2.7 ? 0.85 : 0, look: 0 });
      const h = hp(b, S, 'R', 28);
      tf(held, h.x, h.y - 8, lerp(0, 180, lift), S * 0.9);
      held.setAttribute('opacity', t < 1.3 ? 1 : 0);
      tp.show(t >= 1.3, on > 0.6);
      tp.slide(lerp(-62, 0, on));
      warm.forEach((w, i) => { const q = seg(t, 2.7 + i * 0.15, 4.0); tf(w, 196 + (i - 1) * 46, FY - 108 - 14 * q); w.setAttribute('opacity', hump(q) * 0.9); });
    }
  };
}
