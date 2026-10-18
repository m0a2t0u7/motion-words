// roll up：床のじゅうたんを端からくるくる巻き、巻いた筒を持って別の場所へ運ぶ（例文 He rolled up the rug and moved it.）
import { seg, lerp, easeInOut, easeOut, wobble } from '../ease.js';
import { hp } from './dig.js';
import { path, walk } from './queue-up.js';

export const meta = { duration: 4.4, beats: [[0, '敷いたじゅうたん'], [1.5, '端から巻く'], [3.8, '巻いて運んだ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 226, mood: 'indoor' });
  el('rect', { x: 40, y: 50, width: 86, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 0, y: FY, width: 400, height: 74, fill: '#EADCC8' });
  for (let x = 0; x < 400; x += 50) el('line', { x1: x, y1: FY, x2: x - 20, y2: 300, stroke: '#DCCBB2', 'stroke-width': 2 });
  const L0 = 90, R0 = 300, RUG = pal.coral;
  const flat = el('rect', { x: L0, y: 246, width: R0 - L0, height: 9, rx: 2, fill: RUG });
  const stripe = el('rect', { x: L0, y: 250, width: R0 - L0, height: 2, fill: '#fff', opacity: 0.5 });
  const sh = k.shadow(0, 256, 20, 4);
  const roll = g({});
  const disc = el('circle', { r: 6, fill: RUG, stroke: pal.coralDark, 'stroke-width': 2 }, roll);
  const spiral = el('path', { fill: 'none', stroke: pal.coralDark, 'stroke-width': 1.5 }, roll);
  const b = k.buddy({ x: 360, y: 250, scale: 0.95, facing: -1 });
  const X = (p) => lerp(R0, L0, p);
  const rr = (p) => Math.sqrt(36 + 7 * (R0 - L0) * p / Math.PI);
  const xf = path([[0, 360], [0.5, 340], [0.7, 340]]);
  const yf = (t) => 250;
  return {
    update(t) {
      const p = easeInOut(seg(t, 0.7, 2.6));
      const r = rr(p), cx0 = X(p);
      let bx = cx0 + r + 30;
      if (t < 0.7) bx = xf(t);
      // 巻き終わり→持ち上げて右へ運ぶ
      const lift = easeOut(seg(t, 2.7, 3.0));
      const mv = path([[2.9, cx0 + r + 30], [4.0, 250]]);
      if (t > 2.9) bx = mv(t);
      const fx = (tt) => (tt < 0.7 ? xf(tt) : tt <= 2.9 ? X(easeInOut(seg(tt, 0.7, 2.6))) + rr(easeInOut(seg(tt, 0.7, 2.6))) + 30 : mv(tt));
      const pp = walk(b, fx, t, { y: yf(t), facing: t > 2.85 ? 1 : -1, look: 0.4, mood: t > 3.9 ? 'grin' : 'flat' });
      const push = t > 0.7 && t < 2.7;
      if (push) b.pose({ armR: 70, armL: 60, lean: 16, squash: 0.9 + 0.03 * Math.sin(t * 12), walk: pp.walk });
      let rx = cx0, ry = 255 - r;
      if (t > 2.7) {
        const h = hp(b, 0.95, 'R');
        b.pose({ armR: lerp(70, 92, lift), armL: lerp(60, 92, lift), lean: lerp(16, -4, lift) });
        const h2 = hp(b, 0.95, 'R');
        rx = lerp(cx0, h2.x + r * 0.6, lift); ry = lerp(255 - r, h2.y, lift);
        if (t > 4.0) { const d = easeInOut(seg(t, 4.0, 4.3)); ry = lerp(ry, 255 - r, d); b.pose({ armR: lerp(92, 40, d), armL: lerp(92, 30, d), lean: lerp(-4, 8, d) }); }
        void h;
      }
      k.set(flat, { x: L0, width: Math.max(0, cx0 - L0 - 1) });
      k.set(stripe, { width: Math.max(0, cx0 - L0 - 1) });
      tf(roll, rx, ry, -(R0 - cx0) / r * 57.3);
      k.set(disc, { r });
      let d = 'M 0 0';
      for (let a = 0; a < 12; a += 0.5) d += ` L ${(Math.cos(a) * a / 12 * r * 0.9).toFixed(1)} ${(Math.sin(a) * a / 12 * r * 0.9).toFixed(1)}`;
      spiral.setAttribute('d', d);
      tf(sh, rx, 0, 0, (r + 10) / 20 * (1 - (255 - r - ry) / 120), 1);
      void wobble;
    }
  };
}
