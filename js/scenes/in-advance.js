// in advance：公演日（★）より前にチケット売り場で買っておく→日が進み当日には「売り切れ」→買っておいたチケットで笑顔（Please buy your tickets in advance.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, backOut } from '../ease.js';
import { hp, gait } from './dig.js';
import { coin } from './run-after.js';
import { STAR } from './agree.js';
import { P, blinkAt, ticket } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '前もって買う'], [1.8, '日が進む'], [3.2, '当日は完売']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  el('rect', { x: 0, y: FY, width: 400, height: 10, fill: '#E3E8EE' });
  // 月のカレンダー（壁）
  el('rect', { x: 22, y: 26, width: 150, height: 112, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: 22, y: 26, width: 150, height: 20, rx: 6, fill: pal.red });
  const cell = (d) => [36 + ((d - 1) % 7) * 20.5, 60 + Math.floor((d - 1) / 7) * 20];
  for (let d = 1; d <= 28; d++) { const [x, y] = cell(d); if (d !== 24) el('circle', { cx: x, cy: y, r: 2.6, fill: pal.line }); }
  { const [x, y] = cell(24); el('path', { d: STAR, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5, transform: `translate(${x} ${y}) scale(0.7)` }); }
  const today = el('circle', { r: 8, fill: 'none', stroke: pal.blueDark, 'stroke-width': 3 });
  // 売り場
  k.shadow(300, FY + 1, 80, 5);
  el('rect', { x: 226, y: 66, width: 150, height: FY - 66, rx: 6, fill: '#F7E3CF' });
  el('rect', { x: 218, y: 56, width: 166, height: 16, rx: 4, fill: pal.violet });
  el('rect', { x: 250, y: 100, width: 100, height: 64, rx: 6, fill: '#CFE9F7' });
  const clerk = k.buddy({ x: 300, y: 196, scale: 0.7, facing: -1, color: pal.coral, dark: pal.coralDark });
  el('rect', { x: 240, y: 164, width: 120, height: 10, rx: 3, fill: pal.wood });
  el('rect', { x: 246, y: 174, width: 108, height: FY - 174, fill: '#EBD0B5' });
  const sold = g({}); el('rect', { x: -44, y: -13, width: 88, height: 26, rx: 4, fill: pal.red }, sold); k.text(0, 1, 'SOLD OUT', { 'font-size': 13, fill: '#fff' }, sold);
  const G = k.buddy({ x: 60, y: FY });
  const cn = coin(k), tk = ticket(k);
  const xf = (t) => t < 2 ? lerp(60, 196, easeInOut(seg(t, 0.1, 0.9))) : lerp(196, 120, easeInOut(seg(t, 3.0, 3.8)));
  return {
    update(t) {
      const day = Math.round(lerp(3, 24, easeInOut(seg(t, 1.7, 3.0))));
      const [cx, cy] = cell(day); tf(today, cx, cy);
      const p = gait(xf, t, 60);
      const pay = hump(seg(t, 0.9, 1.4)), got = t > 1.35;
      const show = easeOut(seg(t, 3.3, 3.7));
      P(G, { x: p.x, walk: p.walk, facing: t > 2.95 && t < 3.8 ? -1 : 1, armL: p.armL, lean: p.lean,
        armR: t < 0.9 ? p.armR : t < 3.0 ? 8 + 72 * pay + (got ? 30 * (1 - pay) : 0) : lerp(38, 150, show),
        mood: t > 3.3 ? 'grin' : 'smile', look: 0.5, blink: blinkAt(t) });
      P(clerk, { facing: -1, armR: 8 + 60 * hump(seg(t, 1.1, 1.6)), look: 0.4, mood: t > 2.8 ? 'flat' : 'smile' });
      const h = hp(G, 1, 'R');
      tf(cn, h.x + 2, h.y - 4); cn.setAttribute('opacity', t > 0.9 && t < 1.25 ? 1 : 0);
      tf(tk, h.x + 4, h.y - 8, -20); tk.setAttribute('opacity', got ? 1 : 0);
      tf(sold, 300, 132, -6, Math.max(0.001, backOut(seg(t, 2.9, 3.2))));
    }
  };
}
