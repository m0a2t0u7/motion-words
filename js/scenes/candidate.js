// candidate：まめが面接官として、順番に来る3人の候補者を面接する（例文 We interviewed three candidates for the job.）
import { seg, lerp, easeOut, easeInOut, hump } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { roomBg, say } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, '3人が待つ'], [1.2, '順に面接'], [3.6, '3人済んだ']] };

export function create(k) {
  const { el, pal } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  const B = [pal.coral, pal.yellow, pal.violet], D = [pal.coralDark, pal.yellowDark, pal.violet];
  el('rect', { x: 30, y: 140, width: 74, height: 56, rx: 4, fill: 'none' });
  const bd = [0, 1, 2].map((i) => {
    el('rect', { x: 150 + i * 40, y: 40, width: 34, height: 44, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
    el('circle', { cx: 167 + i * 40, cy: 54, r: 7, fill: B[i] });
    el('rect', { x: 157 + i * 40, y: 63, width: 20, height: 4, rx: 2, fill: pal.line });
    return el('path', { d: `M ${158 + i * 40} 74 l 5 6 l 11 -12`, fill: 'none', stroke: pal.green, 'stroke-width': 3.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  });
  const b = k.buddy({ x: 80, y: FY, scale: S });
  const cs = B.map((c, i) => ({ i, b: k.buddy({ x: 400, y: FY, scale: 0.85, facing: -1, color: c, dark: D[i] }) }));
  const sa = say(k, 40, 26, -1), sb = say(k, 40, 26, 1);
  [sa, sb].forEach((s) => [0, 1].forEach((j) => el('line', { x1: -9, x2: 9 - j * 5, y1: -3 + j * 7, y2: -3 + j * 7, stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' }, s.g)));
  return {
    update(t) {
      const T0 = 0.2, DT = 1.15;
      P(b, { armL: 8, armR: 8, look: 0.6, mood: 'smile', blink: blinkAt(t), lean: 2 });
      let speaking = -1;
      cs.forEach(({ i, b: c }) => {
        const s = T0 + i * DT, home = 275 + i * 38, target = 200;
        const xf = (u) => (u < s + 0.9 ? lerp(home, target, easeInOut(seg(u, s, s + 0.5))) : lerp(target, 420, easeInOut(seg(u, s + 0.9, s + 1.5))));
        const q = Math.min(i, 2);
        const w = walkTo((u) => (i === 0 || u > T0 + i * DT - 0.1 ? xf(u) : home), t, home, -1);
        const at = t > s + 0.5 && t < s + 0.9;
        const done = t > s + 1.5;
        P(c, { x: i === 0 || t > s - 0.1 ? w.x : home, walk: w.walk, armL: w.armL, armR: w.armR, lean: w.lean, facing: -1, look: 0.7, mood: 'smile', blink: blinkAt(t, i) });
        if (t > s + 0.45 && t < s + 0.95) speaking = i;
        if (t > s + 1.5) bd[i].setAttribute('opacity', 1); else bd[i].setAttribute('opacity', 0);
      });
      sa.show(speaking >= 0 ? seg(t, T0 + speaking * DT + 0.45, T0 + speaking * DT + 0.6) : 0, 90, FY - 110);
      sb.show(speaking >= 0 ? seg(t, T0 + speaking * DT + 0.7, T0 + speaking * DT + 0.85) : 0, 230, FY - 110);
    }
  };
}
