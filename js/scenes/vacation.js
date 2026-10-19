// vacation：休みの日、浮き輪とビーチバッグを持った2人が、日差しの中を海辺へ向かって歩いていく（例文 We're going to the beach on vacation.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { P, blinkAt, walk, path, held } from './vehicle.js';

export const meta = { duration: 4.4, beats: [[0, 'お休みだ'], [1.4, '海へ向かう'], [3.4, 'もうすぐビーチ']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = 236;
  k.backdrop({ floorY: FY });
  el('circle', { cx: 340, cy: 50, r: 22, fill: '#FFD57A' });
  el('rect', { x: 0, y: 170, width: 400, height: 66, fill: '#7CC7EC' });
  const wv = [0, 1, 2, 3].map(() => el('path', { d: 'M 0 0 q 10 -5 20 0 q 10 5 20 0', stroke: '#fff', 'stroke-width': 2.5, fill: 'none' }));
  el('path', { d: `M 0 ${FY - 30} Q 200 ${FY - 50} 400 ${FY - 34} L 400 300 L 0 300 Z`, fill: '#F3DEB0' });
  // パラソル
  el('line', { x1: 320, y1: 150, x2: 316, y2: FY - 10, stroke: pal.ink, 'stroke-width': 3 });
  el('path', { d: 'M 280 160 Q 320 110 360 160 Z', fill: pal.red }); el('path', { d: 'M 306 152 Q 320 120 334 152 Z', fill: '#fff' });
  const a = k.buddy({ x: -40, y: FY + 20, scale: 0.85 }), b = k.buddy({ x: -100, y: FY + 20, scale: 0.85, color: pal.coral, dark: pal.coralDark });
  const ring = g({}); el('circle', { r: 16, fill: 'none', stroke: pal.coral, 'stroke-width': 9 }, ring); el('path', { d: 'M -16 0 A 16 16 0 0 1 0 -16', stroke: '#fff', 'stroke-width': 9, fill: 'none' }, ring);
  const bag = g({}); el('path', { d: 'M -8 0 Q 0 -12 8 0', stroke: pal.woodDark, 'stroke-width': 2.5, fill: 'none' }, bag); el('path', { d: 'M -14 0 L 14 0 L 10 24 L -10 24 Z', fill: pal.yellow }, bag);
  const XA = path([[0, -40], [3.8, 230]]), XB = path([[0.2, -110], [4.0, 160]]);
  return {
    update(t) {
      walk(a, XA, t, { mood: 'grin', look: 0.6, blink: blinkAt(t) });
      a.pose({ armR: 20 }); held(k, a, 0.85, ring, 'R', 0, 40);
      walk(b, XB, t, { mood: 'grin', look: 0.6, blink: blinkAt(t, 1) });
      b.pose({ armR: 10 }); held(k, b, 0.85, bag, 'R', 0, 30);
      wv.forEach((w, i) => k.tf(w, (i * 110 + t * 20) % 440 - 30, 186 + (i % 2) * 18));
      void lerp; void easeInOut; void hump;
    }
  };
}
