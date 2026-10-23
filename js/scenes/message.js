// message：メモに伝言を書き、彼女の机の掲示板に貼って残す（例文 Can I leave a message for her?）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { roomBg, desk, say } from './look-over.js';
import { hp, held, reach } from './dig.js';
function pz(b, S, o, R, L) { P(b, o); const a = {}; if (R) a.armR = reach(b, S, 'R', R[0], R[1]); if (L) a.armL = reach(b, S, 'L', L[0], L[1]); P(b, { ...o, ...a }); }

export const meta = { duration: 4.2, beats: [[0, '伝言を書く'], [1.4, '貼りに行く'], [3.3, '貼って残した']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = roomBg(k, 'office');
  const S = 1.1;
  // 彼女の机と掲示板（不在）
  el('rect', { x: 290, y: 70, width: 90, height: 66, rx: 6, fill: '#E7C79A', stroke: pal.woodDark, 'stroke-width': 4 });
  el('circle', { cx: 303, cy: 83, r: 4, fill: pal.coral });
  el('rect', { x: 318, y: 80, width: 22, height: 14, rx: 2, fill: '#fff' });
  desk(k, 270, 120, 200);
  el('rect', { x: 300, y: 188, width: 16, height: 12, rx: 3, fill: pal.coral });
  const b = k.buddy({ x: 80, y: FY, scale: S });
  const note = g({});
  el('rect', { x: -15, y: -15, width: 30, height: 30, rx: 2, fill: pal.yellow }, note);
  const ln = [0, 1].map((i) => el('rect', { x: -10, y: -7 + i * 8, width: 18, height: 3, rx: 1.5, fill: pal.ink, opacity: 0.7 }, note));
  const pen = el('line', { x1: 0, y1: 0, x2: 12, y2: -12, stroke: pal.coralDark, 'stroke-width': 4, 'stroke-linecap': 'round' });
  const xf = (t) => lerp(80, 262, easeInOut(seg(t, 1.5, 3.0)));
  return {
    update(t) {
      const w = walkTo(xf, t, 80);
      const writing = t < 1.4, stick = easeOut(seg(t, 3.0, 3.4));
      const base = { x: w.x, facing: 1, walk: w.walk, lean: writing ? 8 : w.lean, look: 0.5, blink: blinkAt(t), mood: t > 3.3 ? 'grin' : 'smile', armL: w.armL, armR: w.armR };
      const cx = w.x + 36, cy = 172;
      const tx = lerp(cx, 305, stick), ty = lerp(cy, 112, stick);
      pz(b, S, base, [tx, ty + (writing ? Math.sin(t * 9) * 0 : 0)], writing ? [cx + 8, 168 + Math.abs(Math.sin(t * 12)) * 3] : null);
      if (writing) { const h = hp(b, S, 'L', 24); k.tf(pen, h.x, h.y); }
      pen.setAttribute('opacity', writing ? 1 : 0);
      ln.forEach((l, i) => l.setAttribute('width', 18 * clamp(seg(t, 0.2 + i * 0.5, 0.9 + i * 0.5))));
      const pop = 1 + 0.12 * Math.sin(seg(t, 3.4, 3.7) * Math.PI);
      if (stick >= 1) k.tf(note, 305, 112, 4, pop, pop); else { const h = hp(b, S, 'R', 24); k.tf(note, h.x + 4, h.y - 4, -4, 1.2, 1.2); }
    }
  };
}
