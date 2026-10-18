// give away：まめが古い服の入った箱を持って隣の家へ行き、近所の人にあげる。まめの手は空になる（例文 I gave away my old clothes to a neighbor.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { hp, gait } from './dig.js';
import { grip } from './hand-over.js';
import { heart } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '古い服の箱'], [1.8, '隣の人に渡す'], [3.6, 'あげた']] };

function house(k, x, wall, roof, door) {
  const { el } = k;
  el('rect', { x, y: 110, width: 130, height: 126, rx: 4, fill: wall });
  el('path', { d: `M ${x - 10} 116 L ${x + 65} 66 L ${x + 140} 116 Z`, fill: roof, stroke: roof, 'stroke-width': 6, 'stroke-linejoin': 'round' });
  el('rect', { x: x + 48, y: 160, width: 36, height: 76, rx: 3, fill: door });
  el('circle', { cx: x + 78, cy: 200, r: 3, fill: k.pal.yellow });
  el('rect', { x: x + 12, y: 136, width: 28, height: 26, rx: 3, fill: '#DDEFFA' });
  el('rect', { x: x + 92, y: 136, width: 28, height: 26, rx: 3, fill: '#DDEFFA' });
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  house(k, 10, '#FBE9DC', pal.blueDark, pal.blue);
  house(k, 262, '#E6F1E8', pal.coralDark, pal.coral);
  el('rect', { x: 0, y: FY, width: 400, height: 8, fill: '#E3E8EE' });
  const S = 0.9;
  const me = k.buddy({ x: 76, y: FY + 6, scale: S });
  const nb = k.buddy({ x: 328, y: FY + 6, scale: S, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const sh = k.shadow(0, FY + 8, 18, 3);
  // 服の箱：たたんだシャツが見える
  const box = g({});
  el('rect', { x: -20, y: -16, width: 40, height: 6, rx: 2, fill: pal.blue }, box);
  el('rect', { x: -18, y: -21, width: 36, height: 6, rx: 2, fill: pal.yellow }, box);
  el('rect', { x: -22, y: -12, width: 44, height: 24, rx: 3, fill: pal.wood }, box);
  el('rect', { x: -22, y: -12, width: 44, height: 5, fill: pal.woodDark }, box);
  const gm = grip(k, pal.mint, pal.mintDark, S), gn = grip(k, pal.coral, pal.coralDark, S);
  const hearts = [0, 1].map(() => { const h = g({}); heart(k, h); return h; });
  const xf = (t) => lerp(76, 236, easeInOut(seg(t, 0.3, 1.6))) - lerp(0, 50, easeInOut(seg(t, 3.0, 4.2)));
  return {
    update(t) {
      const p = gait(xf, t, 76);
      const give = easeInOut(seg(t, 1.6, 2.1)), done = t > 2.6;
      const m = easeInOut(seg(t, 2.1, 2.5));
      const armM = done ? lerp(70, 12, easeInOut(seg(t, 2.6, 3.0))) : lerp(52, 80, give);
      me.pose({ x: p.x, walk: p.walk, facing: t > 3.0 ? -1 : 1, armR: done ? (t > 3.0 ? p.armR : armM) : armM, armL: t > 3.0 ? p.armL : 10, lean: p.lean + 4 * give * (1 - m), look: 0.4, mood: done ? 'grin' : 'smile' });
      const armN = lerp(lerp(10, 80, easeInOut(seg(t, 1.8, 2.1))), 54, m);
      nb.pose({ armR: armN, look: 0.4, mood: t > 2.4 ? 'grin' : 'open', squash: 1 - 0.06 * hump(seg(t, 2.5, 2.9)), lean: 3 * hump(seg(t, 1.8, 2.8)) });
      const hm = hp(me, S), hn = hp(nb, S);
      const bx = lerp(hm.x + 6, hn.x - 6, m), by = lerp(hm.y, hn.y, m) - 4;
      tf(box, bx, by, wobble(seg(t, 0.3, 1.6), 3, 2) * 2);
      k.set(sh, { cx: bx, rx: 16 });
      gm(hm); gn(hn);
      me.armR.hand.setAttribute('opacity', 0); nb.armR.hand.setAttribute('opacity', 0);
      // 渡し終えたら、まめの持ち手は消える（手は体の横）
      gm(m >= 1 ? { x: -99, y: -99 } : hm);
      if (m >= 1) me.armR.hand.setAttribute('opacity', 1);
      if (m < 0.2) gn({ x: -99, y: -99 }), nb.armR.hand.setAttribute('opacity', 1);
      hearts.forEach((h, i) => { const q = seg(t, 2.7 + i * 0.3, 3.8 + i * 0.3); tf(h, 330 + i * 18 - 9, 120 - q * 34, 0, easeOut(q) * 0.9); h.setAttribute('opacity', q > 0 ? 1 - seg(q, 0.6, 1) : 0); });
    }
  };
}
