// look up to：小さな選手たちが、トロフィーを掲げる先輩選手を見上げ、目を輝かせてまねする（例文 The young players look up to him.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { faceAt } from './look-over.js';
import { STAR } from './agree.js';

export const meta = { duration: 4.2, beats: [[0, '先輩とちびっこ'], [1.4, '見上げる'], [3.0, 'あこがれる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236 });
  el('rect', { x: 0, y: 236, width: 400, height: 64, fill: '#BFE5B5' });
  el('rect', { x: 0, y: 236, width: 400, height: 3, fill: '#A5D69A' });
  // ゴール
  el('path', { d: 'M 300 236 L 300 150 L 392 150 L 392 236', fill: 'none', stroke: '#fff', 'stroke-width': 6 });
  for (let x = 310; x < 392; x += 12) el('line', { x1: x, y1: 150, x2: x, y2: 236, stroke: '#fff', 'stroke-width': 1.2, opacity: 0.7 });
  const him = k.buddy({ x: 210, y: 240, scale: 1.15, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const cup = g({});
  el('path', { d: 'M -12 -26 L 12 -26 Q 12 -6 0 -4 Q -12 -6 -12 -26 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, cup);
  el('rect', { x: -3, y: -5, width: 6, height: 7, fill: pal.yellowDark }, cup);
  el('rect', { x: -8, y: 2, width: 16, height: 5, rx: 2, fill: pal.yellowDark }, cup);
  const kids = [[70, pal.mint, pal.mintDark], [120, pal.blue, pal.blueDark]].map(([x, c, d]) => k.buddy({ x, y: 246, scale: 0.55, color: c, dark: d }));
  const stars = [0, 1, 2].map(() => el('path', { d: STAR, fill: pal.yellow }));
  return {
    update(t) {
      const up = easeOut(seg(t, 0.4, 0.9));
      him.pose({ armL: 8 + 165 * up, armR: 8 + 30 * up, mood: 'grin', lift: 3 * hump(seg(t, 0.4, 0.8)), look: -0.3 });
      const hx = 210 + 27 * 1.15 + Math.sin(-(8 + 165 * up) * Math.PI / 180) * 30, hy = 240 - 66 - Math.cos((8 + 165 * up) * Math.PI / 180) * 30;
      tf(cup, hx + 2, hy - 2 * 1.15);
      kids.forEach((c, i) => {
        const g2 = seg(t, 1.0 + i * 0.2, 1.4 + i * 0.2), cp = seg(t, 2.8 + i * 0.2, 3.3 + i * 0.2);
        c.pose({ lean: -10 * easeInOut(g2), mood: t > 1.3 ? 'grin' : 'smile', armL: 8 + 160 * easeOut(cp), armR: 8 + 25 * cp, lift: 6 * Math.abs(Math.sin((t - 2.0) * 7)) * seg(t, 2.0, 2.2) * (1 - seg(t, 2.6, 2.8)) });
        faceAt(c, 3 * g2, -9 * easeInOut(g2));
      });
      stars.forEach((s, i) => { const p = ((t - 1.6) * 0.8 + i / 3) % 1; tf(s, 95 + (i - 1) * 40 + Math.sin(p * 6 + i) * 4, 150 - p * 30, p * 90, 0.5 + 0.3 * Math.sin(p * Math.PI)); s.setAttribute('opacity', t > 1.6 ? Math.sin(p * Math.PI) : 0); });
    }
  };
}
