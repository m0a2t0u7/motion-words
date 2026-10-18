// in particular：棚のボール（バスケ・テニス・野球・サッカー）どれにもハート。なかでもサッカーボールを手に取り、抱きしめて大きなハート（例文 I like sports, soccer in particular.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg } from './look-over.js';
import { hp, reach } from './dig.js';
import { heart } from './weigh.js';
import { popS } from './from-scratch.js';

function ballOf(k, kind) {
  const { el, g, pal } = k;
  const b = g({});
  if (kind === 0) { el('circle', { r: 13, fill: '#F2A65A', stroke: '#C77B33', 'stroke-width': 2 }, b); el('path', { d: 'M -13 0 L 13 0 M 0 -13 L 0 13 M -9 -9 Q 0 0 -9 9 M 9 -9 Q 0 0 9 9', stroke: '#9A5A22', 'stroke-width': 1.5, fill: 'none' }, b); }
  if (kind === 1) { el('circle', { r: 9, fill: '#D8F05A', stroke: '#AFC63A', 'stroke-width': 2 }, b); el('path', { d: 'M -7 -5 Q 0 0 -7 5 M 7 -5 Q 0 0 7 5', stroke: '#fff', 'stroke-width': 1.6, fill: 'none' }, b); }
  if (kind === 2) { el('circle', { r: 10, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, b); el('path', { d: 'M -6 -7 Q -2 0 -6 7 M 6 -7 Q 2 0 6 7', stroke: pal.red, 'stroke-width': 1.6, fill: 'none' }, b); }
  if (kind === 3) {
    el('circle', { r: 14, fill: '#fff', stroke: pal.ink, 'stroke-width': 2 }, b);
    el('path', { d: 'M 0 -5 L 5 -1.5 L 3 4.5 L -3 4.5 L -5 -1.5 Z', fill: pal.ink }, b);
    [[0, -13], [12, -4], [8, 11], [-8, 11], [-12, -4]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 3, fill: pal.ink }, b));
  }
  return b;
}

export const meta = { duration: 4.4, beats: [[0, 'スポーツ全部'], [1.8, 'なかでも'], [2.8, 'サッカーが特に']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  // 棚
  el('rect', { x: 196, y: 130, width: 190, height: 8, rx: 3, fill: pal.woodDark });
  el('rect', { x: 196, y: 138, width: 190, height: FY - 138, fill: '#EAD3B0' });
  el('rect', { x: 196, y: 186, width: 190, height: 6, fill: pal.woodDark, opacity: 0.6 });
  const X = [222, 268, 312, 358];
  const balls = [0, 1, 2, 3].map((i) => { const b = ballOf(k, i); return b; });
  const smalls = X.map(() => { const h = g({}); heart(k, h, pal.coral); return h; });
  const b = k.buddy({ x: 130, y: FY, facing: 1 });
  const big = g({}); heart(k, big, pal.red);
  const glow = el('circle', { r: 22, fill: 'none', stroke: pal.yellow, 'stroke-width': 4, opacity: 0 });
  return {
    update(t) {
      // ボールは棚の上（サッカーだけ手に取る）
      X.forEach((x, i) => { if (i < 3) tf(balls[i], x, 130 - [13, 9, 10][i]); });
      smalls.forEach((h, i) => tf(h, X[i], 92 - 4 * hump(seg(t, 0.3 + i * 0.3, 0.7 + i * 0.3)), 0, popS(seg(t, 0.3 + i * 0.3, 0.6 + i * 0.3)) * (1 - 0.4 * seg(t, 1.9, 2.2))));
      const pick = easeInOut(seg(t, 2.0, 2.5));
      const hug = easeInOut(seg(t, 2.6, 3.0));
      const walkIn = easeInOut(seg(t, 1.7, 2.1));
      const x = lerp(130, 300, walkIn) - lerp(0, 120, hug);
      P(b, { x, facing: hug > 0.5 ? 1 : 1, look: 0.6 });
      const aR = reach(b, 1, 'R', 358, 116);
      P(b, { x, walk: Math.abs(x - 130) * 0.107 * (walkIn > 0 && walkIn < 1 ? 1 : 0) + (hug > 0 && hug < 1 ? Math.abs(x - 300) * 0.107 : 0), facing: hug > 0 && hug < 1 ? -1 : 1, look: t < 1.7 ? 0.8 : 0.6, armR: t < 2.0 ? lerp(8, 30, walkIn) : lerp(lerp(30, aR, pick), 70, hug), armL: lerp(8, 60, hug), lean: hug > 0.9 ? 0 : 6 * pick, mood: t > 2.6 ? 'grin' : 'smile', blink: blinkAt(t), squash: 1 - 0.05 * hump(seg(t, 3.0, 3.4)) });
      const h = hp(b, 1);
      if (t < 2.25) tf(balls[3], 358, 116); else tf(balls[3], h.x + (hug > 0.9 ? -4 : 0), h.y - 6);
      tf(glow, 358, 116, 0, 1); glow.setAttribute('opacity', hump(seg(t, 1.6, 2.3)));
      tf(big, x + 2, 120 - 10 * seg(t, 3.0, 4.4), 0, popS(seg(t, 3.0, 3.4)) * 2.2);
      big.setAttribute('opacity', t > 3.0 ? 1 : 0);
    }
  };
}
