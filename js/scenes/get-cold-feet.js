// get cold feet：スピーチの舞台へ向かうが、直前で足が凍って立ちすくみ、後ずさり（例文 He got cold feet before the speech.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '舞台へ向かう'], [1.5, '足が冷える'], [3.0, 'しり込み']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  // 舞台・カーテン・演台
  el('rect', { x: 238, y: 40, width: 162, height: 200, fill: '#E9DFF8' });
  el('path', { d: 'M 238 40 Q 258 120 240 240 L 238 240 Z', fill: pal.violet, opacity: 0.55 });
  el('rect', { x: 238, y: 226, width: 162, height: 14, fill: pal.woodDark });
  const pod = g({ transform: 'translate(330 226)' });
  el('rect', { x: -22, y: -56, width: 44, height: 56, rx: 4, fill: pal.wood }, pod);
  el('rect', { x: -22, y: -56, width: 44, height: 8, rx: 3, fill: pal.woodDark }, pod);
  el('line', { x1: 0, y1: -56, x2: 4, y2: -78, stroke: pal.ink, 'stroke-width': 3 }, pod);
  el('ellipse', { cx: 4, cy: -82, rx: 6, ry: 8, fill: pal.ink }, pod);
  const b = k.buddy({ x: 60, y: FY, scale: 1.1 });
  // 冷えた足（氷色）
  const feet = [g({}), g({})];
  feet.forEach((f) => { el('ellipse', { rx: 10, ry: 6, fill: '#BFE6FA', stroke: '#6BB8E6', 'stroke-width': 2 }, f); });
  const flakes = g({});
  [[-16, -14], [14, -22], [0, -34]].forEach(([x, y]) => k.text(x, y, '*', { 'font-size': 20, fill: '#6BB8E6' }, flakes));
  const sweat = el('path', { d: 'M 0 -7 Q 6 3 0 8 Q -6 3 0 -7 Z', fill: pal.water });
  return {
    update(t) {
      const walkIn = easeInOut(seg(t, 0.2, 1.5));
      const back = easeInOut(seg(t, 3.0, 3.9));
      const x = lerp(60, 175, walkIn) - 50 * back;
      const frozen = seg(t, 1.5, 1.9);
      const shiver = frozen > 0 && t < 3.0 ? Math.sin(t * 40) * 1.6 : 0;
      const walking = (walkIn > 0 && walkIn < 1) || back > 0 && back < 1;
      b.pose({
        x: x + shiver, facing: back > 0 ? -1 : 1, walk: walking ? t * 9 : 0,
        mood: t < 1.5 ? 'smile' : t < 3.0 ? 'sad' : 'sad',
        armR: frozen > 0 && t < 3.0 ? 60 + 15 * Math.sin(t * 38) : 8, armL: frozen > 0 && t < 3.0 ? 60 : 8,
        lean: -6 * hump(seg(t, 1.4, 2.0)) - 3 * back, look: 0.8, squash: 1 - 0.02 * Math.abs(shiver),
        blink: t > 2.2 && t < 2.4 ? 1 : 0
      });
      const on = t > 1.5;
      const lx = b.state.x;
      tf(feet[0], lx - 12, FY + 2, 0, on ? 1 : 0.001);
      tf(feet[1], lx + 12, FY + 2, 0, on ? 1 : 0.001);
      tf(flakes, lx, FY - 4, 0, 1);
      flakes.setAttribute('opacity', on && t < 3.5 ? 0.5 + 0.5 * Math.sin(t * 12) : 0);
      tf(sweat, lx + 28, lerp(FY - 120, FY - 100, seg(t, 2.0, 3.2)));
      sweat.setAttribute('opacity', t > 2.0 && t < 3.8 ? 1 : 0);
    }
  };
}
