// make up：けんかして背を向け合ったふたりが、次の日に向き合って握手し仲直りする（例文 They argued, but they made up the next day.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt, walkTo, win } from './run-after.js';
import { hp, reach, heart } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, 'けんか中'], [1.6, '次の日'], [3.4, '仲直り']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const w = win(k, 160, 40, 80, 64, '#3D4A6B');
  const moon = el('circle', { cx: 0, cy: 0, r: 10, fill: '#FFF3C4' }, w.inner);
  const sun = el('circle', { cx: 0, cy: 0, r: 12, fill: pal.yellow }, w.inner);
  w.frame();
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  // 日めくり
  el('rect', { x: 300, y: 50, width: 44, height: 50, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: 300, y: 50, width: 44, height: 13, rx: 4, fill: pal.red });
  const d1 = k.text(322, 82, '9', { 'font-size': 22 }), d2 = k.text(322, 82, '10', { 'font-size': 22 });
  const S = 0.85;
  const a = k.buddy({ x: 150, y: FY, scale: S, facing: -1 });
  const c = k.buddy({ x: 250, y: FY, scale: S, facing: 1, color: pal.coral, dark: pal.coralDark });
  const angry = [0, 1].map(() => { const z = g({}); el('path', { d: 'M -10 0 l 5 -7 l 5 7 l 5 -7 l 5 7', stroke: pal.red, 'stroke-width': 3, fill: 'none', 'stroke-linejoin': 'round' }, z); return z; });
  const hz = g({}); heart(k, hz);
  const ax = (t) => lerp(150, 160, easeInOut(seg(t, 2.3, 3.0))), cx = (t) => lerp(250, 240, easeInOut(seg(t, 2.3, 3.0)));
  return {
    update(t) {
      const day = easeInOut(seg(t, 1.4, 2.1));
      w.sky.setAttribute('fill', day > 0.5 ? '#CFE9F7' : '#3D4A6B');
      tf(moon, 200, 60 + 50 * day); tf(sun, 200, 120 - 50 * day);
      d1.setAttribute('opacity', 1 - seg(day, 0.4, 0.6)); d2.setAttribute('opacity', seg(day, 0.4, 0.6));
      const fight = t < 2.1;
      const turn = t > 2.2;
      const huff = Math.sin(t * 7) * (t < 1.4 ? 1 : 0);
      const wa = walkTo(ax, t, 150), wc = walkTo(cx, t, 250);
      P(a, { ...wa, facing: turn ? 1 : -1, armL: fight ? 22 : wa.armL, armR: fight ? 22 : wa.armR, lean: fight ? -5 : wa.lean, squash: 1 + 0.02 * huff, mood: fight ? 'flat' : 'smile', look: turn ? 0.5 : -0.3, blink: blinkAt(t) });
      P(c, { ...wc, facing: turn ? -1 : 1, armL: fight ? 22 : wc.armL, armR: fight ? 22 : wc.armR, lean: fight ? -5 : wc.lean, squash: 1 - 0.02 * huff, mood: fight ? 'flat' : 'smile', look: turn ? 0.5 : -0.3, blink: blinkAt(t, 1) });
      // 握手：手を伸ばして合わせ、上下に振る
      const sh = easeInOut(seg(t, 2.9, 3.3));
      if (sh > 0) {
        const mx = 200, my = FY - 52 + 4 * Math.sin(seg(t, 3.3, 4.0) * Math.PI * 4) * (1 - seg(t, 3.8, 4.0));
        P(a, { x: ax(t), facing: 1, armR: lerp(8, reach(a, S, 'R', mx, my), sh), mood: 'grin', look: 0.5, blink: blinkAt(t) });
        P(c, { x: cx(t), facing: -1, armR: lerp(8, reach(c, S, 'R', mx, my), sh), mood: 'grin', look: 0.5, blink: blinkAt(t, 1) });
      }
      angry.forEach((z, i) => { tf(z, i ? 268 : 132, 132 - 3 * Math.abs(Math.sin(t * 6 + i))); z.setAttribute('opacity', 1 - seg(t, 1.3, 1.6)); });
      const hq = seg(t, 3.4, 3.9);
      tf(hz, 200, 120 - 14 * easeOut(hq), 0, 1.6 * backOut(hq)); hz.setAttribute('opacity', hq > 0 ? 1 : 0);
    }
  };
}
