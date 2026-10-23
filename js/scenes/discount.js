// discount：学生帽のまめが、値札が20パーセント下がるのを指さして喜ぶ（例文 Students get a 20 percent discount.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, wobble, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { roomBg, hat } from './look-over.js';
import { reach } from './weigh.js';

export const meta = { duration: 4.2, beats: [[0, '値札100'], [1.6, '20%引き'], [3.2, '80に下がった']] };

export function create(k) {
  const { el, pal } = k;
  const FY = roomBg(k, 'office', 240);
  // 棚の服（床置きのハンガーラック）
  k.shadow(332, FY, 44, 5);
  el('line', { x1: 296, y1: FY - 92, x2: 296, y2: FY, stroke: pal.woodDark, 'stroke-width': 5 });
  el('line', { x1: 372, y1: FY - 92, x2: 372, y2: FY, stroke: pal.woodDark, 'stroke-width': 5 });
  el('line', { x1: 292, y1: FY - 92, x2: 376, y2: FY - 92, stroke: pal.woodDark, 'stroke-width': 5, 'stroke-linecap': 'round' });
  [[306, pal.coral], [326, pal.blue], [346, pal.yellow]].forEach(([x, c]) => el('path', { d: `M ${x} ${FY - 90} l 8 6 l 8 -6 l 6 8 l -6 4 v 36 h -16 v -36 l -6 -4 Z`, fill: c }));
  // 値札ボード（脚は床に立つ）
  const bx = 190, by = FY - 118;
  k.shadow(bx + 40, FY, 36, 4);
  el('line', { x1: bx + 14, y1: by + 70, x2: bx + 8, y2: FY, stroke: pal.woodDark, 'stroke-width': 4 });
  el('line', { x1: bx + 66, y1: by + 70, x2: bx + 72, y2: FY, stroke: pal.woodDark, 'stroke-width': 4 });
  el('rect', { x: bx, y: by, width: 80, height: 72, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  const t100 = k.text(bx + 40, by + 44, '100', { 'font-size': 30 });
  const t80 = k.text(bx + 40, by + 52, '80', { 'font-size': 38, fill: pal.red });
  const strike = el('line', { x1: bx + 12, y1: by + 36, x2: bx + 68, y2: by + 36, stroke: pal.red, 'stroke-width': 4, 'stroke-linecap': 'round' });
  const badge = k.g({});
  el('circle', { r: 24, fill: pal.red }, badge);
  k.text(0, 6, '-20%', { 'font-size': 15, fill: '#fff' }, badge);
  const b = k.buddy({ x: 40, y: FY, scale: 0.95 });
  hat(k, b, pal.blue, pal.blueDark);
  const xf = (t) => lerp(40, 120, easeInOut(seg(t, 0.2, 1.3)));
  return {
    update(t) {
      const o = walkTo(xf, t, 40), pt = easeOut(seg(t, 1.3, 1.8));
      P(b, { ...o, armR: o.m > 0.2 ? o.armR : lerp(8, 120, pt), mood: t > 3.0 ? 'grin' : 'smile', look: 0.6, blink: blinkAt(t), lift: 7 * hump(seg(t, 3.2, 3.9)) });
      if (o.m <= 0.2 && pt > 0.05) b.pose({ armR: reach(b, 0.95, 'R', bx + 10, by + 40) * pt + 8 * (1 - pt) });
      const sw = seg(t, 2.3, 2.8);
      t100.setAttribute('opacity', 1 - sw); t80.setAttribute('opacity', sw);
      k.tf(t80, 0, -6 * (1 - backOut(sw)), 0, 1, 1);
      strike.setAttribute('opacity', seg(t, 1.9, 2.2) * (1 - sw));
      const q = seg(t, 1.6, 2.1);
      k.tf(badge, bx + 82, by + 6, 12, q > 0 ? backOut(q) * (1 + 0.08 * wobble(seg(t, 2.1, 3.0))) : 0.001);
    }
  };
}
