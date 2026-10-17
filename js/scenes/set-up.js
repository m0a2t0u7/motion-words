// set up：部品を広げ、ポールを立て、布を張り、ペグを打ってテントを組み立てる（例文 We set up the tent by the lake.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, hump, wobble } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '部品を広げる'], [0.7, '立てる'], [3.7, 'できあがり']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 200, mood: 'outdoor' });
  // 湖・丘・草地
  el('ellipse', { cx: 70, cy: 150, rx: 120, ry: 22, fill: '#D6EFE0' });
  el('ellipse', { cx: 330, cy: 152, rx: 130, ry: 26, fill: '#CBEBD8' });
  el('rect', { x: 0, y: 150, width: 400, height: 54, fill: k.gradient([[0, '#A9DDF5'], [1, '#CDEBF9']]) });
  const ripples = [0, 1, 2, 3, 4].map((i) => el('rect', { x: 0, y: 160 + (i % 3) * 13, width: 30 + (i % 2) * 14, height: 3, rx: 1.5, fill: '#FFFFFF', opacity: 0.7 }));
  el('rect', { x: 0, y: 200, width: 400, height: 100, fill: '#DDF2E5' });
  el('rect', { x: 0, y: 200, width: 400, height: 3, fill: '#C3E6D1' });
  [[40, 270], [380, 214], [150, 288]].forEach(([x, y]) => { el('circle', { cx: x, cy: y, r: 3, fill: '#F5C3D2' }); el('circle', { cx: x + 8, cy: y + 3, r: 3, fill: '#FFF3B0' }); });

  const AX = 150, AY = 140, LB = [88, 254], RB = [212, 254];
  // 布の山（部品）
  const pile = g({});
  el('ellipse', { cx: 0, cy: 4, rx: 36, ry: 6, fill: pal.shadow }, pile);
  el('path', { d: 'M -34 0 Q -30 -26 -8 -24 Q 8 -34 28 -18 Q 40 -8 34 0 Z', fill: pal.coral }, pile);
  el('path', { d: 'M -20 -2 Q -4 -14 14 -2', stroke: pal.coralDark, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, pile);
  tf(pile, 52, 268);
  // ポール
  const mkPole = () => {
    const p = el('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: '#AEB7C4', 'stroke-width': 6, 'stroke-linecap': 'round' });
    return p;
  };
  const pL = mkPole(), pR = mkPole();
  const LEN = Math.hypot(AX - LB[0], AY - LB[1]);
  const angL = Math.atan2(AY - LB[1], AX - LB[0]), angR = Math.atan2(AY - RB[1], AX - RB[0]);
  // テント（布）
  const tent = g({});
  el('path', { d: `M ${LB[0] - 4} 256 L ${AX} ${AY - 4} L ${RB[0] + 4} 256 Z`, fill: pal.coral, stroke: pal.coral, 'stroke-width': 4, 'stroke-linejoin': 'round' }, tent);
  el('path', { d: `M ${AX} ${AY} L ${RB[0]} 254 L ${AX} 254 Z`, fill: pal.coralDark, opacity: 0.35 }, tent);
  el('path', { d: `M ${AX} 172 L ${AX - 24} 254 L ${AX + 24} 254 Z`, fill: '#8C4639' }, tent);
  el('path', { d: `M ${AX} 172 L ${AX - 24} 254 L ${AX - 4} 254 Z`, fill: pal.coral, opacity: 0.55 }, tent);
  el('rect', { x: LB[0] - 8, y: 252, width: RB[0] - LB[0] + 16, height: 6, rx: 3, fill: pal.coralDark }, tent);
  const flag = g({});
  el('line', { x1: 0, y1: 0, x2: 0, y2: -22, stroke: pal.woodDark, 'stroke-width': 3, 'stroke-linecap': 'round' }, flag);
  const pen = el('path', { d: 'M 0 -22 L 18 -17 L 0 -11 Z', fill: pal.yellow }, flag);
  // ペグとロープ
  const PA = [262, 272], PB = [240, 282];
  const mkPeg = () => { const p = g({}); el('rect', { x: -2.8, y: -18, width: 5.6, height: 20, rx: 2, fill: pal.yellowDark }, p); el('rect', { x: -6, y: -20, width: 12, height: 5, rx: 2, fill: pal.yellow }, p); return p; };
  const pegA = mkPeg(), pegB = mkPeg();
  const ropeA = el('line', { x1: 188, y1: 200, x2: PA[0], y2: PA[1] - 16, stroke: pal.ink, 'stroke-width': 2, 'stroke-linecap': 'round', opacity: 0.7 });
  const ropeB = el('line', { x1: RB[0] + 2, y1: 254, x2: PB[0], y2: PB[1] - 16, stroke: pal.ink, 'stroke-width': 2, 'stroke-linecap': 'round', opacity: 0.7 });
  // まめ
  const S = 0.95;
  const b = k.buddy({ x: 330, y: 270, scale: S, facing: -1 });
  const mallet = g({});
  el('line', { x1: 0, y1: 0, x2: 0, y2: 26, stroke: pal.woodDark, 'stroke-width': 5, 'stroke-linecap': 'round' }, mallet);
  el('rect', { x: -9, y: 26, width: 18, height: 12, rx: 3, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 2 }, mallet);

  const hitsA = [2.25, 2.5, 2.75], hitsB = [3.4, 3.65];
  const all = [...hitsA, ...hitsB];
  const sink = (hits, t) => hits.reduce((m, h) => m + easeOut(seg(t, h, h + 0.06)), 0);
  const swingAngle = (t) => {
    const REST = 35, UP = 142;
    for (let i = 0; i < all.length; i++) {
      const h = all[i];
      if (t >= h - 0.28 && t <= h + 0.1) {
        if (t < h - 0.1) return lerp(i === 0 || all[i - 1] < h - 0.3 ? 70 : REST, UP, easeOut(seg(t, h - 0.28, h - 0.1)));
        if (t < h) return lerp(UP, REST, easeIn(seg(t, h - 0.1, h)));
        return REST + 8 * hump(seg(t, h, h + 0.1));
      }
    }
    return t < 2.0 ? 70 : t > 3.8 ? 8 : REST;
  };

  return {
    update(t) {
      // 湖のさざ波
      ripples.forEach((r, i) => r.setAttribute('x', 30 + i * 80 + Math.sin(t * 1.1 + i * 1.7) * 10));
      // ポールが立つ
      const uL = easeInOut(seg(t, 0.7, 1.45)), uR = easeInOut(seg(t, 0.8, 1.55));
      const aL = lerp(0.1, angL, uL), aR = lerp(Math.PI - 0.1, angR + Math.PI * 2, uR);
      k.set(pL, { x1: LB[0], y1: LB[1], x2: LB[0] + Math.cos(aL) * LEN, y2: LB[1] + Math.sin(aL) * LEN });
      k.set(pR, { x1: RB[0], y1: RB[1], x2: RB[0] + Math.cos(aR) * LEN, y2: RB[1] + Math.sin(aR) * LEN });
      // 布が広がる
      const cp = backOut(seg(t, 1.5, 2.1), 1.3);
      const tw = cp > 0 ? wobble(seg(t, 2.1, 2.6), 3, 5) * 0.03 : 0;
      tent.setAttribute('transform', `translate(${AX} ${AY}) scale(${Math.max(0.001, cp * (1 + tw)).toFixed(3)} ${Math.max(0.001, cp).toFixed(3)}) translate(${-AX} ${-AY})`);
      tent.setAttribute('opacity', t > 1.5 ? 1 : 0);
      const pileP = easeIn(seg(t, 1.5, 2.0));
      tf(pile, 52, 268, 0, 1 - pileP, 1 - pileP);
      const fp = backOut(seg(t, 2.1, 2.5), 2);
      tf(flag, AX, AY - 3, wobble(seg(t, 2.4, 4.4), 5, 1.2) * 12, Math.max(0.001, fp), Math.max(0.001, fp));
      pL.setAttribute('opacity', cp > 0.5 ? 0 : 1); pR.setAttribute('opacity', cp > 0.5 ? 0 : 1);
      // ペグ：寝ている → 立つ → 打ち込まれる
      const stA = easeOut(seg(t, 1.95, 2.2)), stB = easeOut(seg(t, 3.0, 3.25));
      tf(pegA, PA[0], PA[1] + sink(hitsA, t) * 4.2, lerp(-80, 0, stA));
      tf(pegB, PB[0], PB[1] + sink(hitsB, t) * 6, lerp(-80, 0, stB));
      const rp = easeOut(seg(t, 2.8, 3.1)), rq = easeOut(seg(t, 3.7, 4.0));
      ropeA.setAttribute('opacity', rp * 0.7); ropeB.setAttribute('opacity', rq * 0.7);
      k.set(ropeA, { y2: PA[1] - 16 + sink(hitsA, t) * 4.2 }); k.set(ropeB, { y2: PB[1] - 16 + sink(hitsB, t) * 6 });
      // まめ：作業
      const x = lerp(330, 316, easeInOut(seg(t, 2.8, 3.3)));
      const ya = swingAngle(t);
      const raise = hump(seg(t, 0.7, 1.6));
      const spread = hump(seg(t, 1.5, 2.1));
      const phase3 = t >= 2.0 && t < 3.8;
      const armR = phase3 ? ya : t < 0.7 ? 70 : t < 2.0 ? 70 + raise * 60 + spread * 20 : 8;
      b.pose({
        x, y: 270, armR, armL: phase3 ? 20 : 8 + raise * 110 + spread * 60,
        lean: phase3 ? 6 : 0, mood: t > 3.85 ? 'grin' : 'smile', look: 0.5,
        walk: t > 2.8 && t < 3.3 ? (t - 2.8) * 16 : 0
      });
      const hp = b.handPos('R');
      const holding = t < 3.9;
      mallet.setAttribute('opacity', holding ? 1 : 0);
      // 木づちは腕の延長方向に持つ
      tf(mallet, hp.x, hp.y, armR, S, S);
    }
  };
}
