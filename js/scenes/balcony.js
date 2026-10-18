// balcony：手すり付きのバルコニーの小さな丸テーブルで、2人がお茶を注ぎ合って飲む（例文 We had tea on the balcony.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { hp, reach } from './dig.js';

export const meta = { duration: 4.6, beats: [[0, 'バルコニー'], [1.3, 'お茶を注ぐ'], [3.0, '一口飲む']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 290, mood: 'outdoor' });
  // 遠景：街並みと木
  [[130, 40, 40], [172, 60, 36], [214, 34, 44], [262, 52, 34], [300, 42, 50], [352, 66, 40]].forEach(([x, h, w]) => el('rect', { x, y: 214 - h, width: w, height: h + 90, rx: 3, fill: '#DCE6EE' }));
  [[150, 218], [330, 224]].forEach(([x, y]) => { el('circle', { cx: x, cy: y, r: 22, fill: '#9FDDB5' }); });
  // 家の壁と掃き出し窓
  el('rect', { x: 0, y: 0, width: 118, height: 230, fill: '#FBE9DC' });
  el('rect', { x: 14, y: 70, width: 84, height: 152, rx: 4, fill: '#CFE9F7', stroke: '#fff', 'stroke-width': 5 }); el('line', { x1: 56, y1: 70, x2: 56, y2: 222, stroke: '#fff', 'stroke-width': 4 });
  // 床（バルコニー）
  el('rect', { x: 0, y: 232, width: 400, height: 12, fill: '#E3C49B' }); el('rect', { x: 0, y: 244, width: 400, height: 4, fill: pal.woodDark, opacity: 0.5 });
  const F = 234;
  // 鉢植え
  el('rect', { x: 366, y: F - 22, width: 20, height: 22, rx: 3, fill: pal.coralDark }); [-8, 0, 8].forEach((d, i) => el('ellipse', { cx: 376 + d, cy: F - 34 - (i % 2) * 4, rx: 5, ry: 14, fill: pal.green, transform: `rotate(${d * 3} ${376 + d} ${F - 24})` }));
  // テーブル
  k.shadow(236, F + 4, 36, 5);
  el('line', { x1: 236, y1: 170, x2: 236, y2: F, stroke: pal.woodDark, 'stroke-width': 5 }); el('rect', { x: 222, y: F - 3, width: 28, height: 4, rx: 2, fill: pal.woodDark });
  el('ellipse', { cx: 236, cy: 170, rx: 36, ry: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  const A = k.buddy({ x: 176, y: F, scale: 0.88 }), B = k.buddy({ x: 296, y: F, scale: 0.88, facing: -1, color: pal.coral, dark: pal.coralDark });
  // ティーポットとカップ
  const pot = g({});
  el('ellipse', { cx: 0, cy: -2, rx: 11, ry: 9, fill: '#fff', stroke: pal.line, 'stroke-width': 1.6 }, pot); el('rect', { x: -6, y: -14, width: 12, height: 5, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 1.4 }, pot);
  el('path', { d: 'M 10 -5 L 18 -9 L 17 -4 L 10 0 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 1.4 }, pot); el('path', { d: 'M -10 -6 q -9 0 -8 7 q 1 5 8 4', fill: 'none', stroke: pal.line, 'stroke-width': 3 }, pot);
  const cupAt = (x) => { const c = g({}); tf(c, x, 168); el('path', { d: 'M -7 -8 H 7 L 5 4 Q 0 6 -5 4 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, c); const tea = el('ellipse', { cx: 0, cy: -7, rx: 6.4, ry: 1.8, fill: '#D9964E', opacity: 0 }, c); return { c, tea }; };
  const c1 = cupAt(222), c2 = cupAt(252);
  const cups = [c1, c2];
  const stream = el('path', { d: '', fill: 'none', stroke: '#D9964E', 'stroke-width': 2.4, 'stroke-linecap': 'round' });
  const steam = [0, 1].map(() => el('path', { d: 'M 0 0 q 4 -5 0 -10 q -4 -5 0 -10', fill: 'none', stroke: '#C9D3DF', 'stroke-width': 2.2, 'stroke-linecap': 'round' }));
  // 手すり（人物の手前）
  el('rect', { x: 0, y: 196, width: 400, height: 4, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }); el('rect', { x: 0, y: 200, width: 400, height: 2, fill: pal.line });
  for (let x = 6; x < 400; x += 22) el('rect', { x: x, y: 200, width: 3.5, height: 44, fill: '#fff', stroke: pal.line, 'stroke-width': 1 });
  return {
    update(t) {
      const ap = easeOut(seg(t, 0.3, 1.0)), pour = hump(seg(t, 1.3, 2.4)), dr = hump(seg(t, 3.0, 3.8));
      // Aがポットを持ち、Bのカップ→自分のカップへ注ぐ
      A.pose({ armR: lerp(8, 82, ap) * (1 - dr) + 8 * dr, armL: lerp(8, 8, 1) + 0, lean: 3 * ap, look: 0.6, mood: 'smile', squash: 1 });
      const h = hp(A, 0.88, 'R', 28);
      const tilt = -34 * pour;
      pot.setAttribute('transform', `translate(${h.x + 14} ${h.y - 6 - 0}) rotate(${tilt})`);
      const sp = { x: h.x + 14 + 18 * Math.cos(tilt * Math.PI / 180), y: h.y - 6 - 9 + 18 * Math.sin(tilt * Math.PI / 180) * -1 * 0 };
      const target = t < 1.9 ? cups[0] : cups[1];
      const cx = t < 1.9 ? 222 : 252;
      k.set(stream, { d: `M ${h.x + 30} ${h.y - 14} Q ${cx - 6} ${h.y - 12} ${cx} 162`, opacity: pour > 0.4 ? 1 : 0 });
      c1.tea.setAttribute('opacity', seg(t, 1.6, 1.9)); c2.tea.setAttribute('opacity', seg(t, 2.2, 2.5));
      // 2人がカップを持ち上げて飲む
      B.pose({ armR: lerp(8, 8, 1) + 90 * dr, lean: -3 * dr, look: 0.6, mood: dr > 0.3 ? 'grin' : 'smile', squash: 1 + 0.01 * Math.sin(t * 3), blink: dr > 0.8 ? 1 : 0 });
      A.pose({ armR: lerp(lerp(8, 82, ap), 100, dr) * 1 });
      const hb = hp(B, 0.88, 'R', 26), ha = hp(A, 0.88, 'R', 26);
      tf(c2.c, lerp(252, hb.x, dr), lerp(168, hb.y, dr)); tf(c1.c, lerp(222, ha.x + 4, dr), lerp(168, ha.y, dr)); pot.setAttribute('opacity', 1 - seg(t, 2.7, 3.0));
      steam.forEach((s, i) => { const q = ((t * 0.6 + i / 2) % 1); tf(s, (i ? 252 : 222) + 2 * Math.sin(t * 3 + i), 156 - 16 * q, 0, 1, 1); s.setAttribute('opacity', seg(t, 2.4, 3.0) * Math.sin(q * Math.PI) * 0.8 * (1 - dr)); });
      A.pose({ mood: dr > 0.3 ? 'grin' : 'smile' });
    }
  };
}
