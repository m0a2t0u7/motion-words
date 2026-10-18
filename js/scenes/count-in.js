// count in：浮き輪とボールを持って海へ行く2人に、まめが手を挙げて加わり、人数が 2→3 に数えられる（例文 If you go to the beach, count me in.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { gait, hp } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '海へ行く2人'], [1.6, '入れて！'], [3.4, '3人になった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('rect', { x: 0, y: 176, width: 400, height: 60, fill: '#8FD3F4' });
  for (let i = 0; i < 8; i++) el('path', { d: `M ${i * 56 - 10} 182 q 14 -8 28 0 q 14 8 28 0`, stroke: '#fff', 'stroke-width': 3, fill: 'none', opacity: 0.7 });
  el('rect', { x: 0, y: 206, width: 400, height: 30, fill: '#F6E3B8' });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#F2DFB5' });
  el('circle', { cx: 350, cy: 54, r: 22, fill: pal.yellow });
  const S = 0.9;
  const P1 = k.buddy({ x: 150, y: FY, scale: S, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const P2 = k.buddy({ x: 220, y: FY, scale: S, color: pal.blue, dark: pal.blueDark, facing: -1 });
  const ring = g({}); el('circle', { r: 15, fill: 'none', stroke: pal.red, 'stroke-width': 8 }, ring); [0, 90, 180, 270].forEach((a) => el('path', { d: 'M 11 -4 L 19 -4 L 19 4 L 11 4 Z', fill: '#fff', transform: `rotate(${a})` }, ring));
  const ball = g({}); el('circle', { r: 12, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, ball); el('path', { d: 'M -12 0 A 12 12 0 0 1 12 0 Z', fill: pal.yellow }, ball); el('path', { d: 'M -6 -10 A 12 12 0 0 1 6 -10 L 0 0 Z', fill: pal.blue }, ball);
  const A = k.buddy({ x: 420, y: FY, scale: S, facing: -1 });
  const tags = [0, 1, 2].map((i) => { const c = g({}); el('circle', { r: 11, fill: '#fff', stroke: pal.ink, 'stroke-width': 2 }, c); k.text(0, 1, String(i + 1), { 'font-size': 13 }, c); return c; });
  const xf = (t) => lerp(420, 296, easeInOut(seg(t, 0.6, 2.0)));
  return {
    update(t) {
      const turn = t > 1.0;
      P1.pose({ armR: 30, armL: 10, look: turn ? -0.6 : 0.5, facing: turn ? 1 : -1, mood: t > 2.2 ? 'grin' : 'smile' });
      P2.pose({ armR: 70, armL: 10, look: turn ? 0.6 : 0.5, facing: turn ? 1 : -1, mood: t > 2.2 ? 'grin' : 'smile' });
      const h1 = hp(P1, S, 'R'), h2 = hp(P2, S, 'R');
      tf(ring, h1.x, h1.y + 8, 0); tf(ball, h2.x + 6 * (turn ? 1 : -1), h2.y - 8);
      const p = gait(xf, t, 420);
      const raise = easeOut(seg(t, 1.6, 1.9)) * (1 - easeInOut(seg(t, 3.0, 3.3)));
      const hop = hump(seg(t, 2.0, 2.3)) + hump(seg(t, 2.35, 2.65));
      A.pose({ x: p.x, walk: p.walk, armL: p.armL, armR: lerp(p.armR, 170 + 8 * Math.sin(t * 14), raise), lean: p.lean, lift: 12 * hop, squash: 1 - 0.06 * hop, look: 0.6, mood: t > 1.6 ? 'grin' : 'smile' });
      [P1, P2, A].forEach((b, i) => {
        const at = [2.6, 2.95, 3.4][i], q = seg(t, at, at + 0.25);
        tf(tags[i], b.state.x, FY - 112 * S - 14 - 3 * hump(q), 0, Math.max(0.01, backOut(q)));
        tags[i].setAttribute('opacity', q > 0 ? 1 : 0);
      });
    }
  };
}
