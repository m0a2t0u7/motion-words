// punch：ボクサーのまめがグローブで、つるされたサンドバッグをこぶしで打つ（例文 The boxer punched the bag.）
import { frontL } from './dig.js';
import { seg, lerp, easeInOut, easeOut, easeIn, hump, wobble } from '../ease.js';

export const meta = { duration: 3.6, beats: [[0, '構える'], [1.3, 'パンチ'], [1.7, 'バッグが揺れる']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#EDE7F3' });
  el('rect', { x: 0, y: 22, width: 400, height: 10, fill: '#8A93A6' });
  [[40, 70], [70, 70]].forEach(([x]) => el('rect', { x: x - 2, y: 140, width: 4, height: 80, fill: pal.line }));
  el('rect', { x: 20, y: 136, width: 70, height: 6, rx: 3, fill: pal.red }); el('rect', { x: 20, y: 170, width: 70, height: 6, rx: 3, fill: pal.red });
  const b = k.buddy({ x: 170, y: FY, scale: S });
  const glove = (arm) => { const gl = el('ellipse', { cx: 2, cy: 26, rx: 11, ry: 10, fill: pal.red, stroke: '#C9483C', 'stroke-width': 2 }, arm.a); el('rect', { x: -6, y: 13, width: 12, height: 6, rx: 2, fill: '#fff' }, arm.a); return gl; };
  const fl = frontL(b, S, -18, -46);
  glove(b.armL); glove(b.armR);
  // サンドバッグ（原点＝天井のつり点）
  const PX = 262, PY = 32, bag = g({});
  el('line', { x1: 0, y1: 0, x2: 0, y2: 70, stroke: pal.sub, 'stroke-width': 3 }, bag);
  const sack = g({}, bag);
  el('rect', { x: -26, y: 70, width: 52, height: 104, rx: 18, fill: '#C0574A' }, sack);
  el('rect', { x: -26, y: 86, width: 52, height: 6, fill: '#00000022' }, sack);
  el('rect', { x: -26, y: 152, width: 52, height: 6, fill: '#00000022' }, sack);
  el('ellipse', { cx: -10, cy: 112, rx: 6, ry: 18, fill: '#fff', opacity: 0.18 }, sack);
  const bsh = k.shadow(PX, FY + 1, 30, 4);
  const lines = [0, 1, 2].map(() => el('line', { stroke: pal.yellowDark, 'stroke-width': 3.5, 'stroke-linecap': 'round' }));
  return {
    update(t) {
      const ready = easeOut(seg(t, 0.2, 0.7)), wind = easeInOut(seg(t, 0.9, 1.25)), hit = easeIn(seg(t, 1.25, 1.42)), back = easeInOut(seg(t, 1.6, 2.3));
      const ext = hit * (1 - back);
      b.pose({ x: 150 + 20 * ext - 4 * wind * (1 - hit), lean: 6 * ready - 6 * wind * (1 - hit) + 16 * ext, squash: 1 - 0.05 * ready,
        armL: 8, armR: lerp(lerp(8, 40, ready), 96, ext) - 25 * wind * (1 - hit), mood: ext > 0.3 ? 'grin' : 'flat', look: 1 });
      fl.set(lerp(-8, 150, ready) - 10 * ext);
      // 振り子：当たった瞬間から減衰振動
      const p = seg(t, 1.42, 3.6), ang = t < 1.42 ? Math.sin(t * 3) * 0.6 : -13 * Math.sin(p * 11) * Math.exp(-p * 3.0) / (1 + 0 * p);
      tf(bag, PX, PY, ang);
      const dent = hump(seg(t, 1.42, 1.6));
      tf(sack, 0, 0, 0, 1 - 0.08 * dent, 1);
      tf(bsh, Math.sin(-ang * Math.PI / 180) * 130, 0, 0, 1);
      lines.forEach((l, i) => { const q = seg(t, 1.42, 1.85); const a = (-40 + i * 40) * Math.PI / 180;
        k.set(l, { x1: 234 + Math.cos(a) * (8 + 18 * q), y1: 140 + Math.sin(a) * (8 + 18 * q), x2: 234 + Math.cos(a) * (16 + 22 * q), y2: 140 + Math.sin(a) * (16 + 22 * q), opacity: q > 0 && q < 1 ? 1 - q : 0 }); });
    }
  };
}
