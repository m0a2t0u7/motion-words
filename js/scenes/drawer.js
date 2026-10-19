// drawer：たんすのいちばん上の引き出しを開けると、中にはさみが入っている（例文 The scissors are in the top drawer.）
// 共通ヘルパー：scissors（はさみ）
import { seg, lerp, easeInOut, easeOut, wobble, hump } from '../ease.js';
import { reach, hp } from './dig.js';
import { gait } from './weigh.js';
import { P, blinkAt } from './run-after.js';
import { homeBg } from './furniture.js';

// はさみ（原点＝支点、刃は +x 方向）
export function scissors(k, parent, col = '#F2685B') {
  const g = k.g({}, parent), { el } = k;
  el('path', { d: 'M 0 -1 L 26 -4 L 26 -2 Z', fill: '#C9D2DE', stroke: '#9AA4B4', 'stroke-width': 1 }, g);
  el('path', { d: 'M 0 1 L 26 4 L 26 2 Z', fill: '#C9D2DE', stroke: '#9AA4B4', 'stroke-width': 1 }, g);
  el('ellipse', { cx: -9, cy: -5, rx: 7, ry: 4.5, fill: 'none', stroke: col, 'stroke-width': 3 }, g);
  el('ellipse', { cx: -9, cy: 5, rx: 7, ry: 4.5, fill: 'none', stroke: col, 'stroke-width': 3 }, g);
  el('circle', { r: 1.6, fill: '#7A8597' }, g);
  return g;
}

export const meta = { duration: 4.0, beats: [[0, 'たんす'], [1.0, '上の引き出し'], [2.4, 'はさみがある']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9;
  const FY = homeBg(k, { winX: 290, winW: 80 });
  const X0 = 180, X1 = 330, TOP = 150, DH = 26;
  // たんす本体
  k.shadow((X0 + X1) / 2, FY + 1, 82, 5);
  el('rect', { x: X0 - 4, y: TOP - 8, width: X1 - X0 + 8, height: 9, rx: 3, fill: pal.woodDark });
  el('rect', { x: X0, y: TOP, width: X1 - X0, height: FY - TOP - 6, fill: '#E7C9A0' });
  el('rect', { x: X0 + 4, y: FY - 8, width: 10, height: 8, fill: pal.woodDark });
  el('rect', { x: X1 - 14, y: FY - 8, width: 10, height: 8, fill: pal.woodDark });
  // 上にランプと写真立て
  el('rect', { x: 290, y: TOP - 30, width: 22, height: 22, rx: 2, fill: '#fff', stroke: pal.woodDark, 'stroke-width': 3 });
  el('path', { d: `M 210 ${TOP - 8} L 214 ${TOP - 28} L 226 ${TOP - 28} L 230 ${TOP - 8} Z`, fill: pal.violet });
  // 下の2段（閉じたまま）
  [1, 2].forEach((i) => {
    const y = TOP + 6 + i * (DH + 4);
    el('rect', { x: X0 + 6, y, width: X1 - X0 - 12, height: DH, rx: 3, fill: '#F0D7B3', stroke: pal.woodDark, 'stroke-width': 1.5 });
    [X0 + 32, X1 - 32].forEach((x) => el('rect', { x: x - 8, y: y + DH / 2 - 2, width: 16, height: 4, rx: 2, fill: pal.woodDark }));
  });
  // いちばん上の引き出し：中（はさみ）＋前板
  const y0 = TOP + 6;
  const inner = el('path', { fill: '#C9A577' });
  const cp = k.clip((c) => el('rect', { x: X0, y: y0 - 30, width: X1 - X0, height: 60 }, c));
  const content = g({ 'clip-path': cp });
  const sc = scissors(k, content);
  const clip2 = el('rect', { x: 220, y: 0, width: 20, height: 6, rx: 2, fill: pal.yellow }, content);
  const fr = g({});
  el('rect', { x: X0 + 6, y: 0, width: X1 - X0 - 12, height: DH, rx: 3, fill: '#F0D7B3', stroke: pal.woodDark, 'stroke-width': 1.5 }, fr);
  [X0 + 32, X1 - 32].forEach((x) => el('rect', { x: x - 8, y: DH / 2 - 2, width: 16, height: 4, rx: 2, fill: pal.woodDark }, fr));
  const b = k.buddy({ x: 70, y: FY, scale: S });
  const xf = (t) => lerp(70, 160, easeInOut(seg(t, 0.15, 0.95)));
  const mark = g({}); el('circle', { r: 10, fill: pal.yellow }, mark); k.text(0, 1, '!', { 'font-size': 15 }, mark);
  return {
    update(t) {
      const w = gait(xf, t, 70, 14, 0.12);
      const grab = easeInOut(seg(t, 1.0, 1.3)), open = easeOut(seg(t, 1.3, 1.9));
      const point = easeInOut(seg(t, 2.4, 2.8));
      const D = 30 * open;
      // 前板が手前に出て、上から中が見える
      tf(fr, 0, y0 + D * 0.7, 0, 1, 1);
      fr.setAttribute('transform', `translate(${(X0 + X1) / 2} ${y0 + D * 0.7}) scale(${1 + 0.04 * open}) translate(${-(X0 + X1) / 2} 0)`);
      const iy = y0 + D * 0.7;
      k.set(inner, { d: `M ${X0 + 10} ${y0} L ${X1 - 10} ${y0} L ${X1 - 6} ${iy} L ${X0 + 6} ${iy} Z`, opacity: open > 0.01 ? 1 : 0 });
      tf(sc, 266, y0 + 4 + 8 * open, -8, 1.25, 0.6 + 0.4 * open);
      k.set(clip2, { y: y0 + 8 * open });
      content.setAttribute('opacity', open > 0.05 ? 1 : 0);
      const pose = { x: w.x, walk: w.walk, lean: w.lean + 6 * grab * (1 - point), look: 0.5, blink: blinkAt(t), mood: t > 2.2 ? 'grin' : 'smile' };
      P(b, pose);
      const hx = X0 + 32, hy = y0 + D * 0.7 + DH / 2;
      let armR = lerp(8, reach(b, S, 'R', hx, hy), grab);
      armR = lerp(armR, reach(b, S, 'R', 220, y0 - 4) + 6 * Math.sin(t * 7) * point, point);
      P(b, { ...pose, armR });
      const m = seg(t, 2.5, 2.9);
      tf(mark, 260, y0 - 30 - 6 * m, 0, m > 0 ? 0.4 + 0.6 * easeOut(m) : 0.001);
    }
  };
}
