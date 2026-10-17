// on thin ice：薄い氷の上に立つ人（遅刻を重ねた）に、上司が時計を指して厳しい顔。氷にひびが広がる（You're on thin ice after being late again.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '遅刻した'], [1.6, 'ひびが入る'], [3.4, '危うい']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236, mood: 'outdoor' });
  // 池（左）と岸（右）
  el('path', { d: 'M 0 236 L 262 236 Q 274 262 258 300 L 0 300 Z', fill: pal.water });
  el('path', { d: 'M 0 262 Q 40 256 80 264 T 160 262 T 250 268', fill: 'none', stroke: '#fff', 'stroke-width': 2, opacity: 0.5 });
  // 氷（上面＋厚み）
  el('rect', { x: 54, y: 250, width: 182, height: 9, rx: 3, fill: '#A9D6EA' });
  el('polygon', { points: '72,230 218,230 238,250 52,250', fill: '#E4F5FC' });
  const cr = (d) => el('path', { d, fill: 'none', stroke: '#5C8FB0', 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 });
  const cracks = [cr('M 132 242 L 112 236 L 98 244 L 76 234'), cr('M 132 242 L 156 235 L 170 244 L 204 233'), cr('M 132 242 L 140 252 L 124 256 L 134 270')];
  // 時計の柱（遅刻を示す）
  el('rect', { x: 288, y: 118, width: 8, height: 118, fill: pal.woodDark });
  const cl = g({}); tf(cl, 292, 92);
  el('circle', { r: 26, fill: '#fff', stroke: pal.ink, 'stroke-width': 4 }, cl);
  el('line', { x1: 0, y1: 0, x2: 0, y2: -13, stroke: pal.ink, 'stroke-width': 3.6, 'stroke-linecap': 'round' }, cl);
  el('line', { x1: 0, y1: 0, x2: 8, y2: 5, stroke: pal.red, 'stroke-width': 3, 'stroke-linecap': 'round' }, cl);
  const late = k.text(0, 0, '!!', { 'font-size': 22, fill: pal.red });
  const boss = k.buddy({ x: 336, y: 242, facing: -1, color: pal.coral, dark: pal.coralDark });
  const me = k.buddy({ x: 134, y: 244 });
  const sweat = [0, 1].map(() => el('path', { d: 'M 0 -6 Q 4 0 0 4 Q -4 0 0 -6 Z', fill: pal.water, stroke: '#fff', 'stroke-width': 1 }));
  return {
    update(t) {
      const pt = easeOut(seg(t, 0.5, 1.1));
      const sh = seg(t, 1.5, 3.4);
      const shiver = Math.sin(t * 38) * 1.6 * sh;
      boss.pose({ armR: lerp(8, 118, pt), armL: lerp(8, 60, easeOut(seg(t, 2.6, 3.1))), mood: t > 0.5 ? 'flat' : 'smile', look: -0.8, lean: -4 * pt });
      tf(late, 292, 56 - 3 * hump(seg(t % 0.6, 0, 0.6)));
      late.setAttribute('opacity', t > 0.5 ? 1 : 0);
      cracks.forEach((c, i) => c.setAttribute('stroke-dashoffset', 1 - easeOut(seg(t, 1.5 + i * 0.5, 2.1 + i * 0.5))));
      me.pose({
        x: 134 + shiver, mood: t < 1.5 ? 'sad' : 'open', look: t < 1.5 ? 0.3 : 0,
        armL: lerp(8, 70, easeOut(seg(t, 1.5, 2.0))) + Math.sin(t * 30) * 4 * sh,
        armR: lerp(8, 70, easeOut(seg(t, 1.5, 2.0))) - Math.sin(t * 30) * 4 * sh,
        squash: 1 - 0.04 * sh, lean: lerp(-4, -8, sh), blink: 0
      });
      sweat.forEach((s, i) => { const p = seg(t, 1.9 + i * 0.5, 2.8 + i * 0.5); tf(s, 106 + i * 56, lerp(176, 206, p), 0, 1, 1); s.setAttribute('opacity', p > 0 && p < 1 ? 1 : 0); });
    }
  };
}
