// the sooner the better：「早めにね」と書類を渡されたまめが、すぐにポストへ走って投函。早いほど喜ばれる（例文 Send the form soon. The sooner the better.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, reach, held, cue, run, papers, star, popIn, streetBg } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '早めに送って'], [1.5, 'すぐ出す'], [3.2, '早いほどいい']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 236);
  // ポスト（動かない）
  k.shadow(330, FY + 8, 22, 4);
  el('rect', { x: 324, y: 150, width: 12, height: FY + 8 - 150, fill: pal.red });
  el('rect', { x: 306, y: 100, width: 48, height: 56, rx: 10, fill: pal.red });
  el('rect', { x: 316, y: 116, width: 28, height: 5, rx: 2.5, fill: pal.ink });
  const C = k.buddy({ x: 60, y: FY + 8, scale: 0.86, color: pal.coral, dark: pal.coralDark });
  const A = k.buddy({ x: 128, y: FY + 8, scale: 0.86, facing: -1 });
  const doc = papers(k, 1);
  const soon = cue(k, 'Soon, please!', 110, 30, 1, 13);
  const sparks = [0, 1, 2].map(() => star(k, k.root, 8, pal.yellow));
  const xa = (t) => t < 1.4 ? 128 : lerp(128, 290, easeInOut(seg(t, 1.4, 2.4)));
  return {
    update(t) {
      const give = easeInOut(seg(t, 0.5, 0.9));
      const talk = t > 0.2 && t < 1.2 && Math.sin(t * 20) > 0;
      P(C, { look: 0.6, mood: talk ? 'open' : t > 3.0 ? 'grin' : 'smile', armR: t < 1.1 ? lerp(8, 80, give) * (1 - easeOut(seg(t, 1.0, 1.2))) + 8 : t > 3.0 ? lerp(8, 150, easeOut(seg(t, 3.0, 3.3))) : 8 });
      soon.show(seg(t, 0.2, 0.45) * (1 - seg(t, 1.3, 1.5)), 96, 108);
      // まめ：受け取ってすぐ走る→ポストに入れる
      const r = run(xa, t, 128, -1);
      const moving = t > 1.4 && t < 2.4;
      if (moving) P(A, { x: r.x, y: FY + 8, walk: r.walk, armL: r.armL, armR: 40, lean: r.lean, lift: r.lift, facing: 1, look: 0.6, mood: 'grin' });
      else if (t <= 1.4) P(A, { x: 128, y: FY + 8, facing: t < 1.2 ? -1 : 1, look: 0.6, mood: 'smile', armR: lerp(8, 76, easeOut(seg(t, 0.6, 0.95))) });
      else { const p = easeInOut(seg(t, 2.4, 2.8)); P(A, { x: 290, y: FY + 8, facing: 1, look: 0.7, mood: 'grin', lift: 6 * hump(seg(t, 2.4, 2.8)) }); A.pose({ armR: reach(A, 0.86, 'R', lerp(310, 330, p), lerp(160, 118, p)) * (1 - easeOut(seg(t, 3.0, 3.4))) + 8 * easeOut(seg(t, 3.0, 3.4)) }); }
      const hc = held(k, C, 0.86, k.g({}), 'R'), ha = held(k, A, 0.86, k.g({}), 'R');
      const mine = t > 0.95;
      const inBox = t > 2.85;
      tf(doc, mine ? ha.x : hc.x, (mine ? ha.y : hc.y) - 6, mine ? -10 : 0, 0.9);
      doc.setAttribute('opacity', inBox ? 0 : t > 0.3 ? 1 : 0);
      sparks.forEach((s, i) => { const q = seg(t, 2.9 + i * 0.1, 3.4 + i * 0.1); tf(s, 330 + (i - 1) * 24 * q, 100 - 26 * q, 0, popIn(q) * (1 - seg(t, 3.9, 4.3))); });
    }
  };
}
