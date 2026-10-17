// set up：支柱を1本ずつ立て、布を支柱に沿って張り上げ、木づちで杭を打ってテントを組み立てる（例文 We set up the tent by the lake.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, hump, wobble } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '部品を広げる'], [0.4, '立てて張る'], [2.5, '杭を打つ']] };

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

  const AX = 150, AY = 140, LB = [88, 254], RB = [212, 254], RLY = 270;
  const LEN = Math.hypot(AX - LB[0], AY - LB[1]);
  const angL = Math.atan2(AY - LB[1], AX - LB[0]), angR = Math.atan2(AY - RB[1], AX - RB[0]) + Math.PI * 2;
  // 布の山（部品）
  const pile = g({});
  el('ellipse', { cx: 0, cy: 4, rx: 36, ry: 6, fill: pal.shadow }, pile);
  el('path', { d: 'M -34 0 Q -30 -26 -8 -24 Q 8 -34 28 -18 Q 40 -8 34 0 Z', fill: pal.coral }, pile);
  el('path', { d: 'M -20 -2 Q -4 -14 14 -2', stroke: pal.coralDark, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, pile);
  // テント（布）：下から少しずつ見えてくる
  let revealRect;
  const clipUrl = k.clip((cp) => { revealRect = el('rect', { x: 0, y: 262, width: 400, height: 300 }, cp); });
  const clipG = g({ 'clip-path': clipUrl });
  const tent = g({}, clipG);
  el('path', { d: `M ${LB[0] - 4} 256 L ${AX} ${AY - 4} L ${RB[0] + 4} 256 Z`, fill: pal.coral, stroke: pal.coral, 'stroke-width': 4, 'stroke-linejoin': 'round' }, tent);
  el('path', { d: `M ${AX} ${AY} L ${RB[0]} 254 L ${AX} 254 Z`, fill: pal.coralDark, opacity: 0.35 }, tent);
  el('path', { d: `M ${AX} 172 L ${AX - 24} 254 L ${AX + 24} 254 Z`, fill: '#8C4639' }, tent);
  el('path', { d: `M ${AX} 172 L ${AX - 24} 254 L ${AX - 4} 254 Z`, fill: pal.coral, opacity: 0.55 }, tent);
  el('rect', { x: LB[0] - 8, y: 252, width: RB[0] - LB[0] + 16, height: 6, rx: 3, fill: pal.coralDark }, tent);
  // 支柱（布の上に重ねて、骨組みが見えるようにする）
  const mkPole = () => el('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: '#98A3B4', 'stroke-width': 5, 'stroke-linecap': 'round' });
  const pL = mkPole(), pR = mkPole();
  const flag = g({});
  el('line', { x1: 0, y1: 0, x2: 0, y2: -22, stroke: pal.woodDark, 'stroke-width': 3, 'stroke-linecap': 'round' }, flag);
  el('path', { d: 'M 0 -22 L 18 -17 L 0 -11 Z', fill: pal.yellow }, flag);
  // 杭とロープ
  const PA = [262, 272], PB = [232, 282], SINK = 5;
  const mkPeg = () => { const p = g({}); el('rect', { x: -2.8, y: -18, width: 5.6, height: 20, rx: 2, fill: pal.yellowDark }, p); el('rect', { x: -6, y: -20, width: 12, height: 5, rx: 2, fill: pal.yellow }, p); return p; };
  const pegA = mkPeg(), pegB = mkPeg();
  const mkRope = (x1, y1) => el('line', { x1, y1, x2: 0, y2: 0, stroke: pal.ink, 'stroke-width': 2, 'stroke-linecap': 'round', opacity: 0 });
  const ropeA = mkRope(200, 226), ropeB = mkRope(RB[0] + 4, 254);
  // まめ（木づちを持つ）
  const S = 0.95;
  const b = k.buddy({ x: 290, y: 270, scale: S, facing: -1 });
  const mallet = g({});
  el('line', { x1: 0, y1: 0, x2: 0, y2: 26, stroke: pal.woodDark, 'stroke-width': 5, 'stroke-linecap': 'round' }, mallet);
  el('rect', { x: -9, y: 26, width: 18, height: 12, rx: 3, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 2 }, mallet);

  // 打つ時刻。木づちの頭が杭の頭にちょうど届く腕の角度と、まめの立ち位置を計算で決める。
  const HITS_A = [2.6, 3.0], HITS_B = [3.7, 4.08];
  const headDX = (a) => -(27 + 26 * Math.sin(a)) * S - 32 * S * Math.sin(a);
  const angFor = (headY) => Math.acos(Math.min(1, Math.max(-1, ((headY - 270) / S + 56) / 58)));
  const plan = (peg, hits) => {
    const ang = hits.map((_, i) => angFor(peg[1] - 20 + SINK * i - 6));
    const x = peg[0] - ang.reduce((m, a) => m + headDX(a), 0) / ang.length;
    return { ang: ang.map((a) => (a * 180) / Math.PI), x };
  };
  const pa = plan(PA, HITS_A), pb = plan(PB, HITS_B);
  // 腕の角度のキー（時刻, 角度, 補間）。振りかぶる → 打つ（加速）→ はね返り → 構え直し
  const REST = 40, UP = 145;
  const keys = [[0, REST, easeOut], [2.2, REST, easeOut]];
  [[HITS_A, pa], [HITS_B, pb]].forEach(([hits, pl]) => hits.forEach((h, i) => {
    keys.push([h - 0.15, UP, easeOut], [h, pl.ang[i], easeIn], [h + 0.07, pl.ang[i] - 12, easeOut]);
    keys.push([h + 0.2, REST, easeOut]);
  }));
  const swing = (t) => {
    let prev = keys[0];
    for (let i = 1; i < keys.length; i++) {
      const kk = keys[i];
      if (t <= kk[0]) return lerp(prev[1], kk[1], kk[2](seg(t, prev[0], kk[0])));
      prev = kk;
    }
    return REST;
  };
  const sinkOf = (hits, t) => SINK * hits.reduce((m, h) => m + easeOut(seg(t, h, h + 0.06)), 0);

  return {
    update(t) {
      ripples.forEach((r, i) => r.setAttribute('x', 30 + i * 80 + Math.sin(t * 1.1 + i * 1.7) * 10));
      // 1. 支柱を1本ずつ立てる（0.3〜1.2秒）
      const uL = easeInOut(seg(t, 0.3, 0.75)), uR = easeInOut(seg(t, 0.75, 1.2));
      const aL = lerp(0.0, angL, uL), aR = lerp(Math.PI, angR, uR);
      const ryR = lerp(RLY, RB[1], uR);
      k.set(pL, { x1: LB[0], y1: LB[1], x2: LB[0] + Math.cos(aL) * LEN, y2: LB[1] + Math.sin(aL) * LEN });
      k.set(pR, { x1: RB[0], y1: ryR, x2: RB[0] + Math.cos(aR) * LEN, y2: ryR + Math.sin(aR) * LEN });
      // 2. 布が支柱に沿って上がる（1.2〜2.2秒）
      const cl = easeInOut(seg(t, 1.2, 2.2));
      k.set(revealRect, { y: lerp(262, AY - 12, cl) });
      const wob = t > 2.2 ? wobble(seg(t, 2.2, 2.8), 3, 5) * 0.02 : 0;
      tent.setAttribute('transform', `translate(${AX} 256) scale(${(1 + wob).toFixed(4)} 1) translate(${-AX} -256)`);
      const pileP = easeIn(seg(t, 1.2, 2.1));
      tf(pile, 56, 266, 0, 1 - pileP, 1 - pileP);
      const fp = backOut(seg(t, 2.1, 2.45), 2);
      tf(flag, AX, AY - 3, wobble(seg(t, 2.3, 4.4), 5, 1.2) * 12, Math.max(0.001, fp), Math.max(0.001, fp));
      // 3. 杭を打つ
      const stA = easeOut(seg(t, 1.9, 2.25)), stB = easeOut(seg(t, 3.05, 3.4));
      const sa = sinkOf(HITS_A, t), sb = sinkOf(HITS_B, t);
      tf(pegA, PA[0], PA[1] + sa, lerp(-80, 0, stA));
      tf(pegB, PB[0], PB[1] + sb, lerp(-80, 0, stB));
      const ra = easeOut(seg(t, 3.1, 3.35)), rb = easeOut(seg(t, 4.15, 4.4));
      ropeA.setAttribute('opacity', ra * 0.7); ropeB.setAttribute('opacity', rb * 0.7);
      k.set(ropeA, { x2: PA[0], y2: PA[1] - 16 + sa }); k.set(ropeB, { x2: PB[0], y2: PB[1] - 16 + sb });
      // まめ：支柱・布のとき手を上げて手伝い、杭のときは木づちで打つ
      const x = lerp(lerp(290, pa.x, easeInOut(seg(t, 1.85, 2.3))), pb.x, easeInOut(seg(t, 3.1, 3.5)));
      const walking = (t > 1.85 && t < 2.3) || (t > 3.1 && t < 3.5);
      const peg = t >= 2.2;
      const help = hump(seg(t, 0.3, 1.2)) * 0.85 + hump(seg(t, 1.25, 2.1)) * 0.65;
      const armR = peg ? swing(t) : 25 + help * 120;
      const armL = peg ? 12 : 25 + help * 110;
      const hitNow = [...HITS_A, ...HITS_B].some((h) => t >= h && t < h + 0.07);
      b.pose({
        x, y: 270, armR, armL, lean: peg ? 0 : 3, squash: hitNow ? 0.97 : 1,
        mood: t > 4.2 ? 'grin' : 'smile', look: peg ? 0.6 : 0.2,
        walk: walking ? t * 14 : 0
      });
      const hp = b.handPos('R');
      mallet.setAttribute('opacity', peg ? 1 : 0);
      tf(mallet, hp.x, hp.y, armR, S, S);
    }
  };
}
