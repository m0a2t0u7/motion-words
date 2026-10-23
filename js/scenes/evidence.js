// evidence：虫めがねで机と箱を調べるが、何も見つからない。首をかしげて、手がかりなし（例文 There is no evidence that he took the money.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, desk, hp, cloud } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, '調べ始める'], [1.2, '探し回る'], [3.2, '証拠なし']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.0;
  const FY = roomBg(k, 'home', 240);
  const b = k.buddy({ x: 180, y: FY, scale: S });
  desk(k, 140, 250, 200);
  k.shadow(290, 200, 30, 3);
  // お金の箱（ふたが開いて、中にコイン）
  el('rect', { x: 262, y: 176, width: 56, height: 24, rx: 3, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 2 });
  el('path', { d: 'M 262 176 L 270 160 H 310 L 318 176 Z', fill: pal.woodDark });
  [[276, 170], [290, 168], [302, 171]].forEach(([x, y]) => el('ellipse', { cx: x, cy: y, rx: 7, ry: 3, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 }));
  // 虫めがね
  const mg = g({});
  el('line', { x1: 0, y1: 0, x2: 12, y2: -13, stroke: pal.woodDark, 'stroke-width': 5, 'stroke-linecap': 'round' }, mg);
  el('circle', { cx: 19, cy: -21, r: 13, fill: 'rgba(200,232,255,0.45)', stroke: pal.blueDark, 'stroke-width': 3.5 }, mg);
  // 考え雲：指紋に×
  const cl = cloud(k, 84, 60, -1);
  [14, 9, 4].forEach((r, i) => el('ellipse', { cx: 0, cy: 0, rx: r, ry: r * 1.2, fill: 'none', stroke: pal.sub, 'stroke-width': 2, 'stroke-dasharray': i === 1 ? '8 3' : '14 4' }, cl.g));
  el('path', { d: 'M -17 -17 L 17 17 M 17 -17 L -17 17', stroke: pal.red, 'stroke-width': 5, 'stroke-linecap': 'round' }, cl.g);
  return {
    update(t) {
      const sc = seg(t, 0.8, 3.0), mx = lerp(180, 232, easeInOut(sc)), end = easeInOut(seg(t, 3.0, 3.6));
      const sw = Math.sin(sc * Math.PI * 4) * 12 * hump(sc);
      const o = { x: mx, lean: 4, armL: lerp(8, 60, end), look: lerp(0.8, 0, end), mood: t > 3.1 ? 'sad' : 'flat', blink: blinkAt(t), squash: 1 - 0.02 * hump(seg(t, 3.0, 3.7)) };
      P(b, { ...o, armR: 8 });
      P(b, { ...o, armR: lerp(8, 75 + sw, easeOut(seg(t, 0, 0.8))) + end * 10 });
      const h = hp(b, S, 'R');
      tf(mg, h.x - 3, h.y + 2);
      cl.show(seg(t, 3.2, 3.8), 340, 100);
    }
  };
}
