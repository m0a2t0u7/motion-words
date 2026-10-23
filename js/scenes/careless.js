// careless：ゴールキーパーのまめが客席に手を振ってよそ見。その間にボールがゴールへ転がり、点を取られて負ける（例文 A careless mistake cost him the game.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump } from '../ease.js';
import { P, blinkAt, person, scene, sym, path, walkTo } from './confused.js';

export const meta = { duration: 4.4, beats: [[0, 'よそ見する'], [1.6, 'ボールが入る'], [3.0, '負けた']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const { FY } = scene(k, { ground: '#9ED69E', edge: '#86C486' });
  // 得点板
  el('rect', { x: 140, y: 18, width: 120, height: 44, rx: 6, fill: pal.ink });
  const sc1 = k.text(178, 41, '1', { 'font-size': 24, fill: '#fff' });
  k.text(200, 41, '-', { 'font-size': 24, fill: '#fff' });
  const sc2 = k.text(222, 41, '1', { 'font-size': 24, fill: '#FFCF5C' });
  // ゴール（右）
  const GX = 300;
  el('rect', { x: GX, y: FY - 110, width: 90, height: 110, fill: 'none', stroke: '#fff', 'stroke-width': 6 });
  for (let i = 1; i < 6; i++) el('line', { x1: GX + i * 15, y1: FY - 110, x2: GX + i * 15, y2: FY, stroke: '#fff', 'stroke-width': 1.2, opacity: 0.7 });
  for (let i = 1; i < 6; i++) el('line', { x1: GX, y1: FY - i * 18, x2: GX + 90, y2: FY - i * 18, stroke: '#fff', 'stroke-width': 1.2, opacity: 0.7 });
  const net = el('path', { d: '', fill: 'none' });
  const b = k.buddy({ x: 330, y: FY, scale: S, facing: 1 });
  const kick = person(k, 'coral', { x: 60, y: FY, scale: 0.9 });
  const ball = g({}); const bsh = k.shadow(0, 0, 9, 2.5);
  el('circle', { r: 9, fill: '#fff', stroke: pal.ink, 'stroke-width': 2 }, ball);
  el('path', { d: 'M 0 -4 L 4 -1 L 2 4 L -2 4 L -4 -1 Z', fill: pal.ink }, ball);
  const oh = sym(k, '!', pal.red, 30);
  // よそ見の原因：ひらひら飛ぶちょう
  const fly = g({}), wings = [-1, 1].map((d) => el('ellipse', { cx: d * 6, cy: 0, rx: 6, ry: 8, fill: pal.violet }, fly));
  el('ellipse', { cx: 0, cy: 0, rx: 1.6, ry: 6, fill: pal.ink }, fly);
  return {
    update(t) {
      // キッカーが蹴る
      const kk = hump(seg(t, 0.6, 1.0));
      P(kick, { x: 90, facing: 1, lean: 6 * kk, armL: 8 + 30 * kk, armR: 8, look: 0.6, mood: t > 2.4 ? 'grin' : 'smile', blink: blinkAt(t, 1) });
      if (t > 2.4) kick.pose({ armL: 150 + 10 * Math.sin(t * 12), armR: 150 + 10 * Math.sin(t * 12 + 1), lift: 10 * Math.abs(Math.sin(t * 8)) });
      // ボール：転がってゴールへ
      const q = easeOut(seg(t, 0.85, 2.3)), bx = lerp(112, 372, q), by = FY - 9 - 30 * hump(seg(t, 0.85, 1.6)) * 0.6;
      tf(ball, bx, by, q * 900, 1); k.set(bsh, { cx: bx, cy: FY + 1 });
      // キーパー：観客に手を振ってよそ見 → 気づいて振り向く
      const turn = t > 2.3;
      P(b, { x: 330, facing: -1, look: turn ? 0.3 : -0.4, armR: turn ? lerp(150, 60, seg(t, 2.3, 2.6)) : 140 + 20 * Math.sin(t * 6), armL: turn ? 60 : 8,
        mood: turn ? 'open' : 'grin', lean: turn ? -6 : 0, squash: turn ? 1 - 0.05 * hump(seg(t, 2.3, 2.6)) : 1, blink: blinkAt(t) });
      if (t > 3.0) b.pose({ mood: 'sad', armR: 8, armL: 8, lean: 10, squash: 0.96 });
      tf(fly, 270 + 16 * Math.sin(t * 1.3), FY - 128 + 8 * Math.sin(t * 3), 0, 1.3);
      wings.forEach((w, i) => w.setAttribute('transform', `scale(${(0.4 + 0.6 * Math.abs(Math.sin(t * 14))).toFixed(2)} 1)`));
      sc2.textContent = t > 2.3 ? '2' : '1';
      tf(sc2, 0, 0, 0, t > 2.3 ? 1 + 0.4 * hump(seg(t, 2.3, 2.7)) : 1);
      sc2.setAttribute('transform-origin', '222 41');
      oh(seg(t, 2.3, 2.6), 330, FY - 120);
    }
  };
}
