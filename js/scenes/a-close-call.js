// a close call：すぐ横に植木鉢が落ちて割れる。ぶつからず、ほっと胸をなでおろす（That was a close call.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '歩いている'], [1.3, '真横に落下'], [3.0, 'ほっとする']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  // ビルの壁とベランダ
  el('rect', { x: 250, y: 0, width: 150, height: 150, fill: '#F2E7DA' });
  el('rect', { x: 230, y: 40, width: 100, height: 10, rx: 3, fill: pal.woodDark });
  const potX = 262;
  const pot = g({});
  el('path', { d: 'M -14 -10 L 14 -10 L 10 14 L -10 14 Z', fill: pal.coral }, pot);
  el('rect', { x: -16, y: -16, width: 32, height: 8, rx: 3, fill: pal.coralDark }, pot);
  el('path', { d: 'M 0 -16 Q -4 -34 -16 -34 Q -12 -22 0 -16 Z M 0 -16 Q 6 -38 18 -32 Q 12 -20 0 -16 Z', fill: pal.green }, pot);
  const rest = g({});
  el('path', { d: 'M -14 14 L -10 -2 L -4 4 L 2 -4 L 8 3 L 12 -2 L 14 14 Z', fill: pal.coral }, rest);
  el('ellipse', { cx: -2, cy: 14, rx: 26, ry: 6, fill: pal.coffee, opacity: 0.8 }, rest);
  tf(rest, potX, FY - 12);
  const shards = [0, 1, 2, 3, 4, 5].map((i) => el('polygon', { points: '0,0 7,2 3,7', fill: i % 2 ? pal.coral : pal.coralDark }));
  const b = k.buddy({ x: 90, y: FY, scale: 1.0 });
  const sweat = el('path', { d: 'M 0 -7 Q 5 0 0 5 Q -5 0 0 -7 Z', fill: pal.water });
  return {
    update(t) {
      const walk = t < 1.1;
      const bx = walk ? lerp(70, 168, t / 1.1) : 168;
      const imp = 1.45;
      const fall = easeIn(seg(t, 0.85, imp));
      pot.setAttribute('opacity', t < imp && t > 0.85 ? 1 : t <= 0.85 ? 1 : 0);
      tf(pot, potX, lerp(33, FY - 14, fall), fall * 30);
      rest.setAttribute('opacity', t >= imp ? 1 : 0);
      const sp = seg(t, imp, imp + 0.9);
      shards.forEach((s, i) => {
        const a = (i / 6) * Math.PI * 0.9 + 0.2;
        const vx = Math.cos(a) * (i % 2 ? 60 : 40) * (i < 3 ? -1 : 1) * 0.8, vy = -120 - i * 12;
        k.set(s, { transform: 'translate(' + (potX + vx * sp).toFixed(1) + ' ' + (FY - 12 + vy * sp + 260 * sp * sp).toFixed(1) + ') rotate(' + sp * 400 + ')', opacity: sp > 0 && sp < 1 ? 1 : 0 });
      });
      const shock = easeOut(seg(t, imp, imp + 0.15));
      const relief = easeOut(seg(t, 2.4, 2.9));
      const wipe = Math.sin(seg(t, 2.4, 3.4) * Math.PI * 4) * 8 * hump(seg(t, 2.4, 3.4));
      b.pose({
        x: bx, walk: walk ? t * 9 : 0, facing: 1,
        armL: walk ? 8 + Math.sin(t * 9) * 18 : lerp(70, 8, relief),
        armR: walk ? 8 - Math.sin(t * 9) * 18 : lerp(70 * shock, 175 + wipe, relief) * 1,
        lean: walk ? 3 : lerp(-14 * shock, 0, relief), look: walk ? 0.5 : 0.8,
        squash: 1 - 0.07 * hump(seg(t, imp, imp + 0.4)),
        lift: 10 * hump(seg(t, imp, imp + 0.35)),
        mood: walk ? 'smile' : t < 2.8 ? 'open' : 'smile', blink: 0
      });
      const sw = seg(t, imp + 0.2, 2.6);
      tf(sweat, bx - 28 + 3 * sw, FY - 105 + 30 * sw, 0, 1, 1);
      sweat.setAttribute('opacity', t > imp + 0.2 && t < 2.8 ? 1 : 0);
    }
  };
}
