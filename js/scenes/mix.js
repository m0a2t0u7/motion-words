// mix：ボウルに入れた小麦粉と砂糖を、スプーンで混ぜて一つにする（例文 Mix the flour and sugar in a bowl.）
import { seg, lerp, easeInOut, smooth } from '../ease.js';
import { hp, held, table } from './dig.js';

export const meta = { duration: 4.0, beats: [[0, '別々の粉'], [1.5, '混ぜる'], [3.4, 'まざった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  table(k, 150);
  const b = k.buddy({ x: 150, y: 236 });
  b.pose({ armR: 150, lean: 4 });
  const H = hp(b, 1, 'R', 28);
  b.pose({ armR: 8, lean: 0 });
  const BX = H.x + 6, BY = 194;
  // 小麦粉と砂糖の袋（後ろに置く）
  const jar = (x, c, lid) => { el('rect', { x, y: 154, width: 26, height: 30, rx: 5, fill: c, stroke: '#DDE3EA', 'stroke-width': 2 }); el('rect', { x: x - 1, y: 150, width: 28, height: 7, rx: 3, fill: lid }); };
  jar(290, '#fff', pal.red); jar(324, '#FFF3C4', pal.blue);
  for (let i = 0; i < 5; i++) el('circle', { cx: 330 + (i % 3) * 6, cy: 166 + ((i * 7) % 12), r: 1.4, fill: '#fff' });
  // ボウル（奥の縁と中身 → スプーン → 手前の壁）
  el('ellipse', { cx: BX, cy: BY - 4, rx: 34, ry: 9, fill: '#8D72E0' });
  const mix = el('ellipse', { cx: BX, cy: BY - 4.5, rx: 30, ry: 7, fill: '#FBF3DF' });
  const cl = k.clip((c) => el('ellipse', { cx: BX, cy: BY - 4.5, rx: 30, ry: 7 }, c));
  const ov = g({ 'clip-path': cl });
  el('rect', { x: BX - 30, y: BY - 12, width: 30, height: 16, fill: '#fff' }, ov);
  el('rect', { x: BX, y: BY - 12, width: 30, height: 16, fill: '#FFF0B8' }, ov);
  const sw = [0, 1, 2].map((i) => el('path', { d: '', fill: 'none', stroke: '#E9D9A8', 'stroke-width': 1.6, 'stroke-linecap': 'round', 'clip-path': cl }));
  const sp = g({});
  const shaft = el('rect', { x: -2, y: -10, width: 4, height: 40, rx: 2, fill: pal.woodDark }, sp);
  const head = el('ellipse', { cx: 0, cy: 34, rx: 6, ry: 7.5, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 1.5 }, sp);
  el('path', { d: `M ${BX - 34} ${BY - 4} A 34 9 0 0 0 ${BX + 34} ${BY - 4} Q ${BX + 30} ${BY + 24} ${BX} ${BY + 24} Q ${BX - 30} ${BY + 24} ${BX - 34} ${BY - 4} Z`, fill: pal.violet });
  el('path', { d: `M ${BX - 30} ${BY + 8} Q ${BX} ${BY + 16} ${BX + 30} ${BY + 8}`, stroke: '#fff', 'stroke-width': 3, fill: 'none', opacity: 0.4, 'stroke-linecap': 'round' });
  return {
    update(t) {
      const m = seg(t, 1.0, 3.2), act = (m > 0 && m < 1 ? 1 : 0) * smooth(seg(t, 1.0, 1.4)) * (1 - smooth(seg(t, 3.2, 3.6)));
      const ang = (t - 1.0) * 7;
      const up = 1;
      b.pose({ armR: lerp(8, 150, up) + 3 * Math.sin(ang) * act * up, lean: 4 * up + 1.5 * Math.cos(ang) * act, armL: 8, look: 0.7, mood: t > 3.3 ? 'grin' : 'smile', squash: 1 });
      const h = hp(b, 1, 'R', 26);
      const tx = BX + Math.cos(ang) * 16 * act * up, ty = BY - 8 + Math.sin(ang) * 4 * act * up;
      const dx = tx - h.x, dy = ty - h.y, L = Math.hypot(dx, dy);
      tf(sp, h.x, h.y, (Math.atan2(-dx, dy) * 180) / Math.PI);
      k.set(shaft, { height: L + 8 }); k.set(head, { cy: L + 4 });
      ov.setAttribute('opacity', 1 - smooth(seg(m, 0.1, 0.9)));
      const rot = ang * 57;
      sw.forEach((p, i) => {
        const r = 8 + i * 8;
        const a0 = ang * 1.2 + i * 2.1;
        const d = [0, 1, 2, 3].map((j) => { const a = a0 + j * 0.7; return `${j ? 'L' : 'M'} ${BX + Math.cos(a) * r} ${BY - 4.5 + Math.sin(a) * r * 0.24}`; }).join(' ');
        k.set(p, { d, opacity: act ? 0.8 : m >= 1 ? 0.25 : 0 });
      });
    }
  };
}
