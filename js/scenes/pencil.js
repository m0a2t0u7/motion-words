// pencil：答えを鉛筆で書く。鉛筆なら、うしろの消しゴムでこすって消せる（例文 Please write your answer in pencil so that you can erase it.）
import { seg, lerp, easeInOut, clamp } from '../ease.js';
import { held, reach, P, blinkAt, face } from './bag.js';
import { pencil as pencilProp } from './check.js';
import { studyDesk, ink } from './notebook.js';

export const meta = { duration: 4.4, beats: [[0, '鉛筆で書く'], [1.9, 'ひっくり返す'], [2.6, '消せる']] };

export function create(k) {
  const { el, pal } = k, S = 1.1;
  const { FY, SX, SY, SW, SH } = studyDesk(k, { SX: 196, SY: 118, SW: 80, SH: 66 });
  el('rect', { x: SX, y: SY, width: SW, height: SH, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  k.text(SX + 14, SY + 14, 'Q1', { 'font-size': 10, fill: pal.sub });
  el('line', { x1: SX + 10, y1: SY + 42, x2: SX + SW - 8, y2: SY + 42, stroke: pal.line, 'stroke-width': 1.5 });
  const ans = ink(k, SX + 14, SY + 36, 50, '#6B7280');
  const crumbs = [0, 1, 2].map(() => el('circle', { r: 1.6, fill: '#F7A9B4' }));
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const pen = pencilProp(k);
  return {
    update(t) {
      P(b, { x: 150, lean: 16, look: 0.9, blink: blinkAt(t), mood: t > 3.4 ? 'grin' : 'smile' });
      face(b, 5, 2);
      const w = seg(t, 0.5, 1.7);
      const flip = easeInOut(seg(t, 1.9, 2.4));
      const rub = t > 2.5 && t < 3.6;
      let tx = SX + 14 + 50 * w, ty = SY + 34 + 2 * Math.sin(t * 30) * (w > 0 && w < 1);
      if (t > 1.7) { tx = lerp(SX + 64, SX + 50, flip); ty = lerp(SY + 34, SY + 10, Math.sin(flip * Math.PI)) + (flip >= 1 ? 26 : 0) * 0; }
      if (rub) { tx = SX + 52 + 10 * Math.sin((t - 2.5) * 16); ty = SY + 34; }
      if (t >= 3.6) { tx = SX + 40; ty = SY + 6; }
      b.pose({ armR: reach(b, S, 'R', tx, ty) });
      // ひっくり返すと消しゴム側が先になる（握りの位置をずらす）
      held(k, b, S, pen, 'R', 180 * flip, 28 + 10 * flip);
      ans.set(w);
      const er = seg(t, 2.5, 3.6);
      // 右側から消えていく
      ans.n.setAttribute('stroke-dashoffset', 70 * (1 - w) + 34 * er);
      crumbs.forEach((c, i) => { k.set(c, { cx: SX + 50 + i * 6, cy: SY + 44 + 8 * seg(t, 2.8 + i * 0.2, 3.6) }); c.setAttribute('opacity', t > 2.8 && t < 4.0 ? 1 : 0); });
    }
  };
}
