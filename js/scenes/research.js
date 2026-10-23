// research：虫めがねで脳の図をじっくり調べ、結果の線をノートにまとめる（例文 She does research on brain health.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, hp, reach } from './look-over.js';

export const meta = { duration: 4.2, beats: [[0, '脳の図'], [1.0, 'じっくり調べる'], [3.2, '結果がわかる']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.0;
  const FY = roomBg(k, 'home', 240);
  const b = k.buddy({ x: 170, y: FY, scale: S });
  // ボード
  el('rect', { x: 215, y: 84, width: 150, height: 118, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  el('rect', { x: 255, y: 202, width: 6, height: 34, fill: pal.woodDark });
  el('rect', { x: 320, y: 202, width: 6, height: 34, fill: pal.woodDark });
  const br = g({}); tf(br, 262, 132);
  const pk = '#F5A7B8', pk2 = '#E5819A';
  el('ellipse', { cx: -11, cy: 0, rx: 21, ry: 24, fill: pk }, br);
  el('ellipse', { cx: 11, cy: 0, rx: 21, ry: 24, fill: pk }, br);
  el('path', { d: 'M 0 -22 V 22 M -20 -6 q 8 -8 14 0 M 6 8 q 8 -8 14 0 M -18 10 q 6 6 12 0 M 8 -10 q 6 -6 12 0', fill: 'none', stroke: pk2, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, br);
  // 結果の線（拍動のような線）
  const ln = el('path', { d: 'M 228 186 H 262 L 270 168 L 280 194 L 288 180 L 296 186 H 352', fill: 'none', stroke: pal.mintDark, 'stroke-width': 3.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 });
  const ok = g({}); el('circle', { r: 13, fill: pal.green }, ok);
  el('path', { d: 'M -6 0 l 4.5 4.5 l 8 -9', fill: 'none', stroke: '#fff', 'stroke-width': 3.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ok);
  // 虫めがね（原点＝持つ位置）
  const mg = g({});
  el('line', { x1: 0, y1: 0, x2: 12, y2: -13, stroke: pal.woodDark, 'stroke-width': 5, 'stroke-linecap': 'round' }, mg);
  el('circle', { cx: 19, cy: -21, r: 13, fill: 'rgba(200,232,255,0.45)', stroke: pal.blueDark, 'stroke-width': 3.5 }, mg);
  return {
    update(t) {
      const sc = seg(t, 1.0, 3.0), sw = Math.sin(sc * Math.PI * 2) * 22 * hump(sc);
      const o = { x: 170, lean: 4, armL: 8, look: 0.8, mood: t > 3.2 ? 'grin' : 'flat', blink: blinkAt(t) };
      P(b, { ...o, armR: 8 });
      const up = easeOut(seg(t, 0, 0.9));
      P(b, { ...o, armR: lerp(8, 100 + sw, up) });
      const h = hp(b, S, 'R');
      tf(mg, h.x - 3, h.y + 2);
      const p = 1 + 0.05 * Math.sin(t * 8) * (t > 1 ? 1 : 0.3);
      tf(br, 262, 132, 0, p, p);
      ln.setAttribute('stroke-dashoffset', 1 - easeInOut(seg(t, 2.2, 3.4)));
      tf(ok, 346, 106, 0, t < 3.3 ? 0.001 : backOut(seg(t, 3.3, 3.8)));
    }
  };
}
