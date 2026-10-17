// cut down：まめが斧で古い木の根元を何度も切り、木が向こう側へ倒れる（例文 They cut down the old tree.）
import { seg, lerp, easeInOut, easeOut, easeIn, wobble, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '立っている木'], [1.43, '斧で切る'], [3.54, '倒れた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('rect', { x: 0, y: 236, width: 400, height: 8, fill: '#CFEBC8' });
  el('ellipse', { cx: 70, cy: 56, rx: 34, ry: 12, fill: '#fff', opacity: 0.8 });
  el('ellipse', { cx: 330, cy: 40, rx: 28, ry: 10, fill: '#fff', opacity: 0.8 });
  el('path', { d: 'M 0 236 Q 40 200 90 236 Z', fill: '#BFE3B8' });
  // 切り株（動かない）
  const CY = 216;
  k.shadow(238, FY + 1, 30, 5);
  el('rect', { x: 229, y: CY, width: 18, height: 20, fill: pal.woodDark });
  el('path', { d: 'M 224 236 Q 229 222 229 216 L 247 216 Q 247 222 252 236 Z', fill: pal.woodDark });
  // 木（根元の切り口を軸に倒れる）
  const tree = g({});
  el('rect', { x: -9, y: -110, width: 18, height: 110, fill: pal.woodDark }, tree);
  el('rect', { x: -3, y: -100, width: 4, height: 90, rx: 2, fill: '#fff', opacity: 0.18 }, tree);
  const canopy = g({}, tree);
  [[0, -116, 34, pal.green], [-27, -98, 26, '#52BC74'], [27, -98, 26, '#52BC74'], [-12, -138, 24, pal.green], [15, -140, 22, '#52BC74']].forEach(([x, y, r, c]) => el('circle', { cx: x, cy: y, r, fill: c }, canopy));
  el('circle', { cx: -10, cy: -128, r: 14, fill: '#7FD39A', opacity: 0.5 }, canopy);
  // 切り込み（木の根元の左側）
  const notch = el('path', { d: '', fill: '#8A6A47' });
  const notch2 = el('path', { d: '', fill: '#F3E0C2' });

  const b = k.buddy({ x: 138, y: FY, scale: 1 });
  const axe = g({});
  const handle = el('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: pal.woodDark, 'stroke-width': 4.5, 'stroke-linecap': 'round' }, axe);
  const head = g({}, axe);
  el('path', { d: 'M -3 -5 L 5 -12 L 12 -9 L 12 9 L 5 12 L -3 5 Z', fill: '#B9C3D0', stroke: '#8591A3', 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, head);
  const chips = [0, 1, 2, 3].map(() => el('rect', { width: 5, height: 3, rx: 1, fill: pal.wood }));
  const dust = g({});
  [[0, 0, 12], [-16, 4, 9], [16, 4, 10], [-8, -8, 8]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#fff', opacity: 0.9 }, dust));
  const leaves = [0, 1, 2, 3, 4].map(() => el('path', { d: 'M 0 0 Q 5 -4 10 0 Q 5 4 0 0 Z', fill: pal.green }));

  const HIT = [1.05, 1.65, 2.25];
  const L = 44;
  return {
    update(t0) {
      const t = t0 * 1.0455;
      // 斧の動き：構える(上) → 振り下ろす → 反動、を3回
      let a = 30, phi = -70;
      let hitIdx = -1, since = 99;
      HIT.forEach((h, i) => { if (t >= h - 0.4 && t < h + 0.45) hitIdx = i; if (t >= h) since = Math.min(since, t - h); });
      const stepBack = easeInOut(seg(t, 2.6, 3.0));
      if (hitIdx >= 0) {
        const u = t - HIT[hitIdx];
        if (u < -0.12) { const p = easeOut(seg(u, -0.4, -0.12)); a = lerp(hitIdx ? 70 : 30, 150, p); phi = lerp(hitIdx ? 26 : -70, -80, p); }
        else if (u < 0) { const p = easeIn(seg(u, -0.12, 0)); a = lerp(150, 62, p); phi = lerp(-80, 26, p); }
        else { const p = easeOut(seg(u, 0, 0.4)); a = lerp(62, 70, p); phi = lerp(26, 20, p); }
      } else if (t >= HIT[2] + 0.45) { const p = easeInOut(seg(t, HIT[2] + 0.45, 2.9)); a = lerp(70, 30, p); phi = lerp(20, -70, p); }
      else if (t < HIT[0] - 0.4) { a = 30; phi = -70; }
      const bx = 138 - 20 * stepBack;
      const alarm = seg(t, 2.6, 3.0) * (1 - seg(t, 4.0, 4.4));
      b.pose({ x: bx, armR: a, armL: lerp(8, 70, alarm) + (hitIdx >= 0 ? 12 : 0), lean: hitIdx >= 0 ? 5 : 0, look: 0.8, mood: t > 2.7 && t < 3.9 ? 'open' : t > 3.9 ? 'grin' : 'flat', blink: t > 0.3 && t < 0.4 ? 1 : 0 });
      const h = b.handPos('R');
      const rad = (phi * Math.PI) / 180;
      const hx = h.x + L * Math.cos(rad), hy = h.y + L * Math.sin(rad);
      k.set(handle, { x1: h.x, y1: h.y, x2: hx, y2: hy });
      tf(head, hx, hy, phi);
      // 切り込み：当たるたびに深くなる
      let depth = 0;
      HIT.forEach((hh, i) => { depth += 5 * easeOut(seg(t, hh, hh + 0.12)); });
      notch.setAttribute('d', depth > 0.1 ? `M 228 ${CY - 9} L ${229 + depth * 1.3} ${CY} L 228 ${CY + 9} Z` : '');
      notch2.setAttribute('d', '');
      // 木の揺れと倒れ
      const fall = seg(t, 2.65, 3.5);
      const fp = Math.pow(fall, 2.2);
      let rot = 90 * fp;
      const hitWob = HIT.reduce((s, hh) => s + (t > hh ? wobble(seg(t, hh, hh + 0.5), 2, 4) * 1.3 : 0), 0);
      const land = seg(t, 3.5, 4.2);
      rot = fall < 1 ? rot + (fall > 0 ? 0 : hitWob) : 90 - 2.5 * Math.max(0, wobble(land, 1.6, 4));
      const sl = easeIn(seg(fall, 0.45, 1));
      tf(tree, 238 + 13 * sl, CY + 9 * sl, rot, 0.82);
      // 切りくず
      chips.forEach((c, i) => {
        const hh = HIT[i % 3], u = t - hh - i * 0.0;
        const on = u > 0 && u < 0.45 && i < 3;
        const x = 226 - 26 * u - i * 5, y = CY - 4 - 40 * u + 150 * u * u;
        tf(c, x, y, u * 400 + i * 40, 1);
        c.setAttribute('opacity', on ? 1 : 0);
      });
      // 着地：土ぼこりと葉
      const ip = seg(t, 3.5, 4.3);
      tf(dust, 358, 232, 0, 0.5 + 0.9 * ip);
      dust.setAttribute('opacity', ip > 0 ? 0.85 * (1 - ip) : 0);
      leaves.forEach((lf, i) => {
        const p = seg(t, 3.45, 4.5), ang = -40 + i * 40;
        tf(lf, 345 + 40 * p * Math.cos((ang * Math.PI) / 180) + i * 4, 200 - 30 * Math.sin(Math.PI * p) + 36 * p * p + i * 3, ang + 300 * p, 1);
        lf.setAttribute('opacity', p > 0 && p < 1 ? 1 - seg(p, 0.7, 1) : 0);
      });
    }
  };
}
