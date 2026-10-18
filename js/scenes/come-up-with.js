// come up with：腕を組むように考え込み、頭の上に電球がぱっと灯って、いい案を思いつく（例文 She came up with a great idea.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, '考えている'], [1.9, 'ひらめいた'], [3.2, 'いい案']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 290, y: 60, width: 76, height: 60, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('rect', { x: 40, y: 150, width: 60, height: 86, rx: 6, fill: pal.wood });
  el('rect', { x: 46, y: 160, width: 48, height: 30, rx: 3, fill: '#F1D9BC' });
  el('rect', { x: 46, y: 198, width: 48, height: 30, rx: 3, fill: '#F1D9BC' });
  k.shadow(70, FY, 34, 4);
  const S = 1.05;
  const b = k.buddy({ x: 200, y: FY, scale: S });
  const dots = [0, 1, 2].map((i) => el('circle', { cx: 232 + i * 12, cy: 108 - i * 6, r: 3.5, fill: pal.sub }));
  const bulb = g({});
  const rays = g({}, bulb);
  for (let i = 0; i < 8; i++) { const a = i * 45 * Math.PI / 180; el('line', { x1: Math.sin(a) * 24, y1: -Math.cos(a) * 24 - 4, x2: Math.sin(a) * 34, y2: -Math.cos(a) * 34 - 4, stroke: pal.yellowDark, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, rays); }
  const glass = el('circle', { cx: 0, cy: -4, r: 16, fill: '#FFF3C4', stroke: pal.yellowDark, 'stroke-width': 2.5 }, bulb);
  el('path', { d: 'M -5 4 L -2 -6 L 2 -2 L 5 -8', stroke: pal.yellowDark, 'stroke-width': 2, fill: 'none' }, bulb);
  el('rect', { x: -7, y: 11, width: 14, height: 10, rx: 2, fill: '#B9C3D0' }, bulb);
  el('line', { x1: -7, y1: 15, x2: 7, y2: 15, stroke: pal.sub, 'stroke-width': 1.5 }, bulb);
  return {
    update(t) {
      const thinking = t < 1.9;
      const tilt = Math.sin(t * 2.2) * 3;
      const pop = backOut(seg(t, 1.9, 2.25)), jump = hump(seg(t, 2.15, 2.6));
      b.pose({
        armR: thinking ? lerp(10, 150, easeInOut(seg(t, 0.2, 0.6))) : lerp(150, 172, easeOut(seg(t, 2.1, 2.4))),
        armL: thinking ? lerp(10, 60, easeInOut(seg(t, 0.2, 0.6))) : lerp(60, 30, easeOut(seg(t, 2.1, 2.5))),
        lean: thinking ? tilt - 3 : -4 * jump, look: thinking ? 0.4 : 0.2, lift: 18 * jump, squash: 1 - 0.1 * hump(seg(t, 2.0, 2.18)) + 0.06 * jump - 0.08 * hump(seg(t, 2.55, 2.75)),
        mood: thinking ? 'flat' : 'grin', blink: t > 0.9 && t < 1.0 ? 1 : 0
      });
      dots.forEach((d, i) => d.setAttribute('opacity', thinking ? seg(t, 0.6 + i * 0.3, 0.75 + i * 0.3) : 0));
      tf(bulb, 200, 88 - 18 * jump + 3 * Math.sin(t * 3) * seg(t, 2.6, 3), wobble(seg(t, 2.1, 3), 2, 4) * 8, Math.max(0.01, pop));
      bulb.setAttribute('opacity', seg(t, 1.9, 1.95));
      const on = seg(t, 2.1, 2.3);
      k.set(glass, { fill: on > 0.5 ? pal.yellow : '#FFF3C4' });
      rays.setAttribute('opacity', on * (0.75 + 0.25 * Math.sin(t * 10)));
      k.tf(rays, 0, 0, 0, 0.8 + 0.2 * on);
    }
  };
}
