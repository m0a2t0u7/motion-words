// monument：作業員2人が最後の石を積み上げて記念碑を完成させ、花輪を供える（例文 They built a monument to the soldiers.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { hp, reach, P, blinkAt, twinkle, pop } from './restaurant.js';
import { parkBg } from './bench.js';

export const meta = { duration: 4.4, beats: [[0, '石を運ぶ'], [1.6, '積み上げる'], [3.2, '記念碑の完成']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 236;
  parkBg(k, FY);
  k.shadow(200, FY + 2, 70, 6);
  // 台座と本体（動かない）
  el('rect', { x: 140, y: FY - 26, width: 120, height: 26, fill: '#C3CAD4' });
  el('rect', { x: 160, y: FY - 44, width: 80, height: 18, fill: '#B3BBC6' });
  el('rect', { x: 180, y: FY - 130, width: 40, height: 86, fill: '#D5DBE3' });
  el('rect', { x: 186, y: FY - 100, width: 28, height: 22, rx: 2, fill: '#9AA6B6' });
  el('path', { d: 'M 200 -9 L 202.6 -2.8 L 209 -2.8 L 203.8 1.2 L 205.6 7.6 L 200 3.8 L 194.4 7.6 L 196.2 1.2 L 191 -2.8 L 197.4 -2.8 Z', fill: pal.yellow, transform: `translate(0 ${FY - 89})` });
  // 最後の石（とがった頂上）
  const top = g({});
  el('path', { d: 'M -20 0 V -20 L 0 -40 L 20 -20 V 0 Z', fill: '#E1E6ED', stroke: '#C3CAD4', 'stroke-width': 2 }, top);
  const hat = (b, c) => el('path', { d: 'M -26 -72 Q -24 -94 0 -94 Q 24 -94 26 -72 Z M -32 -72 H 32 V -66 H -32 Z', fill: c }, b.body);
  // 足場（はしごの台）
  el('rect', { x: 110, y: FY - 70, width: 50, height: 8, fill: pal.woodDark }); el('rect', { x: 240, y: FY - 70, width: 50, height: 8, fill: pal.woodDark });
  [114, 150, 244, 280].forEach((x) => el('rect', { x, y: FY - 62, width: 6, height: 62, fill: pal.woodDark }));
  const A = k.buddy({ x: 140, y: FY - 70, scale: 0.85, facing: 1, color: pal.blue, dark: pal.blueDark }); hat(A, pal.yellow);
  const B = k.buddy({ x: 260, y: FY - 70, scale: 0.85, facing: -1, color: pal.coral, dark: pal.coralDark }); hat(B, pal.yellow);
  const wreath = g({}); tf(wreath, 200, FY - 6);
  el('circle', { r: 16, fill: 'none', stroke: '#59C27A', 'stroke-width': 7 }, wreath);
  [0, 72, 144, 216, 288].forEach((a) => el('circle', { cx: 16 * Math.cos(a * Math.PI / 180), cy: 16 * Math.sin(a * Math.PI / 180), r: 4, fill: pal.red }, wreath));
  const sp = [0, 1, 2].map(() => twinkle(k));
  return {
    update(t) {
      // 2人で石を持ち上げ（ためてから）→ 頂上にのせる
      const dip = hump(seg(t, 0.4, 0.9)), lift = easeInOut(seg(t, 0.9, 2.2)), put = easeOut(seg(t, 2.2, 2.6));
      const y = lerp(FY - 146, FY - 166, lift) + 36 * put + 3 * dip, land = t > 2.6 ? wobble(seg(t, 2.6, 3.2), 3, 6) * 2 : 0;
      const done = t > 2.7;
      tf(top, 200, (done ? FY - 130 + land : y));
      P(A, { squash: 1 - 0.08 * dip, lean: 4, armL: 10, mood: done ? 'grin' : 'flat', blink: blinkAt(t) });
      P(B, { squash: 1 - 0.08 * dip, lean: 4, armL: 10, mood: done ? 'grin' : 'flat', blink: blinkAt(t, 1) });
      const hy = done ? FY - 140 : y - 10;
      const rel = easeInOut(seg(t, 2.8, 3.2));
      A.pose({ armR: lerp(reach(A, 0.85, 'R', 180, hy), 150, rel) });
      B.pose({ armR: lerp(reach(B, 0.85, 'R', 220, hy), 150, rel) });
      wreath.setAttribute('transform', `translate(200 ${FY - 6}) scale(${pop(easeOut(seg(t, 3.3, 3.7))).toFixed(3)})`);
      sp.forEach((s, i) => { const q = seg(t, 3.2 + i * 0.15, 4.4); tf(s, 170 + i * 30, FY - 190 + (i % 2) * 14, 45 * q, pop(easeOut(seg(q, 0, 0.3)))); });
    }
  };
}
