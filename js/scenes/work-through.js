// work through：ホワイトボードの問題を上から1つずつ解き、答えとチェックを書いていく（例文 She worked through the problems one by one.）
import { seg, lerp, easeInOut, easeOut } from '../ease.js';
import { reach, held } from './dig.js';
import { check } from './work-on.js';

export const meta = { duration: 4.4, beats: [[0, '問題が並ぶ'], [1.4, '1つずつ解く'], [3.8, '全部解けた']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 330, y: 56, width: 50, height: 60, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('rect', { x: 26, y: 100, width: 190, height: 114, rx: 6, fill: '#fff', stroke: '#B9C3D0', 'stroke-width': 5 });
  el('rect', { x: 50, y: 214, width: 6, height: 22, fill: '#B9C3D0' }); el('rect', { x: 186, y: 214, width: 6, height: 22, fill: '#B9C3D0' });
  k.shadow(121, FY, 90, 4);
  const Q = [['3+4=', '7'], ['9-5=', '4'], ['2×6=', '12']], ys = [130, 158, 186];
  const clip = [], chk = [];
  Q.forEach(([q, a], i) => {
    k.text(78, ys[i], q, { 'font-size': 18 });
    const n = k.text(112, ys[i], a, { 'font-size': 18, fill: pal.blueDark, 'text-anchor': 'start' });
    const r = el('rect', { x: 110, y: ys[i] - 13, width: 0, height: 26 });
    n.setAttribute('clip-path', k.clip((cp) => cp.appendChild(r)));
    clip.push(r); chk.push(check(k, 172, ys[i], 0.9));
  });
  const S = 1.4, L = 62;
  const b = k.buddy({ x: 280, y: FY, scale: S, facing: -1 });
  const mk = g({});
  el('rect', { x: -3.5, y: -4, width: 7, height: 16, rx: 2, fill: pal.blue }, mk);
  el('rect', { x: -2.5, y: 12, width: 5, height: 5, rx: 1, fill: pal.blueDark }, mk);
  const T = [0.6, 1.7, 2.8], SY = FY - 56 * S;
  return {
    update(t) {
      let tx = 150, ty = 205;
      T.forEach((s, i) => {
        const m = easeInOut(seg(t, s - 0.4, s));
        tx = lerp(tx, 113, m); ty = lerp(ty, ys[i] + 3, m);
        const w = seg(t, s, s + 0.45);
        if (w > 0) tx = 113 + (i === 2 ? 22 : 12) * w;
        const c = easeInOut(seg(t, s + 0.5, s + 0.75));
        if (c > 0) { tx = lerp(tx, 168, c); }
        const c2 = seg(t, s + 0.75, s + 1.0);
        if (c2 > 0) { tx = 166 + 10 * c2; ty = ys[i] + 3 + (c2 < 0.35 ? 6 * c2 / 0.35 : 6 - 16 * (c2 - 0.35) / 0.65); }
        clip[i].setAttribute('width', 30 * w); chk[i](c2);
      });
      if (t > 3.85) { const r = easeInOut(seg(t, 3.85, 4.25)); tx = lerp(tx, 200, r); ty = lerp(ty, 225, r); }
      const dy = ty - SY, dx = Math.sqrt(Math.max(0, L * L - dy * dy));
      const bx = Math.max(258, tx + 38 + dx * 0.95);
      b.pose({ x: bx, lean: 5, look: 0.6, mood: t > 3.9 ? 'grin' : 'flat', armL: 10 });
      b.pose({ armR: reach(b, S, 'R', tx, ty) });
      held(k, b, S, mk, 'R', 0, 26);
    }
  };
}
