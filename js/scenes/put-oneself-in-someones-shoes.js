// put oneself in someone's shoes：重い荷物を抱えて大変そうな彼女。決める前に、自分がその荷物を持ってみて、彼女の立場がわかる（Try to put yourself in her shoes before you decide.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, wobble } from '../ease.js';

export const meta = { duration: 4.6, beats: [[0, '決めかねる'], [2.3, '代わりに持つ'], [3.5, '立場がわかる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236, mood: 'indoor' });
  // 棚（背景）
  el('rect', { x: 20, y: 70, width: 90, height: 6, rx: 3, fill: pal.woodDark });
  el('rect', { x: 292, y: 56, width: 80, height: 70, rx: 6, fill: '#DDEFFA' });
  el('line', { x1: 332, y1: 56, x2: 332, y2: 126, stroke: '#fff', 'stroke-width': 4 });
  const fr = k.buddy({ x: 268, y: 238, facing: -1, color: pal.coral, dark: pal.coralDark });
  const me = k.buddy({ x: 70, y: 238 });
  // 箱の山
  const boxes = g({});
  const bx = (x, y, w, h, c, d) => { el('rect', { x, y, width: w, height: h, rx: 3, fill: c, stroke: d, 'stroke-width': 2 }, boxes); el('rect', { x: x + w / 2 - 3, y, width: 6, height: h, fill: d, opacity: 0.35 }, boxes); };
  bx(-24, -30, 48, 30, pal.wood, pal.woodDark);
  bx(-20, -58, 40, 28, '#F1D8B2', pal.woodDark);
  bx(-16, -84, 32, 26, pal.wood, pal.woodDark);
  // 考え中の「?」
  const q = g({});
  el('circle', { cx: 0, cy: 0, r: 20, fill: '#fff', stroke: pal.line, 'stroke-width': 2.5 }, q);
  el('circle', { cx: -10, cy: 26, r: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, q);
  k.text(0, 1, '?', { 'font-size': 24, fill: pal.violet }, q);
  // 気づき（電球）
  const bulb = g({});
  el('circle', { cx: 0, cy: 0, r: 13, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2.5 }, bulb);
  el('rect', { x: -6, y: 12, width: 12, height: 8, rx: 2, fill: pal.sub }, bulb);
  for (let i = 0; i < 5; i++) { const a = (-90 + (i - 2) * 40) * Math.PI / 180; el('line', { x1: Math.cos(a) * 20, y1: Math.sin(a) * 20, x2: Math.cos(a) * 28, y2: Math.sin(a) * 28, stroke: pal.yellowDark, 'stroke-width': 3, 'stroke-linecap': 'round' }, bulb); }
  const sweat = el('path', { d: 'M 0 -6 Q 4 0 0 4 Q -4 0 0 -6 Z', fill: pal.water, stroke: '#fff', 'stroke-width': 1 });

  return {
    update(t) {
      // 動き：本人が歩いて近づく
      const walkP = easeInOut(seg(t, 1.1, 2.2));
      const mx = lerp(70, 158, walkP), walking = walkP > 0 && walkP < 1;
      const take = easeOut(seg(t, 2.1, 2.5));
      const give = seg(t, 2.4, 2.9);
      const think = 1 - seg(t, 1.0, 1.3);
      const heavy = seg(t, 2.5, 2.9);
      const sq = 1 - 0.13 * heavy - 0.03 * wobble(seg(t, 2.5, 3.4), 3, 4) * heavy;
      me.pose({
        x: mx, walk: walking ? 8 + (mx - 70) * 0.11 : 8 + 88 * 0.11, facing: 1,
        armR: walking ? lerp(-65 * think, 8, seg(t, 1.1, 1.5)) : lerp(8, 98, take),
        armL: walking ? 8 : lerp(8, 20, take),
        squash: sq, lean: lerp(3, -5, heavy) * (t > 2.5 ? 1 : 0), look: 0.5,
        mood: t < 1.1 ? 'flat' : t < 2.5 ? 'flat' : t < 3.5 ? 'open' : 'smile', blink: hump(seg(t, 3.5, 3.65))
      });
      const bye = easeInOut(seg(t, 2.6, 3.4));
      const relax = seg(t, 2.4, 3.0);
      fr.pose({
        x: lerp(268, 300, bye), walk: bye > 0 && bye < 1 ? bye * 8 : 0, facing: -1,
        armR: lerp(92, 8, give), armL: lerp(92, 8, give) + 0,
        squash: 0.93 + 0.07 * relax + 0.0, lean: lerp(4, 0, relax),
        mood: t < 2.6 ? 'sad' : t < 3.5 ? 'flat' : 'smile'
      });
      fr.pose({ armL: t < 2.4 ? 92 : lerp(92, 8, give) + 0, armR: t < 3.4 ? lerp(92, 8, give) : lerp(8, 140, easeOut(seg(t, 3.4, 4.0))) });
      // 箱の位置：彼女の手 → 本人の手
      const fy = 190 + (1 - (0.93 + 0.07 * relax)) * 50;
      const my = 190 + (1 - sq) * 46;
      const cx = lerp(214, mx + 56, give);
      const shake = Math.sin(t * 34) * 1.4 * (t < 2.1 ? 1 : 0) + Math.sin(t * 28) * 1.6 * heavy * (1 - seg(t, 3.4, 3.8));
      tf(boxes, cx + shake, lerp(fy, my, give), (t < 2.1 ? 1 : 0) * Math.sin(t * 5) * 0.8);
      // 「?」とあせ、電球
      const qp = backOut(seg(t, 0.3, 0.7)) * (1 - seg(t, 1.0, 1.25));
      tf(q, 100, 96, 0, Math.max(0, qp), Math.max(0, qp));
      const sp = seg(t, 0.6, 2.2) % 1;
      tf(sweat, 244, lerp(160, 200, sp), 0, 1, 1);
      sweat.setAttribute('opacity', t < 2.5 && t > 0.6 ? 1 : 0);
      const bp = backOut(seg(t, 3.5, 3.9), 2.2);
      tf(bulb, mx + 8, lerp(128, 100, easeOut(seg(t, 3.5, 3.9))) + 4, 0, bp, bp);
    }
  };
}
