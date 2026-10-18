// rip off：まめがプレゼントの包み紙をつかみ、勢いよくはぎ取る。中から箱が出てくる（例文 He ripped off the wrapping paper.）
import { seg, lerp, easeInOut, easeIn, easeOut, backOut, wobble, clamp } from '../ease.js';
import { reach } from './dig.js';

export const meta = { duration: 3.6, beats: [[0, '包まれた箱'], [1.3, '一気にはぎ取る'], [2.6, '中身が見えた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const TY = 200, FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 180, y: TY, width: 220, height: 10, rx: 3, fill: pal.wood });
  el('rect', { x: 370, y: TY + 10, width: 8, height: 30, fill: pal.woodDark });
  k.shadow(260, TY + 1, 50, 4);
  // 中の箱
  el('rect', { x: 216, y: 136, width: 88, height: 64, rx: 4, fill: '#E9E2D6', stroke: '#C9BFAE', 'stroke-width': 2 });
  el('rect', { x: 224, y: 160, width: 72, height: 20, rx: 3, fill: '#fff' });
  el('circle', { cx: 240, cy: 170, r: 6, fill: pal.blue });
  el('rect', { x: 252, y: 166, width: 34, height: 4, rx: 2, fill: pal.sub });
  // 包み紙（左端を残して、右から左上へ引きはがす）
  const wrap = g({});
  el('rect', { x: -44, y: -32, width: 88, height: 64, rx: 3, fill: pal.coral }, wrap);
  for (let i = -3; i <= 3; i++) el('circle', { cx: i * 13, cy: (i % 2) * 14, r: 3.2, fill: '#fff', opacity: 0.7 }, wrap);
  el('rect', { x: -6, y: -32, width: 12, height: 64, fill: pal.yellow }, wrap);
  const B = k.buddy({ x: 140, y: FY, scale: 0.95 });
  return {
    update(t) {
      const grab = easeInOut(seg(t, 0.3, 1.0));
      const rip = easeIn(seg(t, 1.1, 1.35)), fly = seg(t, 1.35, 2.4);
      // 紙はつかんだ点ごと勢いよく左上へ飛び、くしゃっと縮む
      const x = lerp(260, 120, easeOut(rip) * 0.5 + fly * 0.5), y = lerp(168, 96, rip) + easeIn(fly) * 150;
      const crumple = lerp(1, 0.35, easeOut(seg(t, 1.2, 1.6)));
      tf(wrap, x, y, -40 * rip - 260 * fly, crumple, lerp(1, 0.5, rip));
      wrap.setAttribute('opacity', 1 - seg(t, 2.1, 2.4));
      const target = t < 1.1 ? { x: lerp(200, 218, grab), y: 150 } : { x, y };
      const armR = t < 1.6 ? reach(B, 0.95, 'R', target.x, target.y) : lerp(150, 30, easeInOut(seg(t, 1.6, 2.2)));
      B.pose({ armR, armL: t > 2.4 ? lerp(10, 120, easeOut(seg(t, 2.4, 2.8))) : 10, lean: 10 * grab - 16 * rip * (1 - seg(t, 1.6, 2.2)), mood: t > 2.3 ? 'grin' : t > 1.1 ? 'open' : 'smile', look: 0.8, squash: 1 - 0.05 * Math.sin(seg(t, 0.9, 1.2) * Math.PI) });
    }
  };
}
