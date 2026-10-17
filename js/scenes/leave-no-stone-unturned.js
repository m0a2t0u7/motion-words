// leave no stone unturned：二人で捜しもの。並んだ石を一つずつひっくり返し、全部の下を確かめる（They left no stone unturned in their search.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '石が並ぶ'], [1.6, '次々めくる'], [3.6, '全部めくった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 214, mood: 'outdoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 90, fill: '#E7DFCF' });
  // 捜し物の貼り紙（鍵の絵）
  el('rect', { x: 366, y: 70, width: 4, height: FY - 70, fill: pal.woodDark });
  el('rect', { x: 346, y: 64, width: 44, height: 50, rx: 4, fill: '#fff', stroke: '#CBD3DF', 'stroke-width': 2 });
  el('circle', { cx: 361, cy: 84, r: 7, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 4 });
  el('path', { d: 'M 367 88 L 380 100 M 376 96 l 4 -4 M 372 92 l 4 -4', stroke: pal.yellowDark, 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round' });
  const Y = FY + 36;
  const xs = [62, 110, 158, 232, 280, 328];
  const stones = xs.map((x, i) => {
    const hole = el('ellipse', { cx: x, cy: Y + 2, rx: 12, ry: 4, fill: '#B9AD96' });
    return { x, hole, sh: k.shadow(x, Y + 2, 16, 3.5) };
  });
  const mint = k.buddy({ x: 44, y: Y + 4 });
  const coral = k.buddy({ x: 214, y: Y + 4, color: pal.coral, dark: pal.coralDark });
  const nodes = stones.map((s, i) => {
    const n = g({});
    const top = el('path', { d: 'M -14 0 Q -16 -16 0 -18 Q 16 -16 14 0 Z', fill: '#98A2B3' }, n);
    const hi = el('path', { d: 'M -8 -8 Q -4 -14 4 -13', stroke: '#C2CAD6', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, n);
    const under = el('path', { d: 'M -14 0 Q -16 -16 0 -18 Q 16 -16 14 0 Z', fill: '#C8B79A', opacity: 0 }, n);
    const dirt = el('path', { d: 'M -8 -6 q 4 -5 8 0 M 2 -10 q 4 -4 7 0', stroke: '#8E7C5E', 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round', opacity: 0 }, n);
    return { n, top, hi, under, dirt };
  });
  const bug = el('ellipse', { cx: stones[1].x + 30, cy: Y - 2, rx: 6, ry: 3.4, fill: '#7A8597' });
  // 各石の開始時刻（ミント：0〜2、コーラル：3〜5番目）
  const T = [0.9, 1.6, 2.3, 1.1, 1.8, 2.5];
  return {
    update(t) {
      let mAct = 0, cAct = 0, mx = 44, cx = 214;
      stones.forEach((s, i) => {
        const p = easeInOut(seg(t, T[i], T[i] + 0.55));
        const nd = nodes[i], dir = i < 3 ? 1 : -1;
        // 石は右端（ミント）/左端（コーラル）を支点に180度回転して裏返る
        const pivx = s.x + dir * 12;
        const rot = dir * 180 * p;
        nd.n.setAttribute('transform', `translate(${pivx} ${Y}) rotate(${rot}) translate(${-dir * 12} 0)`);
        nd.n.setAttribute('transform', `translate(${(pivx).toFixed(1)} ${(Y - 24 * hump(p)).toFixed(1)}) rotate(${rot.toFixed(1)}) translate(${-dir * 12} 0) scale(0.85)`);
        const flipped = p > 0.5;
        nd.top.setAttribute('fill', flipped ? '#C8B79A' : '#98A2B3');
        nd.hi.setAttribute('opacity', flipped ? 0 : 1);
        nd.dirt.setAttribute('opacity', flipped ? 1 : 0);
        s.hole.setAttribute('opacity', p > 0 ? 1 : 0);
        k.set(s.sh, { opacity: p > 0 ? 0 : 1 });
      });
      // 位置：手前の石に寄って屈み、めくる
      const target = (list, ts, dir) => {
        let idx = 0;
        list.forEach((i) => { if (t >= ts[i] - 0.5) idx = list.indexOf(i); });
        return idx;
      };
      const mi = target([0, 1, 2], T, 1), ci = target([3, 4, 5], T, -1);
      const pm = (i) => easeInOut(seg(t, T[i], T[i] + 0.55)), pc = (i) => pm(i);
      const bx = (i, list) => stones[list[i]].x;
      const mxT = [stones[0].x - 40, stones[1].x - 40, stones[2].x - 40], cxT = [stones[3].x + 28, stones[4].x + 28, stones[5].x + 28];
      const mmx = lerp(mxT[Math.max(0, mi - 1)], mxT[mi], easeInOut(seg(t, T[mi] - 0.5, T[mi] - 0.05)));
      const ccx = lerp(cxT[Math.max(0, ci - 1)], cxT[ci], easeInOut(seg(t, T[3 + ci] - 0.5, T[3 + ci] - 0.05)));
      const fm = hump(seg(t, T[mi] - 0.05, T[mi] + 0.7)), fc = hump(seg(t, T[3 + ci] - 0.05, T[3 + ci] + 0.7));
      const movM = t < T[0] - 0.05 ? 0 : 1;
      const wm = seg(t, T[mi] - 0.5, T[mi] - 0.05), wc = seg(t, T[3 + ci] - 0.5, T[3 + ci] - 0.05);
      const done = easeOut(seg(t, 3.5, 4.0));
      const mStart = lerp(44, mxT[0], easeInOut(seg(t, 0.2, 0.85)));
      const cStart = lerp(214, cxT[0], easeInOut(seg(t, 0.4, 1.05)));
      const mxx = t < T[0] ? mStart : mmx, cxx = t < T[3] ? cStart : ccx;
      const walkM = (t < T[0] ? seg(t, 0.2, 0.85) : wm) % 1, walkC = (t < T[3] ? seg(t, 0.4, 1.05) : wc) % 1;
      const mm = (t < T[0] ? (t > 0.2 && t < 0.85) : (wm > 0 && wm < 1)), cm = (t < T[3] ? (t > 0.4 && t < 1.05) : (wc > 0 && wc < 1));
      mint.pose({ x: mxx, y: Y + 4, walk: mm ? t * 12 : 0, lean: lerp(8 + 22 * fm, 0, done), squash: 1 - 0.1 * fm, armR: lerp(30 + 50 * fm, 8, done), armL: 20, look: 0.7, mood: done > 0.3 ? 'flat' : 'open', blink: 0 });
      coral.pose({ x: cxx, y: Y + 4, facing: -1, walk: cm ? t * 12 : 0, lean: lerp(8 + 22 * fc, 0, done), squash: 1 - 0.1 * fc, armR: lerp(30 + 50 * fc, 8, done), armL: 20, look: 0.7, mood: done > 0.3 ? 'flat' : 'open', blink: 0 });
      bug.setAttribute('opacity', pm(1) > 0.5 ? 1 : 0);
      k.set(bug, { cx: stones[1].x + 22 + 6 * pm(1) });
    }
  };
}
