// room：家の断面。まめが階段を上がって2階の自分の部屋に入り、その部屋に灯りがともる（例文 My room is on the second floor.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';

export const meta = { duration: 4.6, beats: [[0, '1階'], [1.5, '階段を上る'], [3.4, '2階の自分の部屋']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 244, mood: 'outdoor' });
  // 家の外形
  el('path', { d: 'M 40 78 L 200 24 L 360 78 Z', fill: pal.coral, stroke: pal.coral, 'stroke-width': 6, 'stroke-linejoin': 'round' });
  el('rect', { x: 52, y: 78, width: 296, height: 166, fill: '#FBE9DC' });
  // 1階・2階の部屋（断面）
  el('rect', { x: 62, y: 166, width: 276, height: 78, fill: '#F6F0E6' });
  const up = el('rect', { x: 62, y: 86, width: 276, height: 70, fill: '#EEF4F8' });
  const warm = el('rect', { x: 190, y: 86, width: 148, height: 70, fill: '#FFE9A8', opacity: 0 });
  el('rect', { x: 62, y: 156, width: 276, height: 10, fill: pal.woodDark });
  el('rect', { x: 62, y: 244 - 4, width: 276, height: 4, fill: pal.wood });
  // 階段（2階の床は x>=190 から。左は吹き抜けの階段）
  el('path', { d: 'M 108 240 L 190 160 L 190 240 Z', fill: '#E6CFA8' });
  for (let i = 0; i < 6; i++) { const x = 108 + i * 13.6, y = 240 - i * 13.3; el('path', { d: `M ${x} ${y} h 13.6 v -13.3`, fill: 'none', stroke: pal.woodDark, 'stroke-width': 2.4 }); }
  el('rect', { x: 62, y: 156, width: 128, height: 10, fill: '#FBE9DC' });
  el('rect', { x: 62, y: 86, width: 128, height: 70, fill: '#EEF4F8' });
  el('rect', { x: 62, y: 156, width: 128, height: 0.1, fill: 'none' });
  // 2階の部屋：ベッドと机、窓
  el('rect', { x: 276, y: 96, width: 46, height: 40, rx: 4, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 236, y: 132, width: 80, height: 22, rx: 4, fill: pal.blue }); el('rect', { x: 236, y: 124, width: 24, height: 12, rx: 5, fill: '#fff' }); el('rect', { x: 236, y: 150, width: 6, height: 6, fill: pal.blueDark }); el('rect', { x: 310, y: 150, width: 6, height: 6, fill: pal.blueDark });
  el('rect', { x: 202, y: 128, width: 26, height: 4, fill: pal.woodDark }); el('rect', { x: 204, y: 132, width: 4, height: 24, fill: pal.woodDark }); el('rect', { x: 222, y: 132, width: 4, height: 24, fill: pal.woodDark });
  el('rect', { x: 62, y: 98, width: 0.1, height: 0.1 });
  // 1階のソファ、ドア
  el('rect', { x: 250, y: 204, width: 70, height: 30, rx: 8, fill: pal.violet }); el('rect', { x: 250, y: 190, width: 70, height: 18, rx: 8, fill: '#B9A5F7' });
  // 部屋の札
  const tag = g({}); tf(tag, 204, 108);
  const tg = el('rect', { x: -15, y: -11, width: 30, height: 22, rx: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, tag);
  const txt = k.text(0, 0, '2F', { 'font-size': 13 }, tag);
  const t1 = g({}); tf(t1, 84, 182); el('rect', { x: -15, y: -11, width: 30, height: 22, rx: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, t1); k.text(0, 0, '1F', { 'font-size': 13 }, t1);
  el('rect', { x: 0, y: 244, width: 400, height: 2, fill: pal.floorEdge });
  const S = 0.72;
  const b = k.buddy({ x: 90, y: 238, scale: S });
  const glow = el('rect', { x: 62, y: 86, width: 276, height: 70, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 0, opacity: 0, 'pointer-events': 'none' });
  const D1 = 36, D2 = 98, D3 = 70, DT = D1 + D2 + D3;
  const pos = (d) => d < D1 ? { x: 90 + d, y: 238, a: 0 } : d < D1 + D2 ? { x: 126 + (d - D1) * (64 / D2), y: 238 - (d - D1) * (80 / D2), a: 1 } : { x: 190 + (d - D1 - D2), y: 158, a: 0 };
  return {
    update(t) {
      const pr = easeInOut(seg(t, 0.7, 3.4)), d = pr * DT, p = pos(d);
      const v = clamp(Math.abs(easeInOut(seg(t + 0.02, 0.7, 3.4)) - easeInOut(seg(t - 0.02, 0.7, 3.4))) * DT / 0.04 / 24);
      const ph = d * 0.2, m = v;
      const arrive = seg(t, 3.4, 3.9), arr = hump(seg(t, 3.5, 4.4));
      b.pose({ x: p.x, y: p.y, walk: ph, armL: 8 + Math.sin(ph) * 14 * m, armR: 8 - Math.sin(ph) * 14 * m + 112 * arr * 0 + 0, lean: 3 * m + (p.a ? 6 : 0), look: 0.6, mood: arrive > 0.3 ? 'grin' : 'smile', squash: 1 });
      if (arrive > 0) b.pose({ armR: 8 + 150 * hump(seg(t, 3.5, 4.5)) + 0 });
      const lit = seg(t, 3.2, 3.9);
      k.set(warm, { opacity: 0.55 * lit }); k.set(tg, { fill: lit > 0.5 ? pal.yellow : '#fff' });
      tf(tag, 204, 108, 0, 1 + 0.25 * hump(seg(t, 3.2, 4.0)), 1 + 0.25 * hump(seg(t, 3.2, 4.0)));
      k.set(glow, { opacity: lit, 'stroke-width': 4, stroke: pal.yellowDark });
    }
  };
}
