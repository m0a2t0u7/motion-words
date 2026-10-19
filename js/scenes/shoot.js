// shoot：まめがジャンプしてボールを放ち、ボールがバスケットのネットに入る（例文 He shot the ball into the net.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, wobble } from '../ease.js';
import { P } from './run-after.js';
import { hp } from './dig.js';

export const meta = { duration: 3.8, beats: [[0, 'かまえる'], [1.0, 'シュート'], [2.0, 'ネットに入った']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.85;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#F2D6AE' });
  el('line', { x1: 0, y1: FY + 18, x2: 400, y2: FY + 18, stroke: '#fff', 'stroke-width': 3 });
  // ゴール：支柱・ボード・リング・ネット
  k.shadow(372, FY + 1, 20, 4);
  el('rect', { x: 366, y: 70, width: 10, height: 166, fill: '#8A93A6' });
  el('rect', { x: 346, y: 52, width: 10, height: 76, rx: 2, fill: '#fff', stroke: pal.sub, 'stroke-width': 2 });
  el('rect', { x: 356, y: 84, width: 12, height: 6, fill: '#8A93A6' });
  const RX = 318, RY = 112;
  const netG = g({}); tf(netG, RX, RY);
  const netP = el('path', { fill: 'none', stroke: '#fff', 'stroke-width': 2 }, netG);
  el('ellipse', { cx: RX, cy: RY, rx: 24, ry: 4, fill: 'none', stroke: pal.coralDark, 'stroke-width': 3 });
  const ball = g({});
  el('circle', { r: 11, fill: '#F08A3C' }, ball);
  el('path', { d: 'M -11 0 H 11 M 0 -11 V 11 M -7 -8 Q 0 0 -7 8 M 7 -8 Q 0 0 7 8', stroke: '#9C4E1A', 'stroke-width': 1.6, fill: 'none' }, ball);
  const bsh = k.shadow(0, 0, 11, 2.5);
  el('path', { d: `M ${RX - 24} ${RY} A 24 4 0 0 0 ${RX + 24} ${RY}`, fill: 'none', stroke: pal.coral, 'stroke-width': 3.5 });
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const netD = (s) => { const L = 30 * s; return `M -22 0 L -12 ${L} M 22 0 L 12 ${L} M -8 0 L -5 ${L} M 8 0 L 5 ${L} M -18 ${L * 0.4} L 18 ${L * 0.4} M -14 ${L * 0.75} L 14 ${L * 0.75} M -12 ${L} L 12 ${L}`; };
  return {
    update(t) {
      const crouch = hump(seg(t, 0.3, 0.95)), jump = hump(seg(t, 0.9, 1.6)), land = wobble(seg(t, 1.6, 2.1), 2, 6);
      const rel = t > 1.15;
      const up = easeOut(seg(t, 0.4, 1.1));
      P(b, { x: 150, lift: 34 * jump, squash: 1 - 0.1 * crouch - 0.05 * land, armR: lerp(60, 165, up), armL: lerp(20, 130, up) * (rel ? 1 - seg(t, 1.3, 1.8) : 1), lean: -4 * up, look: 0.8, mood: t > 2.1 ? 'grin' : 'flat' });
      const h = hp(b, S, 'R', 34);
      // ボール：手の上 → 放物線 → リングを通過 → 床で弾む
      let x = h.x, y = h.y - 6, r = 0;
      if (rel) {
        const p = seg(t, 1.15, 1.95);
        x = lerp(184, RX, p); y = lerp(92, RY - 4, p) - 56 * Math.sin(p * Math.PI); r = -p * 400;
        if (t > 1.95) { const q = seg(t, 1.95, 2.35); x = RX; y = lerp(RY - 4, FY - 11, easeIn(q)); r = -400; }
        if (t > 2.35) { const q = seg(t, 2.35, 3.8); x = RX - 40 * easeOut(q); y = FY - 11 - 40 * hump(seg(t, 2.35, 2.85)) - 12 * hump(seg(t, 2.85, 3.15)); r = -400 + 260 * easeOut(q); }
      }
      tf(ball, x, y, r);
      tf(bsh, x, FY + 1, 0, Math.max(0.25, 1 - (FY - y) / 180));
      // ネットが通過で伸びて揺れる
      const s = 1 + 0.35 * hump(seg(t, 1.95, 2.3)) + 0.06 * wobble(seg(t, 2.3, 3.0), 2, 5);
      netP.setAttribute('d', netD(s));
    }
  };
}
