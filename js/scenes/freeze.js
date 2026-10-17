// freeze：冬になって気温が下がり、湖の水が岸から中央へ向かって氷に変わっていく（例文 The lake freezes in winter.）
import { seg, lerp, easeInOut, easeOut, smooth, clamp } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '水の湖'], [1.6, '氷が広がる'], [3.6, '凍った湖']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 150, mood: 'outdoor' });
  const sky = el('rect', { x: 0, y: 0, width: 400, height: 150, fill: '#DDE7F0', opacity: 0 });
  // 遠景の山と岸
  el('path', { d: 'M 0 150 L 70 92 L 120 126 L 190 80 L 260 130 L 320 100 L 400 150 Z', fill: '#C8D3DE' });
  el('path', { d: 'M 70 92 L 82 104 L 70 100 L 62 106 Z M 190 80 L 204 96 L 190 92 L 178 98 Z M 320 100 L 332 112 L 320 108 L 310 114 Z', fill: '#fff' });
  const ground = el('rect', { x: 0, y: 150, width: 400, height: 150, fill: '#CDEBC0' });
  const snowg = el('rect', { x: 0, y: 150, width: 400, height: 150, fill: '#F4F8FB', opacity: 0 });
  // 湖
  const CX = 214, CY = 206, RX = 168, RY = 50;
  const ell = (rx, ry) => `M ${CX - rx} ${CY} A ${rx} ${ry} 0 1 0 ${CX + rx} ${CY} A ${rx} ${ry} 0 1 0 ${CX - rx} ${CY} Z`;
  el('path', { d: ell(RX + 6, RY + 4), fill: '#B5DDA6' });
  const snowrim = el('path', { d: ell(RX + 6, RY + 4), fill: '#fff', opacity: 0 });
  el('path', { d: ell(RX, RY), fill: pal.water });
  const rip = [0, 1, 2].map((i) => el('ellipse', { cx: CX - 40 + i * 50, cy: CY - 6 + i * 6, rx: 10, ry: 2.5, fill: 'none', stroke: '#fff', 'stroke-width': 1.6, opacity: 0.6 }));
  const ice = el('path', { d: '', fill: '#CDE8F8', 'fill-rule': 'evenodd' });
  const sheen = [[-80, -14, 40], [-20, 6, 56], [50, -12, 36], [92, 10, 30]].map(([x, y, w]) => el('path', { d: `M ${CX + x} ${CY + y} l ${w} -5`, stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0 }));
  const crack = el('path', { d: `M ${CX - 70} ${CY + 14} l 24 -10 l 14 8 l 22 -12 M ${CX + 20} ${CY - 18} l 18 12 l -6 14 l 20 8`, fill: 'none', stroke: '#9FC4DD', 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: 0 });
  // 木と人物
  const tree = g({}); tf(tree, 336, 160);
  el('rect', { x: -4, y: -40, width: 8, height: 40, fill: pal.woodDark }, tree);
  const leaf = el('circle', { cx: 0, cy: -52, r: 26, fill: '#7FD3A0' }, tree);
  const leaf2 = el('circle', { cx: -14, cy: -40, r: 17, fill: '#6BC48F' }, tree);
  const cap = el('path', { d: 'M -26 -52 Q 0 -86 26 -52 Q 0 -60 -26 -52 Z', fill: '#fff', opacity: 0 }, tree);
  const b = k.buddy({ x: 60, y: 250, scale: 0.9 });
  const sc = g({}, b.body);
  el('rect', { x: -30, y: -38, width: 60, height: 9, rx: 4, fill: pal.red }, sc);
  el('rect', { x: 14, y: -34, width: 9, height: 22, rx: 4, fill: '#D9534A' }, sc);
  // 温度計
  const TX = 362, TY = 56;
  el('rect', { x: TX - 6, y: TY, width: 12, height: 62, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  el('circle', { cx: TX, cy: TY + 68, r: 10, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  const mer = el('rect', { x: TX - 3, y: TY + 10, width: 6, height: 50, rx: 3, fill: pal.red });
  el('circle', { cx: TX, cy: TY + 68, r: 6.5, fill: pal.red });
  const mer2 = el('circle', { cx: TX, cy: TY + 68, r: 6.5, fill: pal.red });
  el('line', { x1: TX - 16, y1: TY + 42, x2: TX - 8, y2: TY + 42, stroke: pal.blue, 'stroke-width': 2, 'stroke-dasharray': '3 2' });
  k.text(TX - 24, TY + 42, '0', { 'font-size': 11, fill: pal.blueDark });
  // 雪
  const flakes = [];
  for (let i = 0; i < 24; i++) flakes.push(el('circle', { r: 1.8 + (i % 3) * 0.7, fill: '#fff', stroke: '#C9D6E3', 'stroke-width': 0.5 }));
  return {
    update(t) {
      const cold = easeInOut(seg(t, 0.2, 3.0)), pi = easeInOut(seg(t, 1.3, 3.5));
      k.set(sky, { opacity: 0.9 * cold });
      const sn = smooth(seg(t, 0.8, 3.6));
      k.set(snowg, { opacity: 0.85 * sn }); k.set(snowrim, { opacity: 0.9 * sn });
      k.set(cap, { opacity: sn });
      leaf.setAttribute('fill', t > 0 ? `rgb(${Math.round(lerp(127, 205, cold))},${Math.round(lerp(211, 226, cold))},${Math.round(lerp(160, 218, cold))})` : '#7FD3A0');
      leaf2.setAttribute('fill', `rgb(${Math.round(lerp(107, 190, cold))},${Math.round(lerp(196, 214, cold))},${Math.round(lerp(143, 205, cold))})`);
      // 氷：縁から中央へ向かって広がる（外周の楕円と縮む内側の楕円の差）
      const q = 1 - pi;
      k.set(ice, { d: pi > 0.005 ? ell(RX, RY) + ' ' + ell(Math.max(0.1, RX * q), Math.max(0.1, RY * q)) : '', opacity: 1 });
      rip.forEach((r, i) => { const u = (t * 0.7 + i * 0.35) % 1; k.set(r, { rx: 6 + 16 * u, ry: 1.5 + 4 * u, opacity: 0.6 * (1 - u) * (1 - pi) }); });
      sheen.forEach((s, i) => s.setAttribute('opacity', smooth(seg(t, 3.0 + i * 0.12, 3.5 + i * 0.12)) * 0.85));
      crack.setAttribute('opacity', smooth(seg(t, 3.4, 3.9)) * 0.9);
      // 温度計
      const h = lerp(46, 10, cold);
      k.set(mer, { y: TY + 60 - h, height: h });
      // 雪
      flakes.forEach((f, i) => { const sp = 18 + (i % 4) * 5, y = ((t * sp + i * 31) % 190) - 20, x = ((i * 53) % 400) + Math.sin(t * 1.5 + i) * 8; k.set(f, { cx: x, cy: y, opacity: smooth(seg(t, 0.6 + (i % 5) * 0.1, 1.2)) }); });
      // 人物：寒くて震える
      const sh = cold * Math.sin(t * 40) * 0.9;
      b.pose({ x: 60 + sh, armL: 14, armR: 14, squash: 1 - 0.02 * cold, mood: cold > 0.4 ? 'flat' : 'smile', look: 0.9, lean: 0 });
    }
  };
}
