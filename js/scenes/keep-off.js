// keep off：芝生に「入らないで」の札。踏み入れかけた足を戻し、芝生の外にとどまる（例文 Please keep off the grass.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { path, walk, sign } from './queue-up.js';

export const meta = { duration: 4.0, beats: [[0, '芝生の手前'], [1.7, '足を戻す'], [3.4, '入らない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  [[70, 34], [340, 40]].forEach(([x, r]) => { el('rect', { x: x - 5, y: FY - 70, width: 10, height: 70, fill: pal.woodDark }); el('circle', { cx: x, cy: FY - 86, r, fill: '#9ED9B0' }); });
  el('rect', { x: 200, y: FY - 6, width: 200, height: 40, rx: 6, fill: '#8FD98F' });
  for (let x = 204; x < 400; x += 9) el('path', { d: `M ${x} ${FY - 4} l 3 -9 l 3 9`, fill: '#6CC56C' });
  const sg = sign(k, 300, FY, 'KEEP OFF', { w: 82, h: 30, fs: 12, post: 40 });
  const S = 0.85;
  const b = k.buddy({ x: 40, y: FY + 6, scale: S });
  const xf = path([[0, 40], [1.4, 172], [2.4, 172], [3.2, 140]]);
  return {
    update(t) {
      const p = walk(b, xf, t, { y: FY + 6, look: 0.6, mood: t < 1.5 ? 'smile' : t < 2.4 ? 'open' : 'smile' });
      // 片足を芝の上へ出しかけて戻す
      const step = hump(seg(t, 1.4, 2.2));
      if (t > 1.4 && t < 2.4) {
        b.pose({ walk: -0.9 * step, lean: -5 * step, look: 0.8 });
        const legs = b.g.children[1].children;
        legs[1].setAttribute('transform', `translate(12 ${(-14 - 6 * step).toFixed(1)}) rotate(${(-40 * step).toFixed(1)})`);
      }
      void tf; void g; void lerp; void easeInOut; void p;
    }
  };
}
