// leaf：木の下を歩いていると、1枚の葉がひらひら落ちて、まめの頭にのる。見上げて、手で取る（例文 A leaf fell on my head.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { scene, hills, treeG, gait, hp, P, blinkAt, mark } from './nature.js';

export const meta = { duration: 4.4, beats: [[0, '木の下で'], [1.0, '葉が落ちる'], [2.4, '頭にのった']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const { FY } = scene(k, { FY: 238 });
  hills(k, FY);
  const tr = treeG(k, 1.7); tf(tr.g, 210, FY + 2);
  const b = k.buddy({ x: 80, y: FY, scale: S });
  const leaf = g({});
  el('path', { d: 'M -10 0 Q 0 -9 10 0 Q 0 9 -10 0 Z', fill: '#5FB36F' }, leaf);
  el('path', { d: 'M -10 0 H 12', stroke: '#3E8D50', 'stroke-width': 1.4 }, leaf);
  const ex = mark(k, '!', pal.coralDark);
  const xf = (t) => lerp(80, 196, easeInOut(seg(t, 0.1, 1.3)));
  return {
    update(t) {
      const w = gait(xf, t, 80);
      const land = 2.3, hit = seg(t, land, land + 0.3);
      const up = easeInOut(seg(t, 2.5, 2.9)), take = easeInOut(seg(t, 3.2, 3.8));
      P(b, { x: w.x, walk: w.walk, lean: w.lean - 6 * up, squash: 1 - 0.05 * hump(hit), armL: w.armL, armR: w.armR, look: 0.2, mood: t > 3.7 ? 'grin' : t > land ? 'open' : 'smile', blink: blinkAt(t) });
      b.body.children[3].setAttribute('transform', `translate(0 ${(-5 * up).toFixed(1)})`);
      const headY = FY - 92 * S + 2;
      // 腕で頭の上の葉をつまむ
      if (take > 0) b.pose({ armR: lerp(w.armR, 170, take) });
      const h = hp(b, S, 'R', 28);
      const p = seg(t, 0.9, land);
      if (t < land) {
        const x = lerp(250, 196, p) + 26 * Math.sin(p * 10), y = lerp(110, headY, p);
        tf(leaf, x, y, 30 * Math.sin(p * 10));
      } else if (t < 3.6) tf(leaf, b.state.x + 2, headY + 4 * (1 - squashOf(hit)), 10);
      else { const q = easeInOut(seg(t, 3.6, 4.1)); tf(leaf, lerp(b.state.x + 2, h.x, Math.min(1, q * 3)), lerp(headY, h.y - 4, Math.min(1, q * 3)), 10 + 60 * q); }
      ex.show(seg(t, land, land + 0.3) * (1 - seg(t, 3.4, 3.6)), b.state.x + 34, headY - 18);
    }
  };
}
const squashOf = (p) => (p > 0 ? 1 : 0);
