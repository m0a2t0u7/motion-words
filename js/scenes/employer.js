// employer：社長（雇い主）が休みの紙を渡し、カレンダーに OFF が付く。まめは大喜び（例文 My employer gave me a day off.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { CO, hp, reach, P, blinkAt, walkTo, path, wear, pop, deskFront } from './member.js';
import { officeBg } from './get-on-with.js';

export const meta = { duration: 4.4, beats: [[0, '社長に呼ばれる'], [1.6, '休みをもらう'], [3.0, '休みだ！']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95, FY = 236;
  officeBg(k, FY, 40);
  // 壁のカレンダー
  el('rect', { x: 170, y: 36, width: 84, height: 74, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: 170, y: 36, width: 84, height: 14, rx: 4, fill: pal.red });
  for (let i = 0; i < 14; i++) el('rect', { x: 176 + (i % 7) * 11, y: 58 + Math.floor(i / 7) * 22, width: 8, height: 8, rx: 1.5, fill: pal.line });
  const off = g({}); el('circle', { r: 11, fill: 'none', stroke: pal.red, 'stroke-width': 2.5 }, off); k.text(0, 14, 'OFF', { 'font-size': 9, fill: pal.red }, off);
  // 社長と机
  const boss = k.buddy({ x: 320, y: FY, scale: 1.1, facing: -1, ...CO(k) }); wear(k, boss, 'tie', pal.blueDark); wear(k, boss, 'glasses');
  deskFront(k, 280, 110, FY - 50, FY);
  const b = k.buddy({ x: 60, y: FY, scale: S });
  const slip = g({}); el('rect', { x: -12, y: -9, width: 24, height: 18, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, slip);
  el('circle', { cx: 0, cy: 0, r: 5, fill: 'none', stroke: pal.red, 'stroke-width': 1.8 }, slip);
  const bx = path([[0.2, 60], [1.3, 214]]);
  return {
    update(t) {
      const w = walkTo(bx, t, 60, 1), give = easeInOut(seg(t, 1.3, 1.8)), got = t > 2.0, back = easeInOut(seg(t, 2.0, 2.4));
      const jump = hump(seg(t, 3.0, 3.5)) + 0.6 * hump(seg(t, 3.6, 4.0));
      P(boss, { armR: lerp(lerp(20, 80, give), 20, back), look: 0.5, blink: blinkAt(t, 1), mood: 'smile' });
      const oh = hp(boss, 1.1, 'R', 32);
      P(b, { x: w.x, walk: w.walk, armL: lerp(w.armL, 150, seg(t, 3.0, 3.2)), armR: w.armR, lean: w.lean, look: t > 2.4 && t < 2.9 ? -0.6 : 0.6, blink: blinkAt(t), mood: t > 2.6 ? 'grin' : 'smile', lift: 22 * jump, squash: 1 + 0.06 * jump });
      if (t > 1.2) b.pose({ armR: got ? lerp(reach(b, S, 'R', oh.x, oh.y), 160, easeInOut(seg(t, 2.9, 3.2))) : lerp(8, reach(b, S, 'R', oh.x, oh.y), give) });
      const h = got ? hp(b, S, 'R', 32) : oh;
      tf(slip, h.x, h.y + 4);
      tf(off, 220, 80, 0, pop(seg(t, 2.4, 2.8)));
    }
  };
}
