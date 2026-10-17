// all ears：話しかけられて、耳が大きくなるほど集中して聞く（Go on. I'm all ears.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, '話しかけられる'], [1.2, '耳が大きく'], [2.8, '集中して聞く']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 244, mood: 'indoor' });
  const LX = 135, S = 1.05;
  const ear = (side) => {
    const e = g({});
    el('ellipse', { rx: 12, ry: 18, fill: '#FFC9B8', stroke: pal.mintDark, 'stroke-width': 3 }, e);
    el('ellipse', { rx: 6, ry: 11, fill: '#FF9C8C', opacity: 0.6 }, e);
    return e;
  };
  const eL = ear(-1), eR = ear(1);
  const me = k.buddy({ x: LX, y: FY, scale: S });
  const sp = k.buddy({ x: 320, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const bub = g({});
  el('path', { d: 'M -36 22 L -52 38 L -16 26 Z', fill: '#fff', stroke: '#CBD3DE', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, bub);
  el('ellipse', { rx: 44, ry: 26, fill: '#fff', stroke: '#CBD3DE', 'stroke-width': 2.5 }, bub);
  el('rect', { x: -40, y: 12, width: 40, height: 14, fill: '#fff' }, bub);
  const dots = [-18, 0, 18].map((x) => el('circle', { cx: x, cy: 0, r: 4.5, fill: pal.sub }, bub));
  const waves = [0, 1, 2].map(() => el('path', { d: 'M 0 -14 Q -9 0 0 14', fill: 'none', stroke: pal.coral, 'stroke-width': 3.5, 'stroke-linecap': 'round' }));
  return {
    update(t) {
      tf(bub, 262, 88, 0, 1, 1);
      dots.forEach((d, i) => k.set(d, { r: 3.5 + 2 * Math.max(0, Math.sin(t * 7 - i * 1.1)) }));
      const grow = backOut(seg(t, 1.1, 1.8), 2.2);
      const lean = easeOut(seg(t, 1.1, 1.7));
      const earY = FY - 62 * S;
      tf(eL, LX - 33 * S + lean * 0, earY, -8, grow * 1.5, grow * 1.5);
      tf(eR, LX + 33 * S + lean * 8, earY, 8, grow * 1.5, grow * 1.5);
      waves.forEach((w, i) => {
        const p = ((t * 0.9 + i / 3) % 1);
        tf(w, lerp(285, LX + 60, p), lerp(FY - 56, earY, p), 0, 0.8 + 0.5 * p, 0.8 + 0.5 * p);
        w.setAttribute('opacity', hump(p) * seg(t, 0.2, 0.6));
      });
      me.pose({
        look: 1, lean: lerp(0, 9, lean), armL: 8, armR: lerp(8, 20, lean), squash: 1 + 0.01 * lean,
        mood: t < 1.1 ? 'flat' : 'smile', blink: 0
      });
      const talk = Math.max(0, Math.sin(t * 7));
      sp.pose({ armR: 40 + 25 * Math.sin(t * 5), armL: 8, look: -0.8, mood: talk > 0.3 ? 'open' : 'smile', lean: 2 });
    }
  };
}
