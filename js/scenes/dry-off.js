// dry off：ぬれたまめが、タオルで体を拭いて水気を取る（例文 He dried off with a towel.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, 'ぬれている'], [1.2, 'タオルで拭く'], [2.8, '乾いた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 244, mood: 'indoor' });
  const S = 1.15;
  const b = k.buddy({ x: 200, y: FY, scale: S });
  // ぬれ：水色の膜と水滴
  const wet = el('rect', { x: -30, y: -80, width: 60, height: 80, rx: 28, fill: pal.water, opacity: 0.45 }, b.body);
  const dr = [[-20, -66], [14, -70], [-8, -34], [20, -40], [-24, -20], [6, -14]].map(([x, y]) => el('path', { d: 'M 0 -6 Q 4 0 0 4 Q -4 0 0 -6', fill: pal.water, stroke: pal.blueDark, 'stroke-width': 1, transform: `translate(${x} ${y})` }, b.body));
  const fall = [0, 1, 2, 3].map(() => el('path', { d: 'M 0 -6 Q 4 0 0 4 Q -4 0 0 -6', fill: pal.water, stroke: pal.blueDark, 'stroke-width': 1 }));
  const puddle = el('ellipse', { cx: 200, cy: FY + 4, rx: 10, ry: 3, fill: pal.water, opacity: 0.8 });
  // タオル
  const towel = g({});
  el('rect', { x: -26, y: -9, width: 52, height: 18, rx: 6, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2.5 }, towel);
  [-14, -2, 10].forEach((x) => el('line', { x1: x, y1: -9, x2: x, y2: 9, stroke: pal.yellowDark, 'stroke-width': 2, opacity: 0.6 }, towel));
  const sp = [0, 1, 2, 3].map(() => el('path', { d: 'M 0 -8 L 2 -2 L 8 0 L 2 2 L 0 8 L -2 2 L -8 0 L -2 -2 Z', fill: pal.yellow }));
  return {
    update(t) {
      const dry = easeInOut(seg(t, 1.4, 3.0));
      const rub = seg(t, 1.1, 3.0) * (1 - seg(t, 3.0, 3.3));
      wet.setAttribute('opacity', 0.45 * (1 - dry));
      dr.forEach((d, i) => d.setAttribute('opacity', 1 - seg(dry, i * 0.12, 0.35 + i * 0.12)));
      fall.forEach((f, i) => {
        const ph = ((t * 1.6 + i * 0.27) % 1);
        const x = [180, 214, 190, 222][i];
        tf(f, x, FY - 70 + (FY - 70 - (FY - 70)) + ph * 70 - (i % 2) * 8);
        f.setAttribute('opacity', (1 - dry) * (ph < 0.9 ? 1 : 0));
      });
      puddle.setAttribute('rx', 10 + 22 * (1 - dry) * (1 - dry * 0.0));
      puddle.setAttribute('opacity', 0.8 * (1 - seg(t, 2.8, 3.6)));
      // 体をぶるっとさせてタオルで拭く
      const swing = Math.sin(t * 16) * rub;
      b.pose({ armL: lerp(8, 70, seg(t, 0.8, 1.2)) * (1 - seg(t, 3.0, 3.4)) + 8 * seg(t, 3.0, 3.4), armR: lerp(8, 70, seg(t, 0.8, 1.2)) * (1 - seg(t, 3.0, 3.4)) + 8 * seg(t, 3.0, 3.4), lean: 3 * swing, look: 0, mood: dry > 0.8 ? 'grin' : 'flat', squash: 1 + 0.01 * swing, blink: rub > 0.1 ? 0.7 : 0 });
      const hl = b.handPos('L'), hr = b.handPos('R');
      const cx = 200 + 14 * swing * (1), cy = lerp(FY - 70, FY - 56, 0.5) + 4 * Math.cos(t * 16) * rub;
      const showT = seg(t, 0.8, 1.2) * (1 - seg(t, 3.2, 3.5));
      tf(towel, (hl.x + hr.x) / 2 + 10 * swing, (hl.y + hr.y) / 2 - 12 + 22 * (1 - seg(t, 1.1, 1.5)) * 0, 0, 1.5 * showT, 1.5 * showT);
      sp.forEach((s, i) => { const p = seg(t, 3.0 + i * 0.1, 3.6 + i * 0.1); tf(s, 160 + i * 28, FY - 110 + (i % 2) * 40 - 8 * p, 0, hump(p) * 1.1, hump(p) * 1.1); });
    }
  };
}
