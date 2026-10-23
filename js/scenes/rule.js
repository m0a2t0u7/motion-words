import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { hp } from './dig.js';
import { grip } from './hand-over.js';
import { roomBg, say, desk } from './look-over.js';
// rule：横断歩道の手前で、赤信号だとまめが立ち止まって待ち、青になってから渡る（例文 You have to follow the rules.）
export const meta = { duration: 4.2, beats: [[0, '赤で止まる'], [1.8, '待つ'], [2.8, '青で渡る']] };
export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = 236;
  k.backdrop({ floorY: FY, mood: 'outdoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#B9C0C8' });
  for (let i = 0; i < 6; i++) el('rect', { x: 200 + i * 28, y: FY + 6, width: 18, height: 50, fill: '#fff' });
  const sg = g({}); tf(sg, 168, FY);
  k.shadow(0, 0, 14, 4, sg);
  el('rect', { x: -3, y: -110, width: 6, height: 110, fill: pal.ink }, sg);
  el('rect', { x: -13, y: -150, width: 26, height: 50, rx: 8, fill: pal.ink }, sg);
  const rd = el('circle', { cx: 0, cy: -138, r: 8 }, sg), gn = el('circle', { cx: 0, cy: -112, r: 8 }, sg);
  const b = k.buddy({ x: 40, y: FY + 6, scale: S });
  return {
    update(t) {
      const green = t > 2.7;
      k.set(rd, { fill: green ? '#5A3A3A' : '#F25B52' }); k.set(gn, { fill: green ? '#4FD08A' : '#2E4A3A' });
      const xf = (u) => (u < 2.7 ? lerp(40, 138, easeOut(seg(u, 0, 1.6))) : lerp(138, 330, easeInOut(seg(u, 2.9, 4.2))));
      const w = walkTo(xf, t, 40);
      const wait = t > 1.7 && t < 2.7;
      P(b, { x: w.x, walk: w.walk, armL: w.armL, armR: wait ? 95 : w.armR, lean: w.lean, facing: 1, look: t < 2.7 ? 0.9 : 0.2, mood: green ? 'grin' : 'flat', blink: blinkAt(t) });
    }
  };
}
