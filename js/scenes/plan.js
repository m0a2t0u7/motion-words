// plan：机に地図を広げ、2人で相談。壁のカレンダーを来月にめくって丸を付け、地図の京都（五重塔）にピンを立てる（例文 We plan to visit Kyoto next month.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { hp, reach } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { roomBg } from './look-over.js';
import { desk } from './get-on-with.js';
import { calendar } from './so-far-so-good.js';
import { talk } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '地図を見る'], [1.2, '来月に丸'], [2.6, '京都へ行く計画']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  const cal = calendar(k, 200, 34, 54);
  const circ = el('circle', { cx: 200, cy: 68, r: 16, fill: 'none', stroke: pal.red, 'stroke-width': 3.5, 'stroke-dasharray': 101, 'stroke-dashoffset': 101 });
  const mlab = k.text(200, 98, 'next month', { 'font-size': 11, fill: pal.sub });
  const me = k.buddy({ x: 112, y: FY, scale: 1.0 });
  const fr = k.buddy({ x: 296, y: FY, scale: 1.0, facing: -1, color: pal.coral, dark: pal.coralDark });
  const top = desk(k, 70, 270, FY);
  // 机の上の地図（固定）
  const mp = g({}); tf(mp, 205, top - 3);
  el('path', { d: 'M -56 -9 L 56 -9 L 62 3 L -62 3 Z', fill: '#E9F4E2', stroke: '#C7DDBB', 'stroke-width': 1.5 }, mp);
  el('path', { d: 'M -46 -2 Q -20 -10 6 -4 T 46 -5', stroke: pal.blue, 'stroke-width': 2, fill: 'none', opacity: 0.5 }, mp);
  el('path', { d: 'M -40 0 L -20 -3 L 0 -1 L 18 -5', stroke: pal.coralDark, 'stroke-width': 1.6, fill: 'none', 'stroke-dasharray': '3 3' }, mp);
  // 五重塔（京都の目印）
  const pg = g({}); tf(pg, 222, top - 10);
  [0, 1, 2, 3].forEach((i) => { el('path', { d: `M ${-11 + i * 1.5} ${-i * 7} L ${11 - i * 1.5} ${-i * 7} L ${7 - i * 1.5} ${-i * 7 - 3} L ${-7 + i * 1.5} ${-i * 7 - 3} Z`, fill: pal.coralDark }, pg); el('rect', { x: -5 + i, y: -i * 7 - 7, width: 10 - 2 * i, height: 4, fill: '#F1E2D2' }, pg); });
  el('rect', { x: -1, y: -38, width: 2, height: 8, fill: pal.ink }, pg);
  const lab = k.text(222, top - 60, 'Kyoto', { 'font-size': 13, fill: pal.ink });
  // ピン
  const pin = g({});
  el('line', { x1: 0, y1: 0, x2: 0, y2: 12, stroke: pal.sub, 'stroke-width': 2 }, pin);
  el('circle', { cx: 0, cy: 0, r: 5, fill: pal.red }, pin);
  return {
    update(t) {
      // 相手：カレンダーをめくって（0.6-1.2）丸を付ける（1.3-1.9）
      const fl = seg(t, 0.7, 1.15);
      cal.set(fl < 0.5 ? '10' : '11', fl);
      circ.setAttribute('stroke-dashoffset', (101 * (1 - easeInOut(seg(t, 1.4, 1.9)))).toFixed(1));
      mlab.setAttribute('opacity', seg(t, 1.9, 2.2));
      const reachC = easeInOut(seg(t, 0.4, 0.7)) * (1 - easeInOut(seg(t, 2.0, 2.4)));
      const cx = t < 1.3 ? { x: 214, y: 70 } : { x: 200 + 16 * Math.cos((t - 1.4) * 12.5), y: 68 + 16 * Math.sin((t - 1.4) * 12.5) };
      P(fr, { lean: -4 * reachC, look: 0.4, mood: talk(t, 2.6, 3.2) || 'grin', blink: blinkAt(t, 1.3), armL: 10, lift: 0 });
      fr.pose({ armR: lerp(8, reach(fr, 1, 'R', cx.x, cx.y), reachC) });
      // まめ：ピンを地図の京都に立てる（2.2-2.8）
      const go = easeInOut(seg(t, 2.1, 2.7)), back = easeInOut(seg(t, 3.3, 3.7));
      const pinAt = { x: 222, y: top - 54 };
      P(me, { lean: 8 * go * (1 - back), look: t < 1.9 && t > 0.5 ? 0.9 : 0.6, mood: t > 2.8 ? 'grin' : 'smile', blink: blinkAt(t, 0.5), armL: 10 + 120 * hump(seg(t, 3.5, 4.2)) });
      me.pose({ armR: lerp(lerp(8, reach(me, 1, 'R', pinAt.x, pinAt.y), go), 8, back) });
      const h = hp(me, 1, 'R', 28);
      const placed = t > 2.75;
      const drop = easeOut(seg(t, 2.7, 2.9));
      if (!placed) tf(pin, h.x, h.y - 4, 0); else tf(pin, 222, lerp(top - 52, top - 52, drop) + wobble(seg(t, 2.75, 3.2), 2, 6) * 1.5, 0);
      pin.setAttribute('opacity', t > 1.8 ? 1 : 0);
      lab.setAttribute('opacity', seg(t, 2.8, 3.1));
    }
  };
}
