// clean up：床に散らかったおもちゃを拾って箱へ片づけ、部屋がきれいになる（例文 Let's clean up the room before dinner.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';

export const meta = { duration: 4.8, beats: [[0, '散らかった部屋'], [2.0, '拾って片づける'], [4.1, 'きれいになった']] };

const hand = (b) => {
  const m = b.armR.hand.getCTM && b.armR.hand.getCTM();
  if (!m) return b.handPos('R');
  return { x: m.c * 26 + m.e, y: m.d * 26 + m.f };
};

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 150, y: 46, width: 80, height: 58, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 190, y1: 46, x2: 190, y2: 104, stroke: '#fff', 'stroke-width': 4 });
  el('ellipse', { cx: 190, cy: 262, rx: 120, ry: 20, fill: '#F1D9CF' });
  // 夕食のテーブル（右）
  const tb = g({});
  el('rect', { x: 330, y: 190, width: 80, height: 8, rx: 3, fill: pal.wood }, tb);
  el('rect', { x: 340, y: 198, width: 7, height: 38, fill: pal.woodDark }, tb);
  el('ellipse', { cx: 366, cy: 188, rx: 16, ry: 3.5, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, tb);
  el('rect', { x: 386, y: 176, width: 10, height: 12, rx: 3, fill: pal.water }, tb);
  k.shadow(372, 237, 40, 4);
  // 箱の奥
  el('rect', { x: 34, y: 188, width: 80, height: 14, rx: 3, fill: '#8A6A4C' });
  const mk = (kind) => {
    const n = g({});
    if (kind === 'block') { el('rect', { x: -10, y: -10, width: 20, height: 20, rx: 3, fill: pal.red }, n); el('circle', { r: 4, fill: '#fff', opacity: 0.6 }, n); }
    else if (kind === 'ball') { el('circle', { r: 11, fill: pal.blue }, n); el('path', { d: 'M -11 0 Q 0 -7 11 0', stroke: '#fff', 'stroke-width': 3, fill: 'none' }, n); }
    else { el('rect', { x: -14, y: -5, width: 28, height: 10, rx: 2, fill: pal.green }, n); el('rect', { x: -12, y: -3, width: 24, height: 3, fill: '#fff', opacity: 0.8 }, n); }
    return n;
  };
  const shadows = [0, 1, 2].map(() => k.shadow(0, 237, 13, 3));
  const b = k.buddy({ x: 285, y: FY, scale: 0.85, facing: -1 });
  const items = [mk('block'), mk('ball'), mk('book')];
  const rest = [{ x: 244, y: 224 }, { x: 205, y: 224 }, { x: 166, y: 228 }];
  const land = [{ x: 78, y: 208 }, { x: 62, y: 206 }, { x: 90, y: 210 }];
  // 箱の前面
  const front = g({});
  el('rect', { x: 30, y: 198, width: 88, height: 38, rx: 5, fill: pal.wood }, front);
  el('rect', { x: 30, y: 198, width: 88, height: 8, rx: 4, fill: pal.woodDark }, front);
  el('rect', { x: 66, y: 210, width: 16, height: 10, rx: 3, fill: pal.yellowDark }, front);
  k.shadow(74, 237, 48, 5);
  const stars = [0, 1, 2].map(() => {
    const s = g({});
    el('path', { d: 'M 0 -9 L 3 -3 L 9 0 L 3 3 L 0 9 L -3 3 L -9 0 L -3 -3 Z', fill: pal.yellow }, s);
    return s;
  });

  const S = [0.3, 1.5, 2.7], XS = [285, 245, 206];
  function poseAt(t) {
    let x = XS[0], arm = 12, sq = 1, lean = 0, walking = false, wph = 0;
    for (let i = 0; i < 3; i++) {
      const u = t - S[i];
      if (u < -0.01) break;
      x = XS[i];
      const c = easeInOut(seg(u, 0, 0.3)) * (1 - easeInOut(seg(u, 0.4, 0.65)));
      sq = 1 - 0.2 * c; lean = 12 * c;
      const prev = i === 0 ? 12 : 20;
      if (u < 0.3) arm = lerp(prev, 38, easeOut(seg(u, 0, 0.3)));
      else if (u < 0.4) arm = 38;
      else if (u < 0.65) arm = lerp(38, 95, easeInOut(seg(u, 0.4, 0.65)));
      else if (u < 0.85) arm = lerp(95, 150, easeIn2(seg(u, 0.65, 0.85)));
      else arm = lerp(150, 20, easeInOut(seg(u, 0.9, 1.2)));
      if (i < 2 && u > 0.95) {
        const w = seg(u, 0.95, 1.2);
        x = lerp(XS[i], XS[i + 1], easeInOut(w));
        walking = w > 0 && w < 1; wph = t * 10;
      }
    }
    if (t > 3.9) arm = lerp(arm, 12, easeInOut(seg(t, 3.9, 4.2)));
    return { x, armR: arm, armL: 8, squash: sq, lean, walk: walking ? wph : 0, mood: t > 3.9 ? 'grin' : 'flat', look: 0.5 };
  }
  function easeIn2(p) { return p * p; }

  return {
    update(t) {
      const items_p = items.map((n, i) => {
        const s = S[i], r = s + 0.85;
        if (t < s + 0.15) return rest[i];
        if (t < r) return null; // 手の中
        b.pose(poseAt(r)); const h = hand(b);
        const f = seg(t, r, r + 0.45);
        return { x: lerp(h.x, land[i].x, f), y: lerp(h.y, land[i].y, f * f) - 4 * 36 * f * (1 - f) * (1 - f * 0.0) };
      });
      b.pose(poseAt(t));
      const h = hand(b);
      items.forEach((n, i) => {
        let p = items_p[i];
        if (p === null) {
          const f = easeOut(seg(t, S[i] + 0.15, S[i] + 0.32));
          p = { x: lerp(rest[i].x, h.x, f), y: lerp(rest[i].y, h.y, f) };
        }
        tf(n, p.x, p.y);
        const onFloor = t < S[i] + 0.15;
        shadows[i].setAttribute('opacity', onFloor ? 1 : 0);
        tf(shadows[i], rest[i].x, 0);
      });
      // 完成のきらめき
      const sp = seg(t, 3.95, 4.6);
      [[150, 214], [215, 205], [110, 180]].forEach(([x, y], i) => {
        const q = seg(sp, i * 0.15, i * 0.15 + 0.6);
        tf(stars[i], x, y - 8 * q, q * 80, 0.2 + hump(q));
        stars[i].setAttribute('opacity', q > 0 && q < 1 ? 1 : 0);
      });
    }
  };
}
