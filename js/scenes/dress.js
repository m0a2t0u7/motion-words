// dress：朝食の前に、親が両手でシャツを持ち、万歳した子どもの頭からかぶせて服を着せる（例文 I dress my son before breakfast.）
import { seg, lerp, easeInOut, easeOut, backOut } from '../ease.js';
import { reach, hp, gait } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, 'シャツを持つ'], [1.6, '頭からかぶせる'], [3.4, '着せ終わり']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 30, y: 48, width: 76, height: 62, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('ellipse', { cx: 200, cy: 256, rx: 120, ry: 12, fill: '#F1D9CF' });
  // 朝食の食卓（右奥）
  el('rect', { x: 318, y: 176, width: 82, height: 8, fill: pal.wood }); el('rect', { x: 326, y: 184, width: 6, height: 56, fill: pal.woodDark });
  el('ellipse', { cx: 356, cy: 173, rx: 17, ry: 4.5, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 });
  el('path', { d: 'M 344 168 Q 356 180 368 168 Z', fill: '#F2C98A' });
  const steam = [0, 1].map((i) => el('path', { d: `M ${352 + i * 8} 160 q 4 -6 0 -12 q -4 -6 0 -12`, fill: 'none', stroke: pal.line, 'stroke-width': 2, 'stroke-linecap': 'round' }));
  const par = k.buddy({ x: 110, y: FY, scale: 0.95 });
  const kid = k.buddy({ x: 250, y: FY, scale: 0.6, facing: -1, color: pal.coral, dark: pal.coralDark });
  const K = 0.6;
  // シャツ（子どもの体のローカル座標）
  const shirt = g({});
  el('path', { d: 'M -31 -40 Q 0 -30 31 -40 L 46 -26 L 36 -14 L 31 -20 L 31 -2 Q 0 4 -31 -2 L -31 -20 L -36 -14 L -46 -26 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2, 'stroke-linejoin': 'round' }, shirt);
  el('path', { d: 'M -10 -37 Q 0 -28 10 -37', fill: 'none', stroke: pal.yellowDark, 'stroke-width': 3, 'stroke-linecap': 'round' }, shirt);
  el('path', { d: 'M 0 -22 L 3 -15 L 10 -14 L 5 -9 L 6 -2 L 0 -6 L -6 -2 L -5 -9 L -10 -14 L -3 -15 Z', fill: '#fff', opacity: 0.85 }, shirt);
  const xf = (t) => lerp(110, 192, easeInOut(seg(t, 0.9, 2.0)));
  return {
    update(t) {
      const p = gait(xf, t, 110, 12), up = easeOut(seg(t, 0.8, 1.4)) * (1 - easeInOut(seg(t, 3.0, 3.6)));
      const slide = easeInOut(seg(t, 1.9, 3.0));
      const raise = easeInOut(seg(t, 1.0, 2.0)), dn = easeInOut(seg(t, 2.1, 3.0)), rel = easeInOut(seg(t, 3.0, 3.5));
      const ang = lerp(lerp(70, 128, raise), 55, dn);
      par.pose({ x: p.x, walk: p.walk, lean: p.lean + 5 * dn, armL: ang, armR: ang, look: 0.6, mood: t > 3.2 ? 'grin' : 'smile', squash: 1 });
      par.pose({ armR: lerp(ang, 8, rel), armL: lerp(ang, 8, rel) });
      const h = hp(par, 0.95, 'R', 28);
      const sx = lerp(h.x + 12, 250, easeInOut(seg(t, 1.6, 2.6)) * (1 - 0) ), sy = lerp(h.y + 14, FY - 6, rel);
      kid.pose({ armL: lerp(8, 172, up), armR: lerp(8, 172, up), squash: lerp(1, 0.97, slide) + 0.02 * Math.sin(t * 5) * 0, mood: t > 3.2 ? 'grin' : 'smile', look: 0.6, blink: seg(t, 2.4, 2.9) * (1 - seg(t, 2.9, 3.0)) });
      // 子どもの手はシャツの袖に通る：袖を腕に合わせ、着終えたら下ろす
      tf(shirt, sx, sy, 0, K, K);
      shirt.setAttribute('opacity', 1);
      steam.forEach((s, i) => s.setAttribute('opacity', 0.5 + 0.5 * Math.sin(t * 3 + i)));
    }
  };
}
