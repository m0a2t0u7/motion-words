// tree：あの木に小鳥が飛んできて枝にとまる。まめが「ほら」と木を指さす（例文 There's a bird in that tree.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { scene, hills, treeG, birdG, P, blinkAt, point } from './nature.js';

export const meta = { duration: 4.2, beats: [[0, '公園の木'], [1.0, '鳥がとまる'], [2.6, '木に鳥がいる']] };

export function create(k) {
  const { el, tf, pal } = k, S = 0.95;
  const { FY } = scene(k, { FY: 240 });
  hills(k, FY);
  const tr = treeG(k, 1.7); tf(tr.g, 270, FY + 2);
  el('path', { d: 'M 270 140 Q 300 132 330 128', stroke: '#B99572', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' });
  const bh = k.g({}); tf(bh, 0, 0, 0, 1.7); const bd = birdG(k, pal.blue, bh);
  const note = k.text(0, 0, '♪', { 'font-size': 18, fill: pal.blueDark });
  const b = k.buddy({ x: 100, y: FY, scale: S });
  const c = k.buddy({ x: 40, y: FY, scale: S * 0.85, color: pal.coral, dark: pal.coralDark });
  return {
    update(t) {
      const f = easeInOut(seg(t, 0.2, 1.4));
      const bx = lerp(430, 316, f), by = lerp(40, 128, f) - 30 * hump(f) + 2 * wob(t);
      bd.set(bx / 1.7, by / 1.7, f < 1 ? 0.5 + 0.5 * Math.sin(t * 30) : 0.1 * hump(seg(t, 3.0, 3.3)), -1);
      tf(note, 300, 100 - 8 * seg(t, 2.6, 3.4), 0, hump(seg(t, 2.6, 3.4)) + 0.001);
      const pt = easeOut(seg(t, 1.5, 2.0));
      P(b, { look: 0.6, mood: t > 1.5 ? 'open' : 'smile', blink: blinkAt(t), armL: 10 });
      b.body.children[3].setAttribute('transform', 'translate(4 -4)');
      b.pose({ armR: lerp(8, point(b, S, 'R', 316, 120), pt), mood: t > 2.6 ? 'grin' : b.state.mood });
      const turn = easeInOut(seg(t, 2.0, 2.5));
      P(c, { look: 0.6, lean: -4 * turn, mood: turn > 0.5 ? 'open' : 'smile', blink: blinkAt(t, 1) });
      c.body.children[3].setAttribute('transform', `translate(${(4 * turn).toFixed(1)} ${(-4 * turn).toFixed(1)})`);
    }
  };
}
const wob = (t) => (t > 1.4 ? Math.sin((t - 1.4) * 20) * Math.exp(-(t - 1.4) * 6) : 0);
