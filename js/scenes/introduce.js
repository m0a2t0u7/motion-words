// introduce：私が間に立ち、友だちとあなたを引き合わせ、二人が握手する（例文 Let me introduce my friend to you.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { hp, gait } from './dig.js';
import { heart } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '二人の間に立つ'], [1.6, '引き合わせる'], [3.2, '握手した']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 150, y: 40, width: 100, height: 60, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 200, y1: 40, x2: 200, y2: 100, stroke: '#fff', 'stroke-width': 4 });
  el('ellipse', { cx: 200, cy: 262, rx: 160, ry: 14, fill: '#F1D9CF' });
  const M = k.buddy({ x: 200, y: 232, facing: 1, scale: 0.88 });
  const Y = k.buddy({ x: 70, y: 246, facing: 1, color: pal.coral, dark: pal.coralDark });
  const F = k.buddy({ x: 330, y: 246, facing: -1, color: pal.blue, dark: pal.blueDark });
  const P = (b, o) => b.pose({ armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'smile', blink: 0, lift: 0, ...o });
  const hs = [0, 1, 2].map(() => heart(k, k.root));
  const xy = (t) => lerp(70, 142, easeInOut(seg(t, 1.5, 2.7))), xf = (t) => lerp(330, 258, easeInOut(seg(t, 1.5, 2.7)));
  return {
    update(t) {
      const open = easeOut(seg(t, 0.4, 1.2)), sh = seg(t, 2.8, 3.8), wave = sh > 0 && sh < 1 ? Math.sin(sh * Math.PI * 4) * 8 : 0;
      const talk = t > 0.5 && t < 1.8 && Math.sin(t * 18) > 0;
      const py = gait(xy, t, 70, 14, 0.11), pf = gait(xf, t, 330, 14, 0.11);
      const grab = easeInOut(seg(t, 2.6, 3.0));
      P(M, { armR: lerp(8, 70, open) + 8 * hump(seg(t, 1.0, 1.6)) , armL: lerp(8, 70, open), look: 0.2 * Math.sin(t * 2), mood: talk ? 'open' : 'grin', lean: 2 * open });
      P(Y, { x: py.x, walk: py.walk, armR: lerp(py.armR, 90, grab) + wave, armL: py.armL, lean: py.lean, look: 0.5, mood: t > 2.6 ? 'grin' : 'smile' });
      P(F, { x: pf.x, walk: pf.walk, armR: lerp(pf.armR, 90, grab) + wave, armL: pf.armL, lean: pf.lean, look: 0.5, mood: t > 2.6 ? 'grin' : 'smile' });
      hs.forEach((h, i) => { const q = seg(t, 3.4 + i * 0.2, 4.3); tf(h, 186 + i * 14, 120 - 24 * q - i * 5, 0, hump(q) * 1.1 + 0.001); });
    }
  };
}
