// exercise：毎日30分、ジャンピングジャックで体を動かす。時計の針が30分進み、カレンダーに毎日の印がつく（例文 I exercise for thirty minutes every day.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';

export const meta = { duration: 4.6, beats: [[0, '運動の前'], [1.2, '体を動かす'], [3.8, '30分たった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 244, mood: 'indoor' });
  el('rect', { x: 120, y: FY - 4, width: 160, height: 4, fill: pal.floorEdge });
  el('ellipse', { cx: 200, cy: FY + 12, rx: 96, ry: 12, fill: '#CFE9F7' });
  // 時計（30分で半周）
  const ck = g({}); tf(ck, 70, 70);
  el('circle', { r: 30, fill: '#fff', stroke: pal.ink, 'stroke-width': 4 }, ck);
  for (let i = 0; i < 12; i++) el('line', { x1: 0, y1: -24, x2: 0, y2: -27, stroke: pal.sub, 'stroke-width': 2, transform: `rotate(${i * 30})` }, ck);
  const arc = el('path', { d: '', fill: pal.green, opacity: 0.35 }, ck);
  const hm = el('line', { x1: 0, y1: 0, x2: 0, y2: -22, stroke: pal.ink, 'stroke-width': 3, 'stroke-linecap': 'round' }, ck);
  el('line', { x1: 0, y1: 0, x2: 0, y2: -13, stroke: pal.ink, 'stroke-width': 4, 'stroke-linecap': 'round', transform: 'rotate(0)' }, ck);
  el('circle', { r: 3, fill: pal.ink }, ck);
  // カレンダー（毎日）
  const cal = g({}); tf(cal, 330, 70);
  el('rect', { x: -44, y: -34, width: 88, height: 68, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, cal);
  el('rect', { x: -44, y: -34, width: 88, height: 13, rx: 6, fill: pal.red }, cal);
  const ticks = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    const c = g({}, cal); tf(c, -26 + j * 26, -6 + i * 18);
    el('rect', { x: -10, y: -7, width: 20, height: 14, rx: 3, fill: '#EEF1F5' }, c);
    ticks.push(el('path', { d: 'M -5 0 L -1 4 L 6 -5', fill: 'none', stroke: pal.green, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0 }, c));
  }
  const b = k.buddy({ x: 200, y: FY, facing: 1, scale: 1.05 });
  const legG = b.g.children[1].children;
  const sw = [0, 1].map(() => el('path', { d: 'M 0 -7 Q 5 0 0 5 Q -5 0 0 -7 Z', fill: pal.water, opacity: 0 }));
  return {
    update(t) {
      const run = seg(t, 1.0, 3.8), on = t > 1.0 && t < 3.9 ? 1 : 0;
      const ph = (t - 1.0) * 7.5, c = (Math.sin(ph) + 1) / 2;   // 0=閉じ 1=開き
      const s = on ? c : 0;
      const hop = on ? Math.abs(Math.cos(ph)) * 0 + (1 - Math.abs(Math.sin(ph + Math.PI / 2))) * 0 : 0;
      const air = on ? Math.max(0, Math.sin(ph + Math.PI / 2)) * 9 : 0;
      b.pose({ armR: lerp(8, 165, s), armL: lerp(8, 165, s), lift: air, squash: 1 - (on ? 0.05 * Math.max(0, -Math.sin(ph + Math.PI / 2)) : 0), mood: t > 3.9 ? 'grin' : on ? 'open' : 'smile', lean: 0 });
      [0, 1].forEach((i) => legG[i].setAttribute('transform', `translate(${i ? 12 : -12} ${-14 - air}) rotate(${(i ? -1 : 1) * 24 * s})`));
      // 時計
      const m = 180 * easeInOut(run), a = (m * Math.PI) / 180;
      k.set(hm, { transform: `rotate(${m})` });
      k.set(arc, { d: m > 1 ? `M 0 0 L 0 -26 A 26 26 0 ${m > 180 ? 1 : 0} 1 ${(26 * Math.sin(a)).toFixed(2)} ${(-26 * Math.cos(a)).toFixed(2)} Z` : '' });
      // 毎日の印
      ticks.forEach((tk, i) => k.set(tk, { opacity: seg(t, 3.7 + i * 0.1, 3.8 + i * 0.1) }));
      sw.forEach((p, i) => k.set(p, { opacity: on * seg(t, 1.8 + i, 2.0 + i) * 0.9, transform: `translate(${200 + (i ? 28 : -28)} ${FY - 108 + ((t * 40 + i * 20) % 20)})` }));
    }
  };
}
