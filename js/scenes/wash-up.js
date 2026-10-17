// wash up：食後の汚れた皿を流しでこすり洗いし、水切りかごに立てていく（例文 I'll wash up after dinner.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';

export const meta = { duration: 4.8, beats: [[0, '汚れた皿'], [1.3, 'こすり洗い'], [3.9, '洗い終わり']] };

const hand = (b) => {
  const m = b.armR.hand.getCTM && b.armR.hand.getCTM();
  if (!m) return b.handPos('R');
  return { x: m.c * 26 + m.e, y: m.d * 26 + m.f };
};

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 壁のタイル
  for (let y = 60; y < 150; y += 22) for (let x = (y / 22) % 2 ? 0 : -20; x < 400; x += 40) el('rect', { x: x + 2, y: y + 2, width: 36, height: 18, rx: 3, fill: '#fff', opacity: 0.7 });
  // 蛇口
  el('rect', { x: 186, y: 122, width: 8, height: 30, rx: 3, fill: '#B8C2D0' });
  el('path', { d: 'M 190 126 Q 190 116 204 116 L 214 116 L 214 124', fill: 'none', stroke: '#B8C2D0', 'stroke-width': 7, 'stroke-linecap': 'round' });
  // カウンター（天板と前面）
  el('rect', { x: 0, y: 150, width: 400, height: 28, fill: '#F5F0E8' });
  el('rect', { x: 0, y: 176, width: 400, height: 60, fill: pal.wood });
  el('rect', { x: 0, y: 176, width: 400, height: 4, fill: pal.woodDark });
  [60, 150, 240, 330].forEach((x) => { el('rect', { x: x - 38, y: 186, width: 76, height: 44, rx: 4, fill: pal.woodDark, opacity: 0.35 }); el('rect', { x: x - 6, y: 192, width: 12, height: 4, rx: 2, fill: pal.yellowDark }); });
  // シンク
  el('ellipse', { cx: 190, cy: 164, rx: 56, ry: 12, fill: '#CAD3DF' });
  el('ellipse', { cx: 190, cy: 165, rx: 50, ry: 9, fill: pal.water, opacity: 0.85 });
  [[168, 166, 5], [178, 168, 4], [208, 167, 5], [214, 165, 3.5], [160, 163, 3.5]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#fff', opacity: 0.85 }));
  el('rect', { x: 192, y: 163, width: 26, height: 9, rx: 3, fill: pal.yellow });
  el('rect', { x: 192, y: 168, width: 26, height: 4, rx: 2, fill: pal.yellowDark });
  // 水切りかご
  const rack = g({});
  const rackBack = g({});
  el('rect', { x: 256, y: 170, width: 76, height: 8, rx: 3, fill: '#B8C2D0' }, rackBack);
  const b = k.buddy({ x: 156, y: FY, scale: 0.85 });
  // 皿
  const mkPlate = () => {
    const n = g({});
    const inner = g({}, n);
    el('circle', { r: 13, fill: '#fff', stroke: '#C9D2DE', 'stroke-width': 2 }, inner);
    el('circle', { r: 8, fill: 'none', stroke: '#E1E7EF', 'stroke-width': 2 }, inner);
    const dirt = g({}, inner);
    [[-5, -3, 4], [4, 2, 5], [0, 6, 3], [5, -6, 3]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: pal.coffee, opacity: 0.8 }, dirt));
    const foam = g({}, n);
    [[-8, -6, 6], [6, -8, 5], [0, 0, 7], [9, 5, 5], [-7, 7, 5]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#fff', stroke: '#DCEBF5', 'stroke-width': 1.2 }, foam));
    return { n, inner, dirt, foam };
  };
  const P = [mkPlate(), mkPlate()];
  const rackFront = g({});
  el('rect', { x: 256, y: 166, width: 76, height: 3, rx: 1.5, fill: '#9AA6B6' }, rackFront);
  [262, 284, 306, 328].forEach((x) => el('rect', { x: x - 1, y: 160, width: 2, height: 16, fill: '#9AA6B6' }, rackFront));
  const star = g({});
  el('path', { d: 'M 0 -9 L 3 -3 L 9 0 L 3 3 L 0 9 L -3 3 L -9 0 L -3 -3 Z', fill: pal.yellow }, star);

  const S = [0.3, 2.1], BX = 156, XR = [240, 262], SLOT = [274, 296];
  const rest = [{ x: 190, y: 161 }, { x: 194, y: 164 }];
  function poseAt(t) {
    let x = BX, arm = 30, walking = false, wph = 0;
    for (let i = 0; i < 2; i++) {
      const u = t - S[i];
      if (u < 0) break;
      if (u < 0.35) arm = lerp(i ? 20 : 30, 150, easeOut(u / 0.35));
      else if (u < 0.95) { arm = 150 + 5 * Math.sin((u - 0.35) * 22); x = BX + 7 * Math.sin((u - 0.35) * 22); }
      else if (u < 1.45) { const w = easeInOut(seg(u, 0.95, 1.45)); x = lerp(BX, XR[i], w); arm = 150; walking = w > 0 && w < 1; wph = t * 10; }
      else { const w = easeInOut(seg(u, 1.5, 1.85)); x = lerp(XR[i], BX, w); arm = lerp(150, 20, easeInOut(seg(u, 1.45, 1.7))); walking = w > 0 && w < 1; wph = -t * 10; }
    }
    if (t > 3.9) { arm = lerp(20, 12, 1); }
    return { x, armR: arm, armL: 8, walk: walking ? wph : 0, mood: t > 3.9 ? 'grin' : 'smile', look: 0.4 };
  }

  return {
    update(t) {
      b.pose(poseAt(t));
      const h = hand(b);
      P.forEach((p, i) => {
        const u = t - S[i];
        let x, y, sy = 1, dirt = 1, foam = 0;
        if (u < 0.2) { x = rest[i].x; y = rest[i].y; sy = 0.42; }
        else if (u < 1.45) {
          const f = easeOut(seg(u, 0.2, 0.4));
          x = lerp(rest[i].x, h.x, f); y = lerp(rest[i].y, h.y - 8, f); sy = lerp(0.42, 1, f);
          dirt = 1 - seg(u, 0.4, 0.95);
          foam = hump(seg(u, 0.35, 1.25)) * 1.0;
        } else {
          const f = easeOut(seg(u, 1.45, 1.6));
          x = SLOT[i]; y = lerp(h.y - 8, 160, f); dirt = 0;
        }
        tf(p.n, x, y, 0, 1, 1);
        tf(p.inner, 0, 0, 0, 1, sy);
        p.dirt.setAttribute('opacity', dirt);
        p.foam.setAttribute('opacity', Math.min(1, foam * 1.6));
        tf(p.foam, 0, foam > 0 ? 3 * (1 - foam) : 0, 0, 0.6 + 0.5 * foam);
      });
      const q = seg(t, 3.55, 4.2);
      tf(star, 285, 146 - 6 * q, q * 80, 0.2 + 1.1 * hump(q));
      star.setAttribute('opacity', q > 0 && q < 1 ? 1 : 0);
    }
  };
}
