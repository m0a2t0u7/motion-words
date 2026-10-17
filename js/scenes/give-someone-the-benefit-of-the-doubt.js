// give someone the benefit of the doubt：割れたカップのそばの相手を疑うが、「やってない」を聞いて、とりあえず信じて肩をたたく（I'll give him the benefit of the doubt.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '疑う'], [1.6, '考える'], [3.2, '信じる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 242, mood: 'indoor' });
  el('rect', { x: 30, y: 46, width: 70, height: 60, rx: 8, fill: '#DDEFFA' });
  el('line', { x1: 65, y1: 46, x2: 65, y2: 106, stroke: '#fff', 'stroke-width': 4 });
  el('ellipse', { cx: 210, cy: FY + 16, rx: 160, ry: 10, fill: '#EDE5D8' });
  // 割れたカップとこぼれたコーヒー
  const cup = g({});
  el('ellipse', { cx: 0, cy: 2, rx: 30, ry: 6, fill: pal.coffee, opacity: 0.55 }, cup);
  el('path', { d: 'M -16 -2 L -8 -16 L 0 -2 Z', fill: '#fff', stroke: '#CBD3DF', 'stroke-width': 2, 'stroke-linejoin': 'round' }, cup);
  el('path', { d: 'M 6 0 L 14 -14 L 22 0 Z', fill: '#fff', stroke: '#CBD3DF', 'stroke-width': 2, 'stroke-linejoin': 'round' }, cup);
  el('path', { d: 'M -30 0 L -24 -5 L -20 0 Z', fill: '#fff', stroke: '#CBD3DF', 'stroke-width': 2 }, cup);
  tf(cup, 232, FY + 4);
  const mint = k.buddy({ x: 100, y: FY });
  const coral = k.buddy({ x: 318, y: FY, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const q = k.text(0, 0, '?', { 'font-size': 30, fill: pal.red });
  const sweat = el('path', { d: 'M 0 -7 Q 5 0 0 5 Q -5 0 0 -7 Z', fill: pal.water });
  const heart = el('path', { d: 'M 0 8 C -14 -2 -10 -14 0 -7 C 10 -14 14 -2 0 8 Z', fill: pal.red });
  return {
    update(t) {
      const walk = seg(t, 1.9, 2.8);
      const mx = lerp(100, 218, easeInOut(walk));
      const moving = walk > 0 && walk < 1;
      const pat = seg(t, 2.9, 3.8);
      const think = hump(seg(t, 1.0, 2.0));
      const point = hump(seg(t, 0, 1.2));
      mint.pose({
        x: mx, walk: moving ? t * 9 : 0,
        lean: lerp(-6, 0, seg(t, 1.8, 2.5)) + 4 * Math.sin(t * 7) * 0,
        armR: t < 1.9 ? lerp(8, 95, point) * (1 - think) + 150 * think : (t < 2.9 ? lerp(60, 8, 0) : lerp(8, 85, easeOut(pat)) + (pat > 0.4 ? 6 * Math.sin(t * 14) : 0)),
        armL: 10 + 20 * Math.sin(walk * Math.PI * 4) * (moving ? 1 : 0),
        look: 0.6, mood: t < 1.9 ? 'flat' : 'smile', blink: 0
      });
      const relief = easeOut(seg(t, 3.0, 3.6));
      coral.pose({
        armL: lerp(105 + 10 * Math.sin(t * 9), 8, relief), armR: lerp(105 - 10 * Math.sin(t * 9), 8, relief),
        lean: lerp(4, 0, relief), squash: 1 - 0.03 * hump(seg(t, 3.0, 3.4)) + (pat > 0.4 ? 0.01 * Math.sin(t * 14) : 0),
        look: 0.6, mood: t < 3.0 ? 'sad' : 'smile', blink: 0
      });
      const showQ = t < 2.0 ? easeOut(seg(t, 0.2, 0.5)) : 1 - seg(t, 2.0, 2.3);
      tf(q, 100 + 14, FY - 112 - 4 * Math.sin(t * 5), 8 * Math.sin(t * 4), showQ);
      const sw = (t * 1.3) % 1;
      tf(sweat, 318 - 30, FY - 96 + 22 * sw, 0, 1);
      sweat.setAttribute('opacity', t < 3.0 ? 1 - sw * 0.4 : 0);
      tf(heart, 240, FY - 124 - 6 * easeOut(seg(t, 3.4, 4.0)), 0, easeOut(seg(t, 3.3, 3.7)) * (1 + 0.08 * Math.sin(t * 10)));
    }
  };
}
