// glue：割れたカップの縁に接着剤をつけ、2つのかけらを押し合わせてくっつける（例文 I used glue to fix the broken cup.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { held, reach, hp, P, blinkAt, face, homeBg, backTable } from './bag.js';
import { star } from './run-after.js';

export function glueTube(k, parent) {
  const g = k.g({}, parent), { el, pal } = k;
  el('rect', { x: -6, y: -6, width: 12, height: 22, rx: 3, fill: '#fff', stroke: pal.sub, 'stroke-width': 1.3 }, g);
  el('rect', { x: -6, y: 0, width: 12, height: 8, fill: pal.violet }, g);
  el('path', { d: 'M -3 16 L 3 16 L 1 24 L -1 24 Z', fill: pal.violet }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '割れたカップ'], [0.8, '接着剤をつける'], [2.4, 'くっついた']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1.15, FY = 236, X = 150;
  homeBg(k, { FY, winX: 290, winW: 80 });
  const TY = backTable(k, 180, 340, 192, FY);
  const CX = 250;
  // 左右のかけら（ギザギザの割れ目）
  const L = k.g({}), R = k.g({});
  el('path', { d: 'M -18 -30 L 0 -30 L -4 -22 L 2 -14 L -3 -6 L 1 0 L -14 0 Q -18 -4 -18 -10 Z', fill: '#fff', stroke: pal.blue, 'stroke-width': 2 }, L);
  el('path', { d: 'M -14 -22 h 8', stroke: pal.blue, 'stroke-width': 3 }, L);
  el('path', { d: 'M 0 -30 L 18 -30 L 18 -10 Q 18 -4 14 0 L 1 0 L -3 -6 L 2 -14 L -4 -22 Z', fill: '#fff', stroke: pal.blue, 'stroke-width': 2 }, R);
  el('path', { d: 'M 18 -24 q 10 2 9 9 q -1 7 -9 7', stroke: pal.blue, 'stroke-width': 3, fill: 'none' }, R);
  const dots = [0, 1, 2].map((i) => el('circle', { r: 1.8, fill: pal.violet, cx: CX - 1, cy: TY - 24 + i * 9, opacity: 0 }));
  const tube = glueTube(k);
  const b = k.buddy({ x: X, y: FY, scale: S });
  const sp = star(k, pal.yellow);
  return {
    update(t) {
      const join = easeInOut(seg(t, 2.0, 2.5));
      tf(L, CX - 6 * (1 - join), TY, -6 * (1 - join));
      tf(R, CX + 16 * (1 - join) + wobble(seg(t, 2.5, 3.0), 2, 6) * 1, TY, 4 * (1 - join));
      P(b, { x: X + 20, lean: 14, look: 0.8, blink: blinkAt(t), mood: t > 2.7 ? 'grin' : 'flat' });
      face(b, 5, 2);
      let tx, ty;
      const g = seg(t, 0.8, 1.7);
      if (t < 0.8) { tx = lerp(X + 70, CX - 4, easeInOut(seg(t, 0.2, 0.8))); ty = TY - 50; }
      else if (t < 1.8) { tx = CX - 2; ty = TY - 50 + 24 * g; }
      else if (t < 2.6) { tx = lerp(CX - 2, CX + 30, easeInOut(seg(t, 1.8, 2.0))); ty = lerp(TY - 30, TY - 16, easeInOut(seg(t, 1.8, 2.0))); }
      else { tx = CX + 26; ty = TY - 50; }
      b.pose({ armR: reach(b, S, 'R', tx, ty) });
      // 接着剤はつけるまで手に、押す前に机に置く
      if (t < 1.8) held(k, b, S, tube, 'R', 0); else tf(tube, 200, TY - 1, 90, S);
      dots.forEach((d, i) => d.setAttribute('opacity', t > 0.9 + i * 0.25 && t < 2.3 ? 1 : 0));
      sp.set(CX, TY - 40, seg(t, 2.6, 3.4));
    }
  };
}
