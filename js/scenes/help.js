// help：大きな箱を持ち上げられずに困っている人のところへ、まめが来て反対側を持ち、2人で持ち上げる（例文 Can you help me with this box?）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { reach } from './dig.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { path } from './queue-up.js';
import { cue, talk, box } from './in-common.js';
import { drop } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '重くて上がらない'], [1.4, '手を貸す'], [2.6, '一緒に持ち上げる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 10, width: 400, height: 10, fill: '#ECE6DC' });
  [[300, 70, 70], [310, 40, 50]].forEach(([x, y, w]) => { el('rect', { x, y: FY - y - 40, width: w, height: 40, rx: 3, fill: '#E3B77E', opacity: 0.55 }); });
  const S = 0.95, BX = 200;
  const her = k.buddy({ x: 150, y: FY, scale: S, color: pal.coral, dark: pal.coralDark });
  const me = k.buddy({ x: 440, y: FY, scale: S, facing: -1 });
  const bxs = k.shadow(BX, FY + 1, 40, 5);
  const bx = box(k, 76, 58, '#E3B77E');
  const sw = drop(k); const sw2 = drop(k);
  const ask = cue(k, 'help?', 58, 28, -1, 14);
  const xf = path([[0.9, 440], [2.0, 250]]);
  return {
    update(t) {
      // 1人で持ち上げようとして、少し浮いては落ちる（0.2-1.4）
      const tryP = seg(t, 0.2, 1.4), tug = Math.max(0, Math.sin(tryP * Math.PI * 3)) * 3 * (tryP > 0 && tryP < 1);
      const lift = easeInOut(seg(t, 2.5, 3.2)), set = wobble(seg(t, 3.2, 3.9), 2, 6);
      const by = FY - tug - 40 * lift + 1.5 * set;
      tf(bx, BX, by, 0.8 * Math.sin(t * 20) * (tug > 0.5 ? 1 : 0));
      tf(bxs, 0, 0, 0, 1 - lift * 0.3, 1); bxs.setAttribute('transform', `translate(${BX * lift * 0.3} 0) scale(${1 - lift * 0.3} 1)`);
      bxs.setAttribute('opacity', 1 - lift * 0.4);
      const strain = (tug > 0.3 ? 1 : 0) + lift * 0.4;
      // 相手：かがんで箱の左端を持つ
      P(her, { lean: 18 - 10 * lift, squash: 1 - 0.06 * strain, look: t > 1.4 && t < 2.4 ? 0.8 : 0.4, mood: talk(t, 1.4, 2.0) || (t > 3.2 ? 'grin' : 'sad'), blink: blinkAt(t, 0.9), armL: 10 });
      her.pose({ armR: reach(her, S, 'R', BX - 38, by - 22 + 26) });
      const w = walkTo(xf, t, 440, -1);
      P(me, { x: w.x, walk: w.walk, facing: -1, lean: w.lean + 18 * seg(t, 2.0, 2.4) - 10 * lift, squash: 1 - 0.05 * lift, armL: w.armL, look: 0.5, mood: t > 3.2 ? 'grin' : 'smile', blink: blinkAt(t, 0.3) });
      if (t > 2.0) me.pose({ armR: lerp(w.armR, reach(me, S, 'R', BX + 38, by - 22 + 26), easeInOut(seg(t, 2.0, 2.4))) });
      [sw, sw2].forEach((d, i) => { const q = ((t * 1.4 + i * 0.5) % 1); tf(d, 132 + i * 34, FY - 92 + 14 * q); d.setAttribute('opacity', t < 1.7 ? (1 - q) : 0); });
      ask.show(seg(t, 1.4, 1.65) * (1 - seg(t, 2.3, 2.5)), 130, 112);
    }
  };
}
