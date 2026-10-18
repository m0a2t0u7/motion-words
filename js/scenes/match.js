// match：シャツ姿の相手の胸に、持ってきたネクタイを当てる。色と柄が揃っていて似合う（例文 This tie matches your shirt.）
import { seg, lerp, easeInOut, easeOut, backOut } from '../ease.js';
import { reach, hp, gait } from './dig.js';

export const meta = { duration: 4.2, beats: [[0, 'ネクタイを持つ'], [1.6, '胸に当てる'], [3.0, 'よく合う']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 238, mood: 'indoor' });
  el('rect', { x: 36, y: 48, width: 80, height: 66, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  // 姿見
  const you = k.buddy({ x: 270, y: FY, facing: -1 });
  const me = k.buddy({ x: 60, y: FY, color: pal.coral, dark: pal.coralDark });
  // 相手のシャツ（体のローカル座標）：紺ではなく淡い紫、細いストライプ
  const sh = g({});
  const SC = pal.violet;
  el('rect', { x: -30, y: -40, width: 60, height: 30, rx: 8, fill: '#E4DCFB' }, sh);
  for (let x = -22; x <= 22; x += 11) el('line', { x1: x, y1: -38, x2: x, y2: -12, stroke: SC, 'stroke-width': 2.4, opacity: 0.8 }, sh);
  el('path', { d: 'M -12 -41 L 0 -28 L 12 -41 L 8 -44 L 0 -36 L -8 -44 Z', fill: '#fff', stroke: '#CFC4F2', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, sh);
  [-20, -14].forEach((y) => el('circle', { cx: 0, cy: y, r: 1.8, fill: '#fff' }, sh));
  // ネクタイ（同じ紫系＋同じストライプ）
  const tie = g({});
  el('path', { d: 'M -5 -4 L 5 -4 L 7 6 L 0 10 L -7 6 Z', fill: '#8A6FE0' }, tie);
  el('path', { d: 'M -7 6 L 0 10 L 7 6 L 10 34 L 0 42 L -10 34 Z', fill: pal.violet, stroke: '#8A6FE0', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, tie);
  [16, 24, 32].forEach((y) => el('line', { x1: -7, y1: y + 2, x2: 7, y2: y - 4, stroke: '#fff', 'stroke-width': 2.2, opacity: 0.8 }, tie));
  const glow = el('circle', { r: 30, fill: pal.yellow, opacity: 0 });
  const heart = [0, 1, 2].map(() => el('path', { d: 'M 0 6 C -12 -4 -8 -12 0 -6 C 8 -12 12 -4 0 6 Z', fill: pal.coral }));
  const xf = (t) => lerp(60, 168, easeInOut(seg(t, 0.4, 1.8)));
  return {
    update(t) {
      const p = gait(xf, t, 60, 14), hold = easeInOut(seg(t, 1.7, 2.3));
      you.pose({ look: -0.6, mood: t > 2.5 ? 'grin' : 'smile', squash: 1 + 0.01 * Math.sin(t * 4), armL: 8, armR: 8 });
      tf(sh, you.state.x, FY - 10, 0, 1, 1);
      sh.setAttribute('transform', `translate(${you.state.x} ${FY - 10}) scale(-1 1)`);
      // 相手の胸のあたり（ネクタイ位置）
      const chest = { x: you.state.x - 4, y: FY - 10 - 30 };
      const cx = chest.x, cy = chest.y;
      me.pose({ x: p.x, walk: p.walk, lean: p.lean, look: 0.6, mood: t > 2.5 ? 'grin' : 'smile', squash: 1 });
      me.pose({ armL: p.armL, armR: p.m > 0.3 ? p.armR : 8 });
      // 手：ネクタイ上端を持ち、胸に当てる
      const h = hp(me, 1, 'R', 28);
      const tx = lerp(h.x + 4, cx, hold), ty = lerp(h.y - 4, cy - 8, hold);
      me.pose({ armR: lerp(lerp(8, 95, easeOut(seg(t, 0.3, 1.0))) * (p.m > 0.3 ? 0 : 1) + (p.m > 0.3 ? p.armR : 0), reach(me, 1, 'R', cx, cy - 8), hold) });
      tf(tie, tx, ty + 0, lerp(-10, 0, hold), 0.8, 0.8);
      k.set(glow, { cx: cx, cy: cy + 4, opacity: 0.35 * seg(t, 2.4, 2.9) * (1 - seg(t, 3.6, 4.2)), r: 26 + 14 * seg(t, 2.4, 3.2) });
      heart.forEach((hh, i) => { const q = seg(t, 2.8 + i * 0.2, 3.9 + i * 0.1); tf(hh, cx - 30 + i * 30, cy - 70 - 20 * q + (i % 2) * 8, 0, Math.sin(q * Math.PI) * 1.1 + 0.001); });
    }
  };
}
