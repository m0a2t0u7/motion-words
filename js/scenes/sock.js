// sock：片方の靴下を持って、もう片方を家じゅう探す（ソファの下・引き出し）が見つからない（例文 I can't find my other sock anywhere in the house.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { wardrobe, gait, held, P, blinkAt } from './skirt.js';
import { sofa } from './run-after.js';
import { mark } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '片方だけ'], [1.0, 'あちこち探す'], [3.4, '見つからない']] };

export function sockShape(k, parent, c1 = '#FF8E77', c2 = '#fff') {
  const g = k.g({}, parent);
  k.el('path', { d: 'M -6 0 L 6 0 L 6 20 Q 18 20 18 28 Q 18 34 10 34 L -2 34 Q -8 34 -6 26 Z', fill: c1 }, g);
  [6, 13].forEach((y) => k.el('rect', { x: -6, y, width: 12, height: 3.5, fill: c2 }, g));
  k.el('rect', { x: -7, y: -2, width: 14, height: 5, rx: 2, fill: c2 }, g);
  return g;
}

export function create(k) {
  const { el, g, pal, tf } = k, S = 1.15;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  el('rect', { x: 160, y: 50, width: 80, height: 62, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const so = sofa(k, 80, FY, 120);
  so.front();
  // たんす（右）
  k.shadow(356, FY + 1, 46, 4);
  el('rect', { x: 312, y: 128, width: 88, height: FY - 128, rx: 4, fill: pal.wood });
  const drw = [0, 1].map((i) => {
    const d = g({});
    el('rect', { x: -40, y: 0, width: 80, height: 40, rx: 3, fill: '#EBD1A8', stroke: pal.woodDark, 'stroke-width': 2 }, d);
    el('rect', { x: -10, y: 16, width: 20, height: 5, rx: 2.5, fill: pal.woodDark }, d);
    return d;
  });
  const b = k.buddy({ x: 190, y: FY, scale: S });
  const W = wardrobe(k, b);
  W.top({ color: pal.violet, dark: '#8C70DD', sleeve: 'long', to: -16 });
  W.bottom({ kind: 'trousers', color: '#596377', dark: '#444D5F', from: -16 });
  // 片足だけ靴下、もう片足ははだし
  sockShape(k, W.legs[0], pal.coral);
  W.legs[0].lastChild.setAttribute('transform', 'translate(0 -10) scale(0.5)');
  const bare = el('ellipse', { cx: 3, cy: 18, rx: 9, ry: 4, fill: pal.mint }, W.legs[1]);
  const sk = sockShape(k, k.root, pal.coral);
  const q = mark(k, 'q', k.root, 1.6);
  // 位置：中央 → ソファ前 → たんす前 → 中央
  const xf = (t) => t < 1.8 ? lerp(190, 150, easeInOut(seg(t, 0.7, 1.2))) : lerp(lerp(150, 236, easeInOut(seg(t, 1.8, 2.4))), 200, easeInOut(seg(t, 3.3, 3.8)));
  return {
    update(t) {
      const p = gait(xf, t, 190);
      const look1 = hump(seg(t, 1.15, 1.85)), look2 = hump(seg(t, 2.4, 3.3)), shrug = easeOut(seg(t, 3.8, 4.1));
      const goingRight = t > 1.8 && t < 3.3;
      P(b, { x: p.x, walk: p.walk, facing: goingRight ? 1 : t > 3.3 ? 1 : -1, lean: p.lean + 34 * look1 + 12 * look2,
        armL: t < 3.8 ? 45 + p.armL * 0.2 : lerp(45, 120, shrug), armR: lerp(p.armR, 80, look2) * (1 - shrug) + 120 * shrug,
        look: 0.5, mood: t > 3.6 ? 'sad' : 'flat', blink: blinkAt(t) });
      held(k, b, S, sk, 'L', 0, 22);
      // 引き出しを開けて中を見る
      const op = easeInOut(seg(t, 2.4, 2.75)) * (1 - easeInOut(seg(t, 3.0, 3.3)));
      drw.forEach((d, i) => tf(d, 356 - (i ? 0 : 26 * op), 140 + i * 48, 0, 1 + (i ? 0 : 0.04 * op)));
      tf(q, p.x + 4, FY - 130 - 4 * hump(seg(t, 3.7, 4.1)), 0, t > 3.6 ? easeOut(seg(t, 3.6, 3.9)) * 1.6 : 0.001);
      void bare;
    }
  };
}
