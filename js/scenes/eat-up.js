// eat up：まめがフォークで野菜を一口ずつ口へ運び、お皿を空にする（例文 Eat up your vegetables, please.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '皿に野菜'], [1.4, '一口ずつ食べる'], [3.6, '皿が空になる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 36, y: 44, width: 70, height: 60, rx: 6, fill: '#DDEFFA' });
  el('line', { x1: 71, y1: 44, x2: 71, y2: 104, stroke: '#fff', 'stroke-width': 4 });
  // テーブルと皿
  k.shadow(282, FY, 110, 7);
  el('rect', { x: 172, y: 188, width: 210, height: 9, rx: 3, fill: pal.wood });
  [[184, 197], [366, 197]].forEach(([x, y]) => el('rect', { x, y, width: 9, height: 39, rx: 2, fill: pal.woodDark }));
  el('ellipse', { cx: 212, cy: 188, rx: 40, ry: 7, fill: '#EEF1F5', stroke: pal.line, 'stroke-width': 1.5 });
  el('ellipse', { cx: 212, cy: 187, rx: 29, ry: 4.5, fill: '#fff' });
  el('ellipse', { cx: 326, cy: 187, rx: 16, ry: 3.5, fill: '#EEF1F5' });
  el('rect', { x: 318, y: 168, width: 16, height: 19, rx: 4, fill: pal.water, opacity: 0.6 });
  const items = [];
  const spots = [[212, 170], [206, 180], [217, 180]];
  const mkBroc = (p) => { el('rect', { x: -2.5, y: 0, width: 5, height: 8, rx: 2, fill: '#7FBF6B' }, p); [[-5.5, -2, 6], [5.5, -2, 6], [0, -7.5, 7]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: pal.green }, p)); };
  const mkCarrot = (p) => { el('path', { d: 'M -9 -4.5 L 10 -1 L -9 4.5 Z', fill: '#FF9A4D' }, p); el('path', { d: 'M -9 0 l -4 -3 M -9 0 l -4 3', stroke: pal.green, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, p); };
  const mkTomato = (p) => { el('circle', { r: 7.5, fill: pal.red }, p); el('path', { d: 'M -3 -6.5 l 3 2 l 3 -2', stroke: pal.green, 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }, p); };
  [mkBroc, mkCarrot, mkTomato].forEach((mk) => { const p = g({}); mk(p); items.push(p); });

  const S = 1.2;
  const b = k.buddy({ x: 118, y: FY, scale: S });
  const fork = g({});
  const shaft = el('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: '#9AA5B5', 'stroke-width': 3.6, 'stroke-linecap': 'round' }, fork);
  const tines = g({}, fork);
  [-3, 0, 3].forEach((y) => el('line', { x1: 0, y1: y, x2: 8, y2: y, stroke: '#9AA5B5', 'stroke-width': 1.7, 'stroke-linecap': 'round' }, tines));

  const C0 = [0.9, 1.75, 2.6], L = 0.85;
  const tipAt = (i) => ({ x: spots[i][0] - 3, y: spots[i][1] + 3 });
  return {
    update(t) {
      let cyc = -1;
      C0.forEach((c, i) => { if (t >= c - 0.25 && t < c + L) cyc = i; });
      let a = 12, u = 0;
      if (cyc >= 0) {
        u = t - C0[cyc];
        if (u < 0) a = lerp(cyc ? 30 : 12, 75, easeOut(seg(u, -0.25, 0)));
        else if (u < 0.1) a = 75;
        else if (u < 0.42) a = lerp(75, -82, easeInOut(seg(u, 0.1, 0.42)));
        else if (u < 0.58) a = -82;
        else a = lerp(-82, cyc < 2 ? 30 : 12, easeInOut(seg(u, 0.58, L)));
      }
      const end = seg(t, 3.5, 3.9);
      const chew = cyc >= 0 && u > 0.42 && u < 0.9 ? Math.abs(Math.sin((u - 0.42) * 16)) : 0;
      b.pose({
        armR: a, armL: end > 0 ? lerp(8, -60, easeOut(end)) : 8, lean: cyc >= 0 && u < 0.4 ? 3 : 0,
        squash: 1 - 0.035 * chew, look: 0.55, mood: chew > 0.4 ? 'flat' : t > 3.6 ? 'grin' : 'smile', blink: t > 0.4 && t < 0.5 ? 1 : 0
      });
      const h = b.handPos('R');
      const rest = { x: h.x + 9, y: h.y - 3 };
      let tip = rest, holding = -1;
      if (cyc >= 0) {
        const pt = tipAt(cyc);
        if (u < 0) tip = { x: lerp(rest.x, pt.x, easeOut(seg(u, -0.25, 0))), y: lerp(rest.y, pt.y, easeOut(seg(u, -0.25, 0))) };
        else if (u < 0.1) tip = pt;
        else if (u < 0.42) { const e = easeInOut(seg(u, 0.1, 0.42)); tip = { x: lerp(pt.x, rest.x, e), y: lerp(pt.y, rest.y, e) }; }
        else if (u < 0.58) tip = rest;
        else tip = rest;
      }
      C0.forEach((c, i) => {
        const v = t - c;
        if (v < 0.1) { tf(items[i], spots[i][0], spots[i][1], 0, 1); items[i].setAttribute('opacity', 1); }
        else if (v < 0.5) holding = i;
        else items[i].setAttribute('opacity', 0);
      });
      k.set(shaft, { x1: h.x, y1: h.y, x2: tip.x, y2: tip.y });
      tf(tines, tip.x, tip.y, (Math.atan2(tip.y - h.y, tip.x - h.x) * 180) / Math.PI, 1);
      if (holding >= 0) {
        items[holding].setAttribute('opacity', 1);
        tf(items[holding], tip.x + 3, tip.y - 4, 0, 1 - seg(t - C0[holding], 0.4, 0.5));
      }
    }
  };
}
