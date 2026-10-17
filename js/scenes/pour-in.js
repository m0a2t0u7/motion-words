// pour in：まめが牛乳パックを傾けてボウルへ注ぎ入れ、パックを置いてスプーンで混ぜる（例文 Pour in the milk and stir.）
import { seg, lerp, easeInOut, easeOut, easeIn, wobble } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '牛乳を持つ'], [1.15, '中へ注ぐ'], [3.44, 'かき混ぜる']] };

const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, p) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * p).toString(16).padStart(2, '0')).join('');

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 36, y: 44, width: 70, height: 60, rx: 6, fill: '#DDEFFA' });
  el('line', { x1: 71, y1: 44, x2: 71, y2: 104, stroke: '#fff', 'stroke-width': 4 });
  // ガラスのボウル（中身が見える）
  k.shadow(268, FY, 54, 6);
  const bowl = 'M 228 204 L 308 204 Q 306 232 290 236 L 246 236 Q 230 232 228 204 Z';
  el('path', { d: bowl, fill: '#DCE4EE' });
  const bc = k.clip((c) => el('path', { d: bowl }, c));
  const batter = el('rect', { x: 226, y: 224, width: 84, height: 20, fill: '#F6D77A', 'clip-path': bc });
  const milk = el('rect', { x: 226, y: 224, width: 84, height: 0, fill: '#fff', 'clip-path': bc });
  const swirl = g({ 'clip-path': bc });
  [0, 1].forEach((i) => el('path', { d: `M ${252 + i * 10} ${220 - i * 2} q 16 -6 32 0 q -16 5 -32 0`, fill: 'none', stroke: '#EBC565', 'stroke-width': 2, 'stroke-linecap': 'round' }, swirl));
  el('path', { d: bowl, fill: 'none', stroke: pal.sub, 'stroke-width': 3, 'stroke-linejoin': 'round', opacity: 0.55 });
  el('rect', { x: 225, y: 201, width: 86, height: 6, rx: 3, fill: '#CBD3DE' });
  const stream = el('path', { d: '', fill: 'none', stroke: '#fff', 'stroke-width': 5, 'stroke-linecap': 'round', pathLength: 1 });
  const stream2 = el('path', { d: '', fill: 'none', stroke: '#D9E2EC', 'stroke-width': 1.5, 'stroke-linecap': 'round', pathLength: 1 });

  const S = 1;
  const b = k.buddy({ x: 160, y: FY, scale: S });
  // 牛乳パック
  const carton = g({});
  el('polygon', { points: '2,-34 18,-47 34,-34', fill: '#E6EEF7', stroke: pal.blue, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, carton);
  el('rect', { x: 2, y: -34, width: 32, height: 58, rx: 3, fill: '#fff', stroke: pal.blue, 'stroke-width': 2.5 }, carton);
  el('rect', { x: 2, y: -8, width: 32, height: 16, fill: pal.blue }, carton);
  el('path', { d: 'M 18 -26 Q 25 -16 18 -12 Q 11 -16 18 -26 Z', fill: pal.blue, opacity: 0.55 }, carton);
  // スプーン（ボウルに立てかけてある）
  const sp = g({});
  const shaft = el('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: pal.woodDark, 'stroke-width': 4.5, 'stroke-linecap': 'round' }, sp);
  const head = el('ellipse', { cx: 0, cy: 0, rx: 7, ry: 5, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 1.5 }, sp);

  const HX = 214, HY = 187;      // スプーンの柄の先（立てかけ位置）
  const TX = 266, TY = 226;      // スプーンの先（ボウルの底）
  return {
    update(t0) {
      const t = t0 * 1.0455;
      const tilt = easeInOut(seg(t, 0.5, 1.3)) * (1 - easeInOut(seg(t, 2.3, 2.8)));
      const r = 58 * tilt;
      const stirP = seg(t, 3.2, 4.4);
      const drop = easeIn(seg(t, 2.85, 3.1));
      let a = lerp(100, 125, easeInOut(seg(t, 0.5, 1.3))) - 25 * easeInOut(seg(t, 2.3, 2.8)) - 0;
      // パックを置いたあと、手をスプーンの柄へ
      const toSp = easeInOut(seg(t, 3.0, 3.35));
      a = lerp(a, 75, toSp);
      const stirring = t > 3.35 && t < 4.4;
      const w = (t - 3.35) * 10;
      if (stirring) a = 75 + 8 * Math.sin(w);
      if (t >= 4.4) a = lerp(75, 40, easeInOut(seg(t, 4.4, 4.6)));
      b.pose({ armR: a, armL: 8, lean: 3 * tilt, look: 0.7, mood: t > 4.0 ? 'grin' : 'smile', blink: t > 0.2 && t < 0.3 ? 1 : 0 });
      const h = b.handPos('R');
      // パック：手で持ち、置くときは床へ落とす
      const placed = t > 2.85;
      if (placed) tf(carton, lerp(212.6, 187, easeOut(seg(t, 2.85, 3.15))), lerp(175.5, FY - 24, drop), 0);
      else tf(carton, h.x, h.y, r);
      // 注ぎ口から流れる牛乳
      const rad = (r * Math.PI) / 180;
      const sx = h.x + 40 * Math.cos(rad) + 40 * Math.sin(rad), sy = h.y + 40 * Math.sin(rad) - 40 * Math.cos(rad);
      const pa = seg(t, 1.0, 1.25), pb = 1 - seg(t, 2.1, 2.35);
      const lvl = lerp(224, 214, easeInOut(seg(t, 1.2, 2.3)));
      const d = `M ${sx} ${sy} Q ${sx + 8} ${sy + 3} ${sx + 12} ${lvl}`;
      [stream, stream2].forEach((s) => {
        s.setAttribute('d', d);
        s.setAttribute('stroke-dasharray', `0 ${1 - pb} ${Math.max(0, easeOut(pa) - (1 - pb))} 2`);
        s.setAttribute('opacity', pa > 0 && pb > 0 && !placed ? 1 : 0);
      });
      // ボウルの中身：黄色い生地の上に牛乳 → 混ざって均一なクリーム色
      const mixP = easeInOut(stirP);
      k.set(milk, { y: lvl, height: 224 - lvl });
      milk.setAttribute('fill', mix('#FFFFFF', '#FBEBB5', mixP));
      batter.setAttribute('fill', mix('#F6D77A', '#FBEBB5', mixP));
      swirl.setAttribute('opacity', stirring || t >= 4.4 ? 1 - mixP * 0.7 : 0);
      tf(swirl, 0, 0, 0, 1);
      // スプーン：立てかけ → 手に持って混ぜる
      const hold = toSp;
      const bx = lerp(HX, h.x, hold), by = lerp(HY, h.y, hold);
      const cx = TX + (stirring ? 11 * Math.cos(w) : 0), cy = TY - 2 + (stirring ? 3 * Math.sin(w) : 0);
      k.set(shaft, { x1: bx, y1: by, x2: cx, y2: cy });
      tf(head, cx, cy + 2, 0, 1);
      swirl.setAttribute('transform', `rotate(${(stirring ? w * 57 : 0) % 360} 268 218)`);
    }
  };
}
