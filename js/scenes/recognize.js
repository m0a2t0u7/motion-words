// recognize：新しい髪型の友だちが手を振っても、まめは誰だか分からない（例文 I didn't recognize him with his new hair.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { walkTo, P } from './run-after.js';
import { cloud } from './look-over.js';
import { streetBg } from './weigh.js';
import { mark } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '手を振る人'], [1.6, '誰だろう？'], [3.0, '分からない']] };

// 頭の上の髪（body に入れる）
function hair(k, b, kind) {
  const g = k.g({}, b.body), c = '#7A4A2E';
  if (kind === 'short') k.el('path', { d: 'M -27 -64 Q -26 -86 0 -86 Q 26 -86 27 -64 Q 14 -74 0 -72 Q -14 -74 -27 -64 Z', fill: c }, g);
  else { // 新しい髪：大きく盛った金色の髪
    k.el('path', { d: 'M -32 -60 Q -44 -86 -24 -98 Q -16 -118 4 -110 Q 26 -122 34 -98 Q 50 -84 32 -60 Q 20 -72 0 -70 Q -20 -72 -32 -60 Z', fill: '#F2B33D' }, g);
    k.el('path', { d: 'M -14 -96 Q 0 -104 14 -96', stroke: '#fff', 'stroke-width': 3, fill: 'none', opacity: 0.5, 'stroke-linecap': 'round' }, g);
  }
  return g;
}

export function create(k) {
  const { tf, pal } = k, S = 0.9;
  const FY = streetBg(k, 236);
  const me = k.buddy({ x: 110, y: FY, scale: S });
  const him = k.buddy({ x: 400, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  hair(k, him, 'new');
  // 考え雲：前の彼（短い髪）と、今の彼。ちがって見える
  const cl = cloud(k, 128, 70, -1);
  const old = k.buddy({ parent: cl.g, x: -30, y: 22, scale: 0.42, color: pal.coral, dark: pal.coralDark });
  hair(k, old, 'short'); old.g.children[0].setAttribute('opacity', 0);
  const now = k.buddy({ parent: cl.g, x: 30, y: 22, scale: 0.42, color: pal.coral, dark: pal.coralDark });
  hair(k, now, 'new'); now.g.children[0].setAttribute('opacity', 0);
  const neq = k.text(0, 0, '≠', { 'font-size': 22, fill: pal.red }, cl.g);
  const q = mark(k, 'q', null, 1.4);
  const hx = (t) => lerp(420, 236, easeInOut(seg(t, 0.2, 1.5)));
  return {
    update(t) {
      const w = walkTo(hx, t, 420, -1), wave = t > 1.4 ? Math.sin((t - 1.4) * 10) : 0;
      const waving = easeOut(seg(t, 1.3, 1.6));
      P(him, { x: w.x, walk: w.walk, facing: -1, armL: w.armL, lean: w.lean, armR: lerp(w.armR, 150 + 18 * wave, waving), mood: 'grin', look: -0.4 });
      const puz = easeOut(seg(t, 1.8, 2.3));
      P(me, { x: 110, look: lerp(0.3, 0.8, seg(t, 0.4, 1.0)), lean: -6 * puz, mood: puz > 0.5 ? 'flat' : 'smile', armR: lerp(8, 20, puz), armL: 8 });
      me.body.setAttribute('transform', me.body.getAttribute('transform') + ` rotate(${(-8 * puz).toFixed(1)} 0 -50)`);
      tf(q, 140, FY - 120, -10 * puz, puz > 0 ? backOut(puz) * 1.4 : 0.001);
      cl.show(seg(t, 2.6, 3.0), 120, 70);
      old.pose({ mood: 'smile', look: 0.4 }); now.pose({ mood: 'grin', look: -0.4 });
    }
  };
}
