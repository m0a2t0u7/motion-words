// ruler：紙に定規を当てて押さえ、鉛筆を定規に沿って動かして、まっすぐな線を引く（例文 Use a ruler to draw a straight line.）
import { seg, lerp, easeInOut, clamp } from '../ease.js';
import { held, reach, P, blinkAt, face } from './bag.js';
import { pencil as pencilProp } from './check.js';
import { studyDesk } from './notebook.js';

export const meta = { duration: 4.2, beats: [[0, '定規を当てる'], [1.0, '沿って引く'], [3.0, 'まっすぐな線']] };

export function create(k) {
  const { el, pal } = k, S = 1.1;
  const { FY, SX, SY, SW, SH } = studyDesk(k, { SX: 196, SY: 118, SW: 84, SH: 66 });
  el('rect', { x: SX, y: SY, width: SW, height: SH, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  const LY = SY + 34;
  const line = el('line', { x1: SX + 8, y1: LY, x2: SX + 8, y2: LY, stroke: pal.ink, 'stroke-width': 2.2, 'stroke-linecap': 'round' });
  const rl = k.g({});
  el('rect', { x: 0, y: 0, width: 76, height: 12, rx: 2, fill: '#FFE7A0', stroke: pal.yellowDark, 'stroke-width': 1.2, opacity: 0.95 }, rl);
  for (let i = 0; i <= 14; i++) el('line', { x1: 3 + i * 5, y1: 0, x2: 3 + i * 5, y2: i % 2 ? 3 : 5, stroke: pal.woodDark, 'stroke-width': 0.8 }, rl);
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const pc = pencilProp(k);
  return {
    update(t) {
      const place = easeInOut(seg(t, 0.1, 0.7));
      k.tf(rl, SX + 4, lerp(SY + 52, LY + 1, place), lerp(-8, 0, place));
      P(b, { x: 150, lean: 16, look: 0.9, blink: blinkAt(t), mood: t > 3.0 ? 'grin' : 'flat' });
      face(b, 5, 2);
      // 左手で定規の端を押さえる
      b.pose({ armL: reach(b, S, 'L', SX + 12, LY + 8) });
      const d = seg(t, 1.0, 2.8);
      const tx = t < 1.0 ? lerp(SX + 30, SX + 8, seg(t, 0.6, 1.0)) : t < 2.9 ? SX + 8 + 70 * easeInOut(d) : SX + 60;
      const ty = t < 2.9 ? LY - 1 : LY - 20;
      b.pose({ armR: reach(b, S, 'R', tx, ty) });
      held(k, b, S, pc, 'R', 0);
      k.set(line, { x2: SX + 8 + 70 * easeInOut(d) });
    }
  };
}
