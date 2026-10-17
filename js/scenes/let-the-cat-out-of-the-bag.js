// let the cat out of the bag：口をしばった袋から猫が飛び出し、内緒のプレゼントがばれる（例文 Tom let the cat out of the bag about the gift.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '袋に秘密'], [1.5, '猫が飛び出す'], [3.0, '秘密がばれる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  const A = k.buddy({ x: 100, y: FY, scale: 1.0 });
  const B = k.buddy({ x: 315, y: FY, scale: 1.0, facing: -1, color: pal.coral, dark: pal.coralDark });
  // 猫（原点＝おしり中央）
  const cat = g({});
  el('ellipse', { cx: 0, cy: -10, rx: 15, ry: 14, fill: '#8C94A6' }, cat);
  el('path', { d: 'M -13 -26 L -11 -42 L -3 -30 Z M 13 -26 L 11 -42 L 3 -30 Z', fill: '#8C94A6' }, cat);
  el('circle', { cx: 0, cy: -26, r: 14, fill: '#8C94A6' }, cat);
  el('circle', { cx: -5, cy: -27, r: 2, fill: pal.ink }, cat);
  el('circle', { cx: 5, cy: -27, r: 2, fill: pal.ink }, cat);
  el('path', { d: 'M -2 -22 L 2 -22 L 0 -20 Z', fill: '#FFB4B4' }, cat);
  el('path', { d: 'M 14 -4 Q 30 -8 26 -26', fill: 'none', stroke: '#8C94A6', 'stroke-width': 5, 'stroke-linecap': 'round' }, cat);
  // 袋
  const bagBack = g({}), bagFront = g({});
  tf(bagBack, 200, FY);
  tf(bagFront, 200, FY);
  el('path', { d: 'M -30 0 Q -40 -40 -22 -64 L 22 -64 Q 40 -40 30 0 Z', fill: '#D9B98A' }, bagBack);
  el('path', { d: 'M -30 0 Q -40 -34 -22 -52 Q 0 -44 22 -52 Q 40 -34 30 0 Z', fill: '#E7CBA0' }, bagFront);
  const knot = g({ transform: 'translate(0 -56)' }, bagFront);
  el('path', { d: 'M -22 0 Q 0 8 22 0 L 16 -10 Q 0 -4 -16 -10 Z', fill: '#C9A577' }, knot);
  el('line', { x1: -8, y1: -22, x2: -12, y2: -6, stroke: '#C9A577', 'stroke-width': 4, 'stroke-linecap': 'round' }, knot);
  el('line', { x1: 8, y1: -22, x2: 12, y2: -6, stroke: '#C9A577', 'stroke-width': 4, 'stroke-linecap': 'round' }, knot);
  k.shadow(200, FY + 3, 36, 5, bagBack);
  const bagGlyph = k.text(200, FY - 28, '?', { 'font-size': 22, fill: pal.sub }, bagFront);
  // プレゼント
  const gift = g({});
  el('rect', { x: -22, y: -20, width: 44, height: 34, rx: 5, fill: pal.violet }, gift);
  el('rect', { x: -4, y: -20, width: 8, height: 34, fill: pal.yellow }, gift);
  el('rect', { x: -22, y: -6, width: 44, height: 7, fill: pal.yellow }, gift);
  el('path', { d: 'M 0 -20 Q -16 -36 -10 -22 Z M 0 -20 Q 16 -36 10 -22 Z', fill: pal.yellowDark }, gift);
  const bub = g({});
  el('ellipse', { rx: 46, ry: 36, fill: '#fff', stroke: '#CBD3DE', 'stroke-width': 2.5 }, bub);
  el('path', { d: 'M -20 28 L -34 52 L -4 34 Z', fill: '#fff', stroke: '#CBD3DE', 'stroke-width': 2.5 }, bub);
  el('ellipse', { rx: 45, ry: 35, fill: '#fff' }, bub);
  bub.appendChild(gift);
  const ex = g({});
  k.text(0, 0, '!', { 'font-size': 28, fill: pal.red }, ex);
  const flash = g({});
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; el('line', { x1: Math.cos(a) * 14, y1: Math.sin(a) * 14, x2: Math.cos(a) * 26, y2: Math.sin(a) * 26, stroke: pal.yellowDark, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, flash); }
  return {
    update(t) {
      const pop = seg(t, 1.5, 2.1);
      // 袋が膨らんで、ぴょんと猫が出る
      const bulge = 1 + 0.08 * hump(seg(t, 1.2, 1.5));
      tf(bagBack, 200, FY, 0, bulge, bulge);
      tf(bagFront, 200, FY, 0, bulge, bulge);
      const cy = FY - 52 - 70 * Math.sin(easeOut(pop) * Math.PI * 0.5) + 70 * easeIn(seg(t, 2.1, 2.6)) * 0.0;
      const jump = easeOut(seg(t, 1.5, 1.95));
      const fall = easeIn(seg(t, 1.95, 2.55));
      const cx = lerp(200, 240, easeOut(seg(t, 1.5, 2.6)));
      const yy = FY - 50 - 60 * jump + (60 * jump + 50 - 6) * fall;
      tf(cat, cx, yy, lerp(0, 20, jump) - 20 * fall, 1, 1);
      cat.setAttribute('opacity', t < 1.5 ? 0 : 1);
      // 猫は袋の前面より奥から出るので、袋の手前を再描画順で重ねる
      bagGlyph.setAttribute('opacity', t < 1.5 ? 1 : 0);
      tf(flash, 200, FY - 64, 0, 0.5 + pop, 0.5 + pop);
      flash.setAttribute('opacity', pop > 0 && pop < 1 ? 1 - pop : 0);
      // まめ A：袋を押さえていて、猫が出てあわあわ
      A.pose({
        armR: t < 1.2 ? 60 : lerp(60, 140, easeOut(seg(t, 1.7, 2.0))), armL: t < 1.2 ? 60 : 130,
        mood: t < 1.5 ? 'flat' : 'open', look: 0.9, lean: t < 1.5 ? 6 : -6 * easeOut(seg(t, 1.6, 2.0))
      });
      B.pose({ armR: 8, armL: 8, look: -0.3, mood: t > 3.0 ? 'open' : 'smile', lift: 10 * hump(seg(t, 3.0, 3.5)) });
      const bp = backOut(seg(t, 2.6, 3.1), 1.8);
      tf(bub, 270, 74, 0, bp, bp);
      bub.setAttribute('opacity', t < 2.6 ? 0 : 1);
      const ep = backOut(seg(t, 3.1, 3.5), 2.2);
      tf(ex, 315, FY - 114, 0, ep, ep);
      ex.setAttribute('opacity', t < 3.1 ? 0 : 1);
    }
  };
}
