// responsible：車が柵に軽くぶつかり、運転手のまめが降りて頭を下げ、書類にサインする（例文 The driver was responsible for the accident.）
import { seg, lerp, easeInOut, easeOut, wobble } from '../ease.js';
import { P, blinkAt, walkTo, car } from './run-after.js';
import { hp } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, '柵に軽く衝突'], [1.6, '降りて頭を下げる'], [3.2, '書類にサイン']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = 236;
  k.backdrop({ floorY: FY, mood: 'outdoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#E4E8EE' });
  for (let x = 292; x < 400; x += 28) { el('rect', { x, y: 168, width: 6, height: 62, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }); }
  el('rect', { x: 286, y: 180, width: 114, height: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 });
  el('rect', { x: 286, y: 204, width: 114, height: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 });
  const c = car(k, pal.blue, pal.blueDark);
  const m = k.buddy({ x: 190, y: FY + 6, scale: S });
  const doc = g({});
  el('rect', { x: -15, y: -20, width: 30, height: 40, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, doc);
  [-10, -2, 6].forEach((y) => el('line', { x1: -9, x2: 9, y1: y, y2: y, stroke: pal.sub, 'stroke-width': 2 }, doc));
  const sig = el('path', { d: 'M -9 13 q 3 -8 6 0 t 6 0 t 6 -2', fill: 'none', stroke: pal.blueDark, 'stroke-width': 2, 'stroke-dasharray': '30' }, doc);
  return {
    update(t) {
      const drive = easeInOut(seg(t, 0.1, 1.3)), hit = seg(t, 1.3, 2.5);
      const cx = lerp(30, 222, drive) - Math.max(0, wobble(hit, 2, 4)) * 5;
      c.set(cx, drive * 360 * (1 - hit), FY, hit > 0 ? -Math.abs(wobble(hit, 2, 4)) * 3 : 0);
      const out = t > 2.0;
      const xf = (tt) => lerp(cx, 168, easeInOut(seg(tt, 2.0, 2.8)));
      const w = walkTo(xf, t, cx, -1);
      const bow = easeInOut(seg(t, 3.0, 3.4)) * (1 - easeInOut(seg(t, 3.5, 3.9)));
      const sg = seg(t, 3.7, 4.3), signing = t > 3.5;
      P(m, { x: w.x, y: FY + 6, walk: w.walk, armL: w.armL, armR: signing ? 70 : w.armR, lean: w.lean + bow * 28, facing: t > 2.8 ? 1 : w.facing,
        mood: t > 2.9 ? 'sad' : 'flat', blink: blinkAt(t) });
      m.g.setAttribute('opacity', out ? 1 : 0);
      const h = hp(m, S, 'R');
      tf(doc, h.x + 14, h.y - 8, 0, signing ? 1 : 0.001);
      sig.setAttribute('stroke-dashoffset', 30 * (1 - sg));
    }
  };
}
