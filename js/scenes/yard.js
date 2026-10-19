// yard：家の前の柵で囲まれた庭で、子どもたちがボールを投げ合って遊ぶ（例文 The kids are playing in the yard.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, blinkAt, tree } from './run-after.js';
import { reach } from './dig.js';

// 低い白い柵（横一列）。x0〜x1、地面 y、高さ h
export function pickets(k, x0, x1, y, h = 30, gap = 14, col = '#FFFFFF', parent) {
  const { el } = k, g = k.g({}, parent);
  el('rect', { x: x0, y: y - h * 0.75, width: x1 - x0, height: 5, fill: '#E3E8EE' }, g);
  el('rect', { x: x0, y: y - h * 0.35, width: x1 - x0, height: 5, fill: '#E3E8EE' }, g);
  for (let x = x0 + 3; x < x1; x += gap) el('path', { d: `M ${x} ${y} L ${x} ${y - h + 4} L ${x + 4} ${y - h} L ${x + 8} ${y - h + 4} L ${x + 8} ${y} Z`, fill: col, stroke: '#D9DFE7', 'stroke-width': 1 }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '庭で'], [1.4, 'ボール遊び'], [3.0, '楽しく遊ぶ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 200, mood: 'outdoor' });
  // 家
  el('path', { d: 'M -10 70 L 70 20 L 150 70 Z', fill: pal.blueDark });
  el('rect', { x: 0, y: 70, width: 140, height: 130, fill: '#F3E6DC' });
  el('rect', { x: 20, y: 92, width: 34, height: 30, rx: 3, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 3 });
  el('rect', { x: 80, y: 128, width: 34, height: 72, rx: 3, fill: pal.woodDark });
  tree(k, 360, 200, 0.75);
  // 芝生の庭
  el('rect', { x: 0, y: 200, width: 400, height: 100, fill: '#BFE3B0' });
  for (let i = 0; i < 30; i++) { const x = (i * 53) % 400, y = 214 + (i * 29) % 80; el('path', { d: `M ${x} ${y} l 2 -6 l 2 6`, stroke: '#9FD08E', 'stroke-width': 1.6, fill: 'none' }); }
  pickets(k, 140, 400, 202, 28);
  el('path', { d: 'M 96 200 L 70 300 L 130 300 L 114 200 Z', fill: '#E8E1D5' });
  const S = 0.62, Y = 262;
  const a = k.buddy({ x: 180, y: Y, scale: S });
  const b = k.buddy({ x: 320, y: Y, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const ball = g({});
  el('circle', { r: 9, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, ball);
  el('path', { d: 'M -9 0 Q 0 -5 9 0 M 0 -9 Q -4 0 0 9', stroke: pal.red, 'stroke-width': 2, fill: 'none' }, ball);
  const bsh = k.shadow(0, 0, 10, 2.5);
  const throws = [[0.3, 1.2, 1], [1.6, 2.5, -1], [2.9, 3.8, 1]];
  const HA = { x: 180 + 22, y: Y - 64 }, HB = { x: 320 - 22, y: Y - 64 };
  return {
    update(t) {
      let bx = HA.x, by = HA.y, rot = 0, hop = [0, 0], arm = [8, 8];
      throws.forEach(([t0, t1, d], i) => {
        const p = seg(t, t0, t1);
        const from = d > 0 ? HA : HB, to = d > 0 ? HB : HA;
        if (t >= t0) { bx = lerp(from.x, to.x, p); by = lerp(from.y, to.y, p) - 70 * hump(p); rot = p * 360 * d; }
        const wind = hump(seg(t, t0 - 0.25, t0 + 0.15)), catchP = hump(seg(t, t1 - 0.3, t1 + 0.3));
        const th = d > 0 ? 0 : 1, ca = 1 - th;
        arm[th] = Math.max(arm[th], 8 + 140 * wind);
        arm[ca] = Math.max(arm[ca], 8 + 120 * catchP);
        hop[ca] = Math.max(hop[ca], 10 * hump(seg(t, t1, t1 + 0.35)));
      });
      const bob = (o) => Math.abs(Math.sin(t * 5 + o)) * 2;
      P(a, { x: 180, y: Y, lift: hop[0] + bob(0), armR: arm[0], armL: 8 + arm[0] * 0.5, mood: 'grin', look: 0.6, blink: blinkAt(t) });
      P(b, { x: 320, y: Y, facing: -1, lift: hop[1] + bob(1), armR: arm[1], armL: 8 + arm[1] * 0.5, mood: 'grin', look: 0.6, blink: blinkAt(t, 1) });
      tf(ball, bx, by, rot);
      const hgt = Y - by;
      tf(bsh, bx, Y + 2, 0, Math.max(0.3, 1 - hgt / 160));
      bsh.setAttribute('opacity', Math.max(0.3, 1 - hgt / 160));
    }
  };
}
