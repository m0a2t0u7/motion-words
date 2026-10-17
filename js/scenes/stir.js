// stir：鍋のスープに長いスプーンを入れ、ぐるぐるかき混ぜる（例文 Stir the soup with a spoon.）
import { seg, lerp, easeInOut, smooth } from '../ease.js';
import { hp, held, table } from './dig.js';

export const meta = { duration: 4.0, beats: [[0, '静かなスープ'], [1.4, 'かき混ぜる'], [3.3, '渦と湯気']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  table(k, 150);
  const b = k.buddy({ x: 150, y: 236 });
  b.pose({ armR: 150, lean: 4 });
  const H = hp(b, 1, 'R', 28);
  b.pose({ armR: 8, lean: 0 });
  const PX = H.x + 6, PY = 192;
  // コンロと鍋
  el('rect', { x: PX - 44, y: PY + 14, width: 88, height: 8, rx: 3, fill: '#8892A3' });
  el('ellipse', { cx: PX, cy: PY - 18, rx: 36, ry: 9, fill: pal.blueDark });
  const soup = el('ellipse', { cx: PX, cy: PY - 18, rx: 32, ry: 7, fill: '#F2B25C' });
  const cl = k.clip((c) => el('ellipse', { cx: PX, cy: PY - 18, rx: 32, ry: 7 }, c));
  const bits = [['#E86F57', 4], ['#59C27A', 3.4], ['#FFF0B8', 3.6], ['#E86F57', 3.4], ['#59C27A', 3.8]].map(([c, r]) => el('circle', { r, fill: c, 'clip-path': cl }));
  const lines = [0, 1].map(() => el('path', { fill: 'none', stroke: '#fff', 'stroke-width': 1.6, opacity: 0.55, 'stroke-linecap': 'round', 'clip-path': cl }));
  const sp = g({});
  const shaft = el('rect', { x: -2, y: -10, width: 4, height: 40, rx: 2, fill: pal.woodDark }, sp);
  const head = el('ellipse', { cx: 0, cy: 34, rx: 6, ry: 7.5, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 1.5 }, sp);
  front();
  function front() {
    el('path', { d: `M ${PX - 36} ${PY - 18} A 36 9 0 0 0 ${PX + 36} ${PY - 18} L ${PX + 34} ${PY + 14} Q ${PX} ${PY + 18} ${PX - 34} ${PY + 14} Z`, fill: pal.blue });
    el('rect', { x: PX - 44, y: PY - 14, width: 10, height: 5, rx: 2.5, fill: pal.blueDark });
    el('rect', { x: PX + 34, y: PY - 14, width: 10, height: 5, rx: 2.5, fill: pal.blueDark });
  }
  const steam = [-16, 0, 16].map((x) => el('path', { d: '', fill: 'none', stroke: '#B8C2D0', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0 }));
  return {
    update(t) {
      const m = seg(t, 1.0, 3.3), act = (m > 0 && m < 1 ? 1 : 0) * smooth(seg(t, 1.0, 1.4)) * (1 - smooth(seg(t, 3.2, 3.6)));
      const sw = smooth(seg(t, 1.0, 1.6)) * (1 - 0.0);
      const ang = (t - 1.0) * 6 + 0;
      const up = 1;
      b.pose({ armR: lerp(8, 150, up) + 3 * Math.sin(ang) * act * up, lean: 4 * up + 1.5 * Math.cos(ang) * act, armL: 8, look: 0.7, mood: t > 3.3 ? 'grin' : 'smile', squash: 1 });
      const h = hp(b, 1, 'R', 26);
      const tx = PX + Math.cos(ang) * 16 * act * up, ty = PY - 11 + Math.sin(ang) * 4 * act * up;
      const dx = tx - h.x, dy = ty - h.y, L = Math.hypot(dx, dy);
      tf(sp, h.x, h.y, (Math.atan2(-dx, dy) * 180) / Math.PI);
      k.set(shaft, { height: L + 8 }); k.set(head, { cy: L + 4 });
      const spin = (t - 0.9) * (act ? 1 : 0) + (m >= 1 ? 2.4 : 0);
      const w = smooth(seg(t, 1.0, 1.8)) * 3.2 + (m >= 1 ? 1 : 0);
      bits.forEach((c, i) => {
        const a = (spin * 3.4 + i * 1.26) * (1), r = 10 + (i % 3) * 7;
        const aa = t < 1.0 ? i * 1.26 : (t - 1.0) * w * 1.1 + i * 1.26;
        c.setAttribute('cx', PX + Math.cos(aa) * r * (t < 1.0 ? 1.1 : 1)); c.setAttribute('cy', PY - 18 + Math.sin(aa) * r * 0.22);
      });
      lines.forEach((l, i) => {
        const a0 = (t - 1.0) * w * 1.1 + i * 3.1, r = 14 + i * 9;
        const d = [0, 1, 2, 3, 4].map((j) => { const a = a0 + j * 0.45; return `${j ? 'L' : 'M'} ${PX + Math.cos(a) * r} ${PY - 18 + Math.sin(a) * r * 0.22}`; }).join(' ');
        k.set(l, { d, opacity: 0.6 * smooth(seg(t, 1.0, 1.6)) });
      });
      steam.forEach((s, i) => {
        const u = ((t * 0.5 + i * 0.33) % 1), o = (0.25 + 0.6 * smooth(seg(t, 1.0, 2.2))) * Math.sin(Math.PI * u);
        const x = PX - 18 + i * 18, y = PY - 30 - u * 34;
        k.set(s, { d: `M ${x} ${y} q 6 -8 0 -16 q -6 -8 0 -16`, opacity: o });
      });
    }
  };
}
