// out of touch：孫がスマホを渡すが、祖父は上下逆さに持ち、遠ざけて首をかしげる（My grandpa is out of touch with new technology.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, backOut } from '../ease.js';
import { roomBg } from './look-over.js';
import { hp } from './dig.js';
import { P, blinkAt, mark } from './so-far-so-good.js';

// 祖父の見た目（白い眉・めがね・ひげ）を buddy の体に足す
export function grandpa(k, b) {
  const { el, pal } = k;
  const f = b.body.children[3];
  el('path', { d: 'M -20 -66 Q -10 -72 -2 -66 M 2 -66 Q 10 -72 20 -66', stroke: '#fff', 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round' }, f);
  el('circle', { cx: -10, cy: -54, r: 8, fill: 'none', stroke: pal.ink, 'stroke-width': 2 }, f);
  el('circle', { cx: 10, cy: -54, r: 8, fill: 'none', stroke: pal.ink, 'stroke-width': 2 }, f);
  el('line', { x1: -2, y1: -54, x2: 2, y2: -54, stroke: pal.ink, 'stroke-width': 2 }, f);
  el('path', { d: 'M -12 -42 Q 0 -48 12 -42 Q 6 -36 0 -40 Q -6 -36 -12 -42 Z', fill: '#fff' }, f);
  el('path', { d: 'M -26 -72 Q 0 -94 26 -72', stroke: '#fff', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round', opacity: 0.9 }, b.body);
}
export function smartphone(k, parent) {
  const g = k.g({}, parent), pal = k.pal;
  k.el('rect', { x: -9, y: -15, width: 18, height: 30, rx: 3.5, fill: pal.ink }, g);
  k.el('rect', { x: -7, y: -11, width: 14, height: 22, rx: 1.5, fill: '#9FD0F2' }, g);
  [[-3.5, -6, pal.coral], [3.5, -6, pal.yellow], [-3.5, 1, pal.green], [3.5, 1, pal.violet]].forEach(([x, y, c]) => k.el('rect', { x: x - 2.5, y: y - 2.5, width: 5, height: 5, rx: 1.2, fill: c }, g));
  k.el('rect', { x: -3, y: -14, width: 6, height: 1.6, rx: 0.8, fill: '#55607A' }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, 'スマホを渡す'], [1.6, '逆さに持つ'], [3.0, 'わからない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  k.shadow(330, FY + 1, 26, 4);
  el('rect', { x: 306, y: FY - 70, width: 48, height: 70, rx: 5, fill: pal.wood });
  el('rect', { x: 314, y: FY - 92, width: 32, height: 22, rx: 4, fill: pal.coffee });
  el('circle', { cx: 330, cy: FY - 81, r: 7, fill: '#fff', stroke: pal.ink, 'stroke-width': 1.5 });
  const G = k.buddy({ x: 120, y: FY, scale: 0.8 });
  const D = k.buddy({ x: 236, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark });
  grandpa(k, D);
  const ph = smartphone(k);
  const qs = [0, 1].map(() => mark(k, 'q'));
  return {
    update(t) {
      const give = easeInOut(seg(t, 0.3, 1.0)), take = easeInOut(seg(t, 1.0, 1.3));
      P(G, { x: lerp(120, 150, give), armR: lerp(8, 72, give) * (1 - take) + 8 * take, look: 0.5, mood: t > 2.8 ? 'flat' : 'smile', blink: blinkAt(t) });
      const far = easeInOut(seg(t, 1.6, 2.4));
      const scratch = Math.sin(t * 16) * 8 * seg(t, 3.0, 3.3);
      P(D, { facing: -1, armR: t < 1.3 ? lerp(8, 70, seg(t, 0.8, 1.1)) : lerp(70, 92, far), armL: t > 3.0 ? lerp(8, 172, easeOut(seg(t, 3.0, 3.3))) + scratch : 8,
        lean: lerp(0, -8, far), look: 0.6, mood: t > 2.4 ? 'flat' : 'smile', blink: blinkAt(t, 1) });
      const hg = hp(G, 0.8, 'R'), hd = hp(D, 1, 'R');
      const x = lerp(hg.x + 4, hd.x - 4, take), y = lerp(hg.y - 10, hd.y - 12, take);
      tf(ph, x, y, 180 * easeInOut(seg(t, 1.4, 2.0)) + 6 * Math.sin(t * 5) * seg(t, 2, 2.4), 1);
      qs.forEach((q, i) => {
        const p = seg(t, 2.5 + i * 0.4, 2.8 + i * 0.4);
        tf(q, 214 - i * 24, 120 - i * 14 - 4 * Math.sin(t * 4 + i), 0, Math.max(0.001, backOut(p)));
      });
    }
  };
}
