// pen：「ペンをちょっと借りていい？」友だちがペンを手渡し、まめはそのペンでメモに書く（例文 Can I borrow your pen for a minute?）
import { seg, lerp, easeInOut, clamp } from '../ease.js';
import { held, reach, homeBg, backTable } from './bag.js';
import { give } from './charger.js';
import { pen as penProp } from './work-on.js';

export const meta = { duration: 4.4, beats: [[0, 'ペン貸して？'], [1.0, 'ペンを渡す'], [2.6, 'メモを書く']] };

export function create(k) {
  const { el, pal } = k, S = 1.1, FY = 236;
  homeBg(k, { FY, winX: 250, winW: 80 });
  const TY = backTable(k, 20, 120, 194, FY);
  el('rect', { x: 62, y: TY - 3, width: 46, height: 4, rx: 1, fill: '#fff', stroke: pal.line });
  const note = el('rect', { x: 70, y: TY - 46, width: 34, height: 44, rx: 2, fill: '#FFF7D6', stroke: pal.yellowDark, 'stroke-width': 1.5 });
  const lines = [0, 1, 2].map((i) => el('path', { d: `M 75 ${TY - 36 + i * 11} q 4 -5 8 0 t 8 0 t 8 0`, stroke: pal.blueDark, 'stroke-width': 1.8, fill: 'none', 'stroke-dasharray': 30, 'stroke-dashoffset': 30 }));
  const p = penProp(k, pal.blue);
  const up = give(k, {
    S, FY, bx: 165, cx: 290, item: p, g0: 0.9, g1: 1.6,
    ask: (g) => { const q = penProp(k, pal.blue); k.tf(q, -10, -8, 30, 1.2); q.parentNode.removeChild(q); g.appendChild(q); k.text(16, 0, '?', { 'font-size': 20, fill: pal.blueDark }, g); },
    carry: (t, c) => {
      if (t < 1.6) return false;
      if (t > 2.2) {
        c.b.pose({ facing: -1, lean: 8 });
        const i = clamp(Math.floor((t - 2.4) / 0.6), 0, 2), q = seg(t - 2.4 - i * 0.6, 0, 0.5);
        c.b.pose({ armR: reach(c.b, S, 'R', t < 2.4 ? 90 : 76 + 24 * q, TY - 26 + i * 11) });
        lines.forEach((l, j) => l.setAttribute('stroke-dashoffset', 30 * (1 - clamp(seg(t, 2.4 + j * 0.6, 2.9 + j * 0.6)))));
      }
      held(k, c.b, S, p, 'R', 180);
      return true;
    }
  });
  void note;
  return { update: up };
}
