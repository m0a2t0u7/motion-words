// in fact：大きな箱を見て「重くて大変そう」と身構えるが、実際に持ち上げると片手で軽々と上がる（例文 I thought it was hard. In fact, it was easy.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg } from './look-over.js';
import { hp } from './dig.js';
import { say } from './get-on-with.js';

export const meta = { duration: 4.4, beats: [[0, '難しそう'], [1.7, '持ち上げると'], [2.8, '実は簡単']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  const b = k.buddy({ x: 150, y: FY, facing: 1 });
  // 大きな段ボール箱
  const sh = k.shadow(0, 0, 40, 6);
  const box = g({});
  el('rect', { x: -38, y: -60, width: 76, height: 60, rx: 4, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 2.5 }, box);
  el('rect', { x: -38, y: -60, width: 76, height: 10, fill: pal.woodDark, opacity: 0.35 }, box);
  el('rect', { x: -6, y: -60, width: 12, height: 60, fill: '#F2DDBB', opacity: 0.7 }, box);
  // 思っていたこと：重りの吹き出し（ずっしり）
  const B = say(k, 70, 50);
  const wgt = g({}, B.inner);
  el('path', { d: 'M -18 16 L -12 -8 L 12 -8 L 18 16 Z', fill: pal.ink }, wgt);
  el('circle', { cx: 0, cy: -12, r: 6, fill: 'none', stroke: pal.ink, 'stroke-width': 3 }, wgt);
  el('path', { d: 'M -30 20 Q -24 12 -18 18 M 30 20 Q 24 12 18 18', stroke: pal.sub, 'stroke-width': 2, fill: 'none' }, wgt);
  const cross = el('path', { d: 'M -22 -18 L 22 18 M 22 -18 L -22 18', stroke: pal.red, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0 }, B.inner);
  const sweat = el('path', { d: 'M 0 -6 Q 4 0 0 4 Q -4 0 0 -6 Z', fill: pal.water });
  const spark = [0, 1, 2].map(() => el('path', { d: 'M 0 -6 L 1.6 -1.6 L 6 0 L 1.6 1.6 L 0 6 L -1.6 1.6 L -6 0 L -1.6 -1.6 Z', fill: pal.yellow }));
  return {
    update(t) {
      const BX = 236;
      B.show(150, 92, easeOut(seg(t, 0.3, 0.6)) * (1 - seg(t, 3.2, 3.4)));
      cross.setAttribute('opacity', t > 2.6 ? 1 : 0);
      tf(cross, 0, 0, 0, Math.max(0.001, easeOut(seg(t, 2.6, 2.9))));
      // 身構える（腰を落として両手）→持つ→すっと上がる→片手で上に掲げる
      const brace = easeInOut(seg(t, 0.8, 1.4));
      const lift = easeOut(seg(t, 1.8, 2.3));
      const one = easeInOut(seg(t, 2.6, 3.2));
      const surprised = t > 2.0 && t < 2.6;
      P(b, { x: 150, facing: 1, look: 0.6, squash: 1 - 0.1 * brace * (1 - lift), lean: 22 * brace * (1 - lift), armR: lerp(lerp(8, 100, brace), 150, one), armL: lerp(8, 100, brace) * (1 - one) + 8 * one, mood: t > 2.6 ? 'grin' : surprised ? 'open' : brace > 0.3 ? 'flat' : 'sad', blink: blinkAt(t) });
      const h = hp(b, 1);
      const held = t > 1.8;
      const by = held ? lerp(FY, h.y + 20, lift) : FY;
      const bx = held ? lerp(BX, h.x + 18, lift) : BX;
      const up = held ? lerp(by, h.y + 10, one) : by;
      tf(box, bx - (one * 10), up, wobble(seg(t, 2.25, 2.9), 2, 5) * 4);
      tf(sh, bx - one * 10, FY + 1, 0, 1 - (FY - up) / 220);
      sh.setAttribute('opacity', 1 - (FY - up) / 260);
      tf(sweat, 120, FY - 100 + 10 * ((t * 2) % 1));
      sweat.setAttribute('opacity', brace > 0.3 && t < 2.0 ? 1 : 0);
      spark.forEach((s, i) => { const q = seg(t, 3.1 + i * 0.1, 3.9); tf(s, bx + [-50, 50, 0][i], up - 70 - i * 10, 0, Math.max(0.001, hump(q))); });
    }
  };
}
