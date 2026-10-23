// healthy：野菜とりんごをしっかり食べ、外で体を動かす。まめは元気いっぱいに跳ねる（例文 Eat well and stay healthy.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { hp, reach, P, blinkAt, sc } from './member.js';
import { parkBg, tree } from './run-after.js';
import { icon } from './in-common.js';
import { heart } from './weigh.js';
import { sparkle } from './furniture.js';

export const meta = { duration: 4.4, beats: [[0, 'しっかり食べる'], [1.8, '体を動かす'], [3.2, '元気いっぱい']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.05, FY = 236;
  parkBg(k, FY);
  tree(k, 60, FY - 2, 1.2); tree(k, 350, FY - 4, 1);
  // ピクニックシートとサラダ
  el('rect', { x: 180, y: FY + 6, width: 120, height: 18, rx: 4, fill: '#F7B6C8' });
  const bowl = g({}); tf(bowl, 280, FY + 8);
  el('path', { d: 'M -16 -8 Q 0 10 16 -8 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, bowl);
  [[-8, -10, pal.green], [0, -12, '#7CC59A'], [8, -10, pal.red], [3, -8, pal.yellow]].forEach(([x, y, c]) => el('circle', { cx: x, cy: y, r: 4, fill: c }, bowl));
  const b = k.buddy({ x: 220, y: FY, scale: S, facing: 1 });
  const apple = icon(k, 'apple');
  const bite = el('circle', { r: 5, fill: '#DCEFD9' }, apple);
  const hearts = [0, 1].map(() => heart(k));
  const sp = [0, 1, 2].map(() => sparkle(k));
  return {
    update(t) {
      // 0〜1.8 りんごをかじる（2回）
      const eat = t < 1.8, b1 = hump(seg(t, 0.4, 0.9)), b2 = hump(seg(t, 1.0, 1.5));
      const toMouth = Math.max(b1, b2);
      // 1.8〜 体操：両腕を上げ下げしながらジャンプ
      const ex = t > 1.9, ph = (t - 1.9) * 2 * Math.PI / 0.75;
      const jump = ex ? Math.max(0, Math.sin(ph)) : 0;
      P(b, { look: eat ? 0.5 : 0.2, blink: eat && toMouth > 0.5 ? 1 : blinkAt(t), mood: ex ? 'grin' : toMouth > 0.6 ? 'open' : 'smile', lift: 20 * jump, squash: ex ? 1 + 0.06 * jump - 0.06 * (jump < 0.05 ? 1 : 0) : 1 });
      if (eat) {
        const mouth = { x: 220 + 14 * S, y: FY - 50 * S };
        b.pose({ armR: lerp(60, reach(b, S, 'R', mouth.x + 10, mouth.y + 4), toMouth) });
        const h = hp(b, S, 'R', 30); tf(apple, h.x + 3, h.y - 4, 0, 0.9);
        tf(bite, 8, -2, 0, t > 0.7 ? (t > 1.3 ? 1.6 : 1) : 0.001);
      } else {
        const arms = lerp(20, 165, jump);
        b.pose({ armR: arms, armL: arms });
        tf(apple, 0, 0, 0, 0.001);
      }
      hearts.forEach((h, i) => { const q = seg(t, 3.0 + i * 0.4, 4.0 + i * 0.3); tf(h, 190 + i * 60, FY - 120 - 20 * q, 0, sc(hump(q) * 1.2)); });
      sp.forEach((s, i) => { const q = seg(t, 2.2 + i * 0.5, 2.9 + i * 0.5); tf(s, 170 + i * 50, FY - 100 + (i % 2) * 30, 0, sc(hump(q))); });
    }
  };
}
