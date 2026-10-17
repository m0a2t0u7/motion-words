// pass around：写真の束を、人から人へ順に回していく（例文 Please pass the photos around.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { hp, grip, decor } from './hand-over.js';

export const meta = { duration: 4.6, beats: [[0, '1人目が持つ'], [1.2, '2人目へ渡す'], [2.9, '3人目に回る']] };

function photo(k, g) {
  const { el, pal } = k;
  [[0, 0], [2, -2], [4, -4]].forEach(([dx, dy], i) => {
    el('rect', { x: -14 + dx, y: -11 + dy, width: 28, height: 22, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, g);
  });
  el('rect', { x: -10 + 4, y: -7 - 4, width: 20, height: 12, fill: '#BFE3F7' }, g);
  el('path', { d: 'M -10 1 L -4 -5 L 2 1 L 6 -3 L 10 1 Z', transform: 'translate(4 -4)', fill: pal.green }, g);
  el('circle', { cx: 10, cy: -9, r: 2.8, fill: pal.yellow }, g);
}

export function create(k) {
  const { g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 246, mood: 'indoor' });
  decor(k, FY);
  const S = 1;
  const A = k.buddy({ x: 70, y: FY, scale: S });
  const B = k.buddy({ x: 200, y: FY, scale: S, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const C = k.buddy({ x: 330, y: FY, scale: S, color: pal.blue, dark: pal.blueDark, facing: -1 });
  const ph = g({}); photo(k, ph);
  const gA = grip(k, pal.mint, pal.mintDark, S), gB = grip(k, pal.coral, pal.coralDark, S), gC = grip(k, pal.blue, pal.blueDark, S);
  return {
    update(t) {
      // A→B：Bが左向きで受け取る。Bが右を向いてC へ渡す。
      const a1 = easeInOut(seg(t, 0.5, 1.1)), a2 = easeInOut(seg(t, 1.7, 2.2));
      const b1 = easeInOut(seg(t, 0.9, 1.4)), b2 = easeInOut(seg(t, 2.1, 2.6));
      const turn = t > 2.0;
      const c1 = easeInOut(seg(t, 2.5, 3.0)), c2 = easeInOut(seg(t, 3.4, 4.0));
      A.pose({ armR: lerp(lerp(30, 88, a1), 20, a2), armL: 10, look: 0.4, mood: 'smile' });
      B.pose({ facing: turn ? 1 : -1, armR: turn ? lerp(30, 88, easeInOut(seg(t, 2.0, 2.5))) * (1 - easeInOut(seg(t, 3.0, 3.5))) + 22 * easeInOut(seg(t, 3.0, 3.5)) : lerp(30, 88, b1), armL: 10, look: 0.4,
        mood: 'smile', lean: 2 * hump(seg(t, 1.8, 2.3)) });
      C.pose({ armR: lerp(lerp(20, 88, c1), 30, c2), armL: 10, look: lerp(0.4, -0.2, c2), mood: t > 3.1 ? 'open' : 'smile', squash: 1 - 0.05 * hump(seg(t, 3.0, 3.4)), lean: 6 * c2 });
      const hA = hp(A, S), hB = hp(B, S), hC = hp(C, S);
      let p;
      if (t < 1.1) p = { x: hA.x + 2, y: hA.y - 10 };
      else if (t < 1.6) { const m = easeInOut(seg(t, 1.1, 1.45)); p = { x: lerp(hA.x + 2, hB.x - 2, m), y: lerp(hA.y - 10, hB.y - 10, m) }; }
      else if (t < 2.6) p = { x: hB.x - 2 * B.state.facing, y: hB.y - 10 };
      else { const m = easeInOut(seg(t, 2.6, 3.0)); p = { x: lerp(hB.x, hC.x - 2, m), y: lerp(hB.y - 10, hC.y - 10, m) }; }
      if (t >= 3.0) p = { x: hC.x - 2, y: hC.y - 10 };
      tf(ph, p.x, p.y, lerp(-6, 4, seg(t, 1.1, 3.0)));
      gA(hA); gB(hB); gC(hC);
    }
  };
}
