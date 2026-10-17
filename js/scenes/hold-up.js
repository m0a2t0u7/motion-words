// hold up：まめがカードを頭の上にかかげる（例文 She held up the card above her head.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 3.4, beats: [[0, 'カードを持つ'], [0.9, '持ち上げる'], [2.0, '頭の上にかかげる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 248, mood: 'indoor' });
  const S = 1.2, X = 200;
  const b = k.buddy({ x: X, y: FY, scale: S });
  const card = g({});
  el('rect', { x: -44, y: -34, width: 88, height: 68, rx: 8, fill: '#fff', stroke: pal.blueDark, 'stroke-width': 4 }, card);
  el('path', { d: 'M 0 -22 L 6.5 -7 L 22 -6 L 10 4 L 14 20 L 0 11 L -14 20 L -10 4 L -22 -6 L -6.5 -7 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, card);
  const rays = [0, 1, 2, 3, 4].map((i) => el('line', { stroke: pal.yellowDark, 'stroke-width': 3, 'stroke-linecap': 'round' }));
  return {
    update(t) {
      const up = easeInOut(seg(t, 0.8, 1.9));
      const a = lerp(40, 172, up);
      b.pose({ armL: a, armR: a, lean: lerp(0, -4, up), look: 0, mood: t > 1.9 ? 'grin' : 'smile', squash: 1 + 0.02 * wobble(seg(t, 1.9, 2.8), 2, 5) });
      // 両手の間にカード
      const hl = b.handPos('L'), hr = b.handPos('R');
      const cx = (hl.x + hr.x) / 2, cy = Math.min(hl.y, hr.y) - 8 * up - (1 - up) * 0 + 6;
      tf(card, cx, (hl.y + hr.y) / 2 - 28 * (1 - up) * 0 - 6, 0, 0.8 + 0.1 * up, 0.8 + 0.1 * up);
      const sw = seg(t, 1.9, 2.5);
      rays.forEach((r, i) => {
        const ang = (-90 + (i - 2) * 38) * Math.PI / 180;
        const cx2 = cx, cy2 = (hl.y + hr.y) / 2 - 6;
        r.setAttribute('x1', cx2 + Math.cos(ang) * 66); r.setAttribute('y1', cy2 + Math.sin(ang) * 58);
        r.setAttribute('x2', cx2 + Math.cos(ang) * (66 + 14 * sw)); r.setAttribute('y2', cy2 + Math.sin(ang) * (58 + 14 * sw));
        r.setAttribute('opacity', sw > 0 ? 1 : 0);
      });
    }
  };
}
