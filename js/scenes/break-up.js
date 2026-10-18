// break up：手をつないでいた二人の間のハートが割れ、背を向けて別々の方向へ歩いていく（例文 They broke up after dating for two years.）
import { seg, lerp, easeInOut, easeOut, easeIn, wobble } from '../ease.js';
import { gait, streetBg } from './weigh.js';
import { reach } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '仲のよい二人'], [1.3, 'ハートが割れる'], [2.8, '別々の道へ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 236, 'evening');
  // 公園の街灯（静止）
  el('rect', { x: 316, y: 120, width: 8, height: 116, rx: 3, fill: '#8C96A8' });
  el('rect', { x: 306, y: 110, width: 28, height: 14, rx: 6, fill: '#8C96A8' });
  el('ellipse', { cx: 320, cy: 126, rx: 10, ry: 4, fill: '#FFE7A3' });
  k.shadow(320, 237, 14, 3);
  const A = k.buddy({ x: 172, y: FY, scale: 0.85 });
  const C = k.buddy({ x: 228, y: FY, scale: 0.85, facing: -1, color: pal.coral, dark: pal.coralDark });
  const H = g({});
  const L = el('path', { d: 'M 0 14 C -26 -2 -22 -22 0 -10 L -4 -2 L 3 4 Z', fill: pal.red }, g({}, H));
  const R = el('path', { d: 'M 0 14 C 26 -2 22 -22 0 -10 L -4 -2 L 3 4 Z', fill: pal.red }, g({}, H));
  const xa = (t) => lerp(172, 52, easeInOut(seg(t, 2.6, 4.2)));
  const xc = (t) => lerp(228, 300, easeInOut(seg(t, 2.6, 4.2)));
  return {
    update(t) {
      const sad = t > 1.6;
      const turn = t > 2.4;
      const pa = gait(xa, t, 172), pc = gait(xc, t, 228);
      const hold = 1 - easeInOut(seg(t, 1.4, 1.8));
      A.pose({ x: pa.x, walk: pa.walk, facing: turn ? -1 : 1, armL: pa.armL, armR: 8, lean: pa.lean, mood: sad ? 'sad' : 'smile', look: turn ? 0.3 : 0.5 });
      C.pose({ x: pc.x, walk: pc.walk, facing: turn ? 1 : -1, armL: pc.armL, armR: 8, lean: pc.lean, mood: sad ? 'sad' : 'smile', look: turn ? 0.3 : 0.5 });
      if (!turn) {
        A.pose({ armR: lerp(12, reach(A, 0.85, 'R', 200, FY - 34), hold) });
        C.pose({ armR: lerp(12, reach(C, 0.85, 'R', 200, FY - 34), hold) });
      } else { A.pose({ armR: pa.armR }); C.pose({ armR: pc.armR }); }
      // ハート：脈打つ→ひびが入って左右に割れ、落ちて消える
      const beat = 1 + 0.06 * Math.max(0, Math.sin(t * 7)) * (1 - seg(t, 1.0, 1.2));
      const cr = seg(t, 1.3, 1.45) * 0.15 + wobble(seg(t, 1.3, 1.6), 4, 6) * 0.06;
      const sp = easeOut(seg(t, 1.5, 2.3)), fall = easeIn(seg(t, 1.8, 2.8));
      tf(H, 200, 120, 0, beat * 1.15);
      tf(L.parentNode, -sp * 18 - cr * 10, fall * 70, -sp * 22);
      tf(R.parentNode, sp * 18 + cr * 10, fall * 70, sp * 22);
      H.setAttribute('opacity', 1 - seg(t, 2.4, 2.9));
    }
  };
}
