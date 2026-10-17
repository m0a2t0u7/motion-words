// mop up：こぼれた水を、モップで往復してぬぐい取る（例文 I mopped up the spilled water.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';

export const meta = { duration: 4.6, beats: [[0, 'こぼれた水'], [1.6, 'モップで拭く'], [3.9, '床がかわく']] };

const hand = (b) => {
  const m = b.armR.hand.getCTM && b.armR.hand.getCTM();
  if (!m) return b.handPos('R');
  return { x: m.c * 26 + m.e, y: m.d * 26 + m.f };
};

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#E9E2D6' });
  el('rect', { x: 0, y: FY, width: 400, height: 3, fill: pal.woodDark });
  [60, 140, 220, 300, 380].forEach((x) => el('line', { x1: x, y1: 239, x2: x - 28, y2: 300, stroke: '#DCD3C4', 'stroke-width': 1.5 }));
  // 壁：窓
  el('rect', { x: 250, y: 44, width: 86, height: 58, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 293, y1: 44, x2: 293, y2: 102, stroke: '#fff', 'stroke-width': 4 });
  // 水たまり
  const puddle = g({});
  el('ellipse', { cx: 0, cy: 0, rx: 62, ry: 12, fill: pal.water, opacity: 0.9 }, puddle);
  el('path', { d: 'M -34 -3 Q -12 -8 10 -4', stroke: '#fff', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', opacity: 0.85 }, puddle);
  [[-70, 5, 3], [72, -4, 2.5], [-58, -9, 2]].forEach(([x, y, r]) => el('ellipse', { cx: x, cy: y, rx: r * 1.6, ry: r * 0.7, fill: pal.water, opacity: 0.9 }, puddle));
  // 倒れたコップ（こぼれた元）
  const cup = g({});
  el('rect', { x: -12, y: -9, width: 24, height: 18, rx: 4, fill: '#EAF6FD', stroke: '#B8D6E8', 'stroke-width': 2 }, cup);
  el('ellipse', { cx: -12, cy: 0, rx: 3, ry: 9, fill: '#fff', stroke: '#B8D6E8', 'stroke-width': 2 }, cup);
  tf(cup, 306, 254, 0);
  k.shadow(306, 264, 16, 3);
  // バケツ（右奥）
  const bucket = g({});
  el('path', { d: 'M -14 -22 L 14 -22 L 11 0 L -11 0 Z', fill: pal.yellow }, bucket);
  el('rect', { x: -16, y: -25, width: 32, height: 5, rx: 2, fill: pal.yellowDark }, bucket);
  el('path', { d: 'M -12 -24 Q 0 -44 12 -24', fill: 'none', stroke: pal.sub, 'stroke-width': 2 }, bucket);
  tf(bucket, 358, 246);
  k.shadow(358, 247, 18, 3);
  const b = k.buddy({ x: 160, y: FY, scale: 0.85 });
  // モップ
  const mop = g({});
  const handle = el('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: pal.woodDark, 'stroke-width': 4, 'stroke-linecap': 'round' }, mop);
  const pad = g({}, mop);
  el('ellipse', { cx: 0, cy: 3, rx: 22, ry: 6, fill: '#CED4DD' }, pad);
  const wetPad = el('ellipse', { cx: 0, cy: 3, rx: 22, ry: 6, fill: pal.blue, opacity: 0 }, pad);
  [-16, -9, -3, 3, 9, 15].forEach((x) => el('line', { x1: x, y1: 0, x2: x * 1.25, y2: 8, stroke: '#9BA6B6', 'stroke-width': 1.6, 'stroke-linecap': 'round' }, pad));
  el('rect', { x: -6, y: -4, width: 12, height: 6, rx: 2, fill: pal.red }, pad);
  const star = g({});
  el('path', { d: 'M 0 -9 L 3 -3 L 9 0 L 3 3 L 0 9 L -3 3 L -9 0 L -3 -3 Z', fill: pal.yellow }, star);

  return {
    update(t) {
      const mopping = t > 0.7 && t < 3.4;
      const ph = (t - 0.7) * 5.2;
      const damp = 1 - 0.5 * seg(t, 2.9, 3.4);
      const sway = mopping ? Math.sin(ph) * damp : 0;
      const arm = lerp(12, 55, easeOut(seg(t, 0.15, 0.6))) - 10 * easeInOut(seg(t, 3.6, 4.1));
      b.pose({ x: 160 + 22 * sway, armR: arm, armL: mopping ? 8 + 10 * sway : 8, walk: mopping ? t * 8 : 0, lean: 5 * sway + (mopping ? 5 : 0), mood: t > 3.6 ? 'grin' : 'smile', look: 0.5 });
      const h = hand(b);
      const lift = easeInOut(seg(t, 3.55, 4.1));
      const hx = lerp(h.x + 32 + 24 * sway, h.x + 5, lift), hy = lerp(260, h.y + 34, lift);
      handle.setAttribute('x1', h.x); handle.setAttribute('y1', h.y);
      handle.setAttribute('x2', hx); handle.setAttribute('y2', hy);
      tf(pad, hx, hy, 0);
      wetPad.setAttribute('opacity', 0.75 * seg(t, 0.9, 2.8));
      // 水たまりは拭くほど小さくなる
      const s = 1 - easeInOut(seg(t, 0.9, 3.2));
      tf(puddle, 236, 262, 0, Math.max(0.001, s), Math.max(0.001, s));
      puddle.setAttribute('opacity', s > 0.01 ? 1 : 0);
      const q = seg(t, 3.5, 4.2);
      tf(star, 232, 258 - 10 * q, q * 90, 0.2 + hump(q) * 1.1);
      star.setAttribute('opacity', q > 0 && q < 1 ? 1 : 0);
    }
  };
}
