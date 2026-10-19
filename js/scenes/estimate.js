// estimate：値札のない品物を前に、2人で考えて「だいたい100ドル」と見積もる（例文 We estimated the cost at about a hundred dollars.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { cloud } from './look-over.js';
import { cue } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '値段は？'], [1.2, '考える'], [3.0, '約100ドル']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 236;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  el('rect', { x: 150, y: 40, width: 100, height: 66, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  // 必要な物：ペンキ缶・はけ・板（値段は「?」）
  const items = g({});
  k.shadow(200, FY + 1, 70, 4, items);
  el('rect', { x: 140, y: 196, width: 36, height: 40, rx: 4, fill: pal.blue }, items);
  el('rect', { x: 140, y: 196, width: 36, height: 7, fill: pal.blueDark }, items);
  el('path', { d: 'M 146 196 Q 158 180 170 196', stroke: pal.sub, 'stroke-width': 2.5, fill: 'none' }, items);
  el('rect', { x: 184, y: 186, width: 70, height: 10, rx: 2, fill: pal.wood }, items);
  el('rect', { x: 184, y: 198, width: 70, height: 10, rx: 2, fill: pal.woodDark }, items);
  el('rect', { x: 190, y: 210, width: 60, height: 26, rx: 3, fill: '#E3B77E' }, items);
  el('rect', { x: 236, y: 166, width: 8, height: 20, rx: 2, fill: pal.wood }, items);
  el('rect', { x: 232, y: 154, width: 16, height: 14, rx: 2, fill: pal.coral }, items);
  const tags = [[158, 228], [220, 228], [240, 150]].map(([x, y]) => {
    const n = g({}); tf(n, x, y);
    el('path', { d: 'M -10 -8 L 8 -8 L 14 0 L 8 8 L -10 8 Z', fill: '#fff', stroke: pal.sub, 'stroke-width': 1.5 }, n);
    k.text(0, 1, '?', { 'font-size': 12, fill: pal.red }, n);
    return n;
  });
  const me = k.buddy({ x: 80, y: FY, scale: 1.0, facing: 1 });
  const you = k.buddy({ x: 320, y: FY, scale: 0.95, facing: -1, color: pal.coral, dark: pal.coralDark });
  const think = cloud(k, 120, 64, 0);
  // 雲の中：$ が3つ並ぶ＝合計はおおよそ
  const sums = ['$30', '$40', '$30'].map((s, i) => k.text(-38 + i * 38, -4, s, { 'font-size': 14, fill: pal.ink }, think.g));
  const ans = cue(k, '≈ $100', 86, 34, 0, 18);
  return {
    update(t) {
      const tk = seg(t, 1.0, 1.3) * (1 - seg(t, 2.7, 2.9));
      think.show(tk, 200, 82);
      sums.forEach((s, i) => s.setAttribute('opacity', seg(t, 1.3 + i * 0.4, 1.5 + i * 0.4)));
      ans.show(seg(t, 2.9, 3.2), 200, 92);
      // 2人：値札を見る → あごに手で考える → 手のひらをゆらして「だいたい」
      const chin = easeOut(seg(t, 0.9, 1.2)) * (1 - easeInOut(seg(t, 2.7, 3.0)));
      const sway = t > 3.0 ? Math.sin((t - 3.0) * 12) * 12 * (1 - seg(t, 3.8, 4.2)) : 0;
      const hand = easeOut(seg(t, 2.8, 3.1));
      [[me, 0], [you, 1]].forEach(([b, i]) => {
        P(b, { facing: i ? -1 : 1, look: t < 0.9 ? 0.4 : t < 2.8 ? -0.2 + 0.3 * Math.sin(t * 3 + i) : 0.9, blink: blinkAt(t, i),
          armR: lerp(10, 150, chin) * (1 - hand) + lerp(0, 92 + sway, hand), armL: 10, lean: 4 * chin,
          mood: t > 3.0 ? 'grin' : chin > 0.5 ? 'flat' : 'smile' });
      });
      tags.forEach((n, i) => n.setAttribute('transform', `${n.getAttribute('transform').split(' rotate')[0]} rotate(${(4 * Math.sin(t * 5 + i)).toFixed(2)})`));
    }
  };
}
