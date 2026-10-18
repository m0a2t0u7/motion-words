// call in：コピー機が故障→電話で専門家を呼ぶ→工具箱を持った専門家が入ってきて修理し、直る（例文 We called in an expert to fix the problem.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';
import { roomBg, phone, faceAt, hat, walkPose, hp, held } from './look-over.js';
import { EAR, holdPhone } from './call-up.js';

export const meta = { duration: 4.8, beats: [[0, '機械が故障'], [1.6, '専門家が来る'], [3.6, '直った']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.8;
  const FY = roomBg(k, 'office', 240);
  // ドア（右）
  el('rect', { x: 330, y: 120, width: 64, height: 120, fill: '#5A6480' });
  const door = el('rect', { x: 330, y: 120, width: 64, height: 120, fill: pal.blue });
  // コピー機
  el('rect', { x: 166, y: 166, width: 76, height: 72, rx: 6, fill: '#E3E8EE', stroke: pal.sub, 'stroke-width': 2 });
  el('rect', { x: 172, y: 156, width: 64, height: 12, rx: 3, fill: '#C8D0DA' });
  const lamp = el('circle', { cx: 230, cy: 182, r: 5, fill: pal.red });
  const spark = el('path', { d: 'M 214 150 l -8 -12 l 8 2 l -6 -14', fill: 'none', stroke: pal.yellowDark, 'stroke-width': 3, 'stroke-linejoin': 'round' });
  const smoke = [0, 1, 2].map(() => el('circle', { r: 7, fill: '#AAB2BD' }));
  const chk = el('path', { d: 'M 190 128 l 8 8 l 16 -18', fill: 'none', stroke: pal.green, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const co = k.buddy({ x: 40, y: FY, scale: S, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 106, y: FY, scale: S });
  const ph = phone(k);
  const ex = k.buddy({ x: 360, y: FY, scale: 0.85, color: pal.blue, dark: pal.blueDark, facing: -1 });
  hat(k, ex, pal.yellow, pal.yellowDark);
  const box = g({}); el('rect', { x: -14, y: 0, width: 28, height: 16, rx: 3, fill: pal.red }, box); el('path', { d: 'M -6 0 v -5 h 12 v 5', fill: 'none', stroke: pal.ink, 'stroke-width': 2 }, box);
  const wr = g({}); el('rect', { x: -2, y: -2, width: 4, height: 22, rx: 2, fill: pal.sub }, wr); el('circle', { cy: 22, r: 5, fill: 'none', stroke: pal.sub, 'stroke-width': 3 }, wr);
  const xf = (t) => lerp(372, 268, easeInOut(seg(t, 1.8, 2.7)));
  return {
    update(t) {
      const fixed = seg(t, 3.5, 3.7);
      spark.setAttribute('opacity', fixed < 1 && Math.sin(t * 20) > 0 ? 1 : 0);
      smoke.forEach((s, i) => { const u = (t * 0.7 + i / 3) % 1; k.set(s, { cx: 200 + Math.sin(u * 5 + i) * 6, cy: 150 - u * 50, r: 5 + u * 8, opacity: (1 - fixed) * (1 - u) * 0.7 }); });
      k.set(lamp, { fill: fixed > 0.5 ? pal.green : pal.red });
      chk.setAttribute('opacity', seg(t, 3.7, 3.9));
      const ear = easeInOut(seg(t, 0.4, 0.7)) * (1 - easeInOut(seg(t, 1.5, 1.8)));
      b.pose({ armR: lerp(10, EAR, ear), mood: t > 3.7 ? 'grin' : ear > 0.5 && Math.sin(t * 13) > 0 ? 'open' : 'flat', look: 0.6, lift: 4 * hump(seg(t, 3.7, 4.0)) });
      holdPhone(k, b, S, ph, ear); ph.g.setAttribute('opacity', ear > 0.05 ? 1 : 0);
      co.pose({ armL: 8 + 20 * Math.sin(t * 3), mood: t > 3.7 ? 'grin' : 'flat', look: 0.6, lift: 4 * hump(seg(t, 3.8, 4.1)) });
      door.setAttribute('transform', `translate(330 0) scale(${lerp(1, 0.15, easeInOut(seg(t, 1.5, 1.8)) * (1 - easeInOut(seg(t, 2.8, 3.1))))} 1) translate(-330 0)`);
      const p = walkPose(xf, t, 372);
      ex.g.setAttribute('opacity', seg(t, 1.7, 1.9));
      const work = t > 2.8 && t < 3.6;
      ex.pose({ x: p.x, walk: p.walk, armL: work ? 20 : 30, armR: work ? 80 + 25 * Math.sin(t * 16) : p.armR, lean: work ? 14 : p.lean, mood: t > 3.6 ? 'grin' : 'flat', look: 0.6 });
      const hl = hp(ex, 0.85, 'L'); tf(box, hl.x, hl.y - 2, 0, 0.85);
      held(k, ex, 0.85, wr, 'R', 0); wr.setAttribute('opacity', t > 2.7 && t < 3.7 ? 1 : 0);
    }
  };
}
