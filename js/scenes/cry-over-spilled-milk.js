// cry over spilled milk：こぼれた牛乳を前に嘆くが、もう戻らない（例文 It's no use crying over spilled milk.）
import { seg, lerp, easeInOut, easeIn, easeOut, wobble, hump, backOut } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, 'コップが倒れる'], [1.3, '牛乳がこぼれる'], [2.6, '嘆いても戻らない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // テーブル
  const TY = 176;
  el('rect', { x: 220, y: TY, width: 170, height: 12, rx: 4, fill: pal.wood });
  el('rect', { x: 232, y: TY + 10, width: 10, height: FY - TY - 10, fill: pal.woodDark });
  el('rect', { x: 368, y: TY + 10, width: 10, height: FY - TY - 10, fill: pal.woodDark });
  // 床の水たまり
  const puddle = el('ellipse', { cx: 190, cy: FY + 10, rx: 0, ry: 0, fill: pal.milk, stroke: '#DCE3EC', 'stroke-width': 3 });
  const stream = el('path', { d: '', fill: 'none', stroke: pal.milk, 'stroke-width': 7, 'stroke-linecap': 'round' });
  // コップ（原点＝底の中心）
  const cup = g({});
  const cupMilk = el('path', { d: 'M -14 -6 L 14 -6 L 12 -32 L -12 -32 Z', fill: pal.milk }, cup);
  el('path', { d: 'M -15 0 L 15 0 L 17 -44 L -17 -44 Z', fill: '#CFE8F7', opacity: 0.55, stroke: '#9CC7E3', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, cup);

  const b = k.buddy({ x: 120, y: FY, scale: 1.05 });
  const base = { armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0.6, mood: 'smile', blink: 0, lift: 0 };
  const tears = [0, 1].map(() => el('path', { d: 'M 0 -7 Q 5 0 0 5 Q -5 0 0 -7 Z', fill: pal.water, stroke: pal.blueDark, 'stroke-width': 1.2 }));
  // 戻せない印（↶に×）
  const undo = g({});
  el('path', { d: 'M -16 4 A 16 16 0 1 0 -8 -12 M -8 -22 L -8 -10 L -20 -12', fill: 'none', stroke: pal.sub, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, undo);
  el('path', { d: 'M -14 -22 L 14 8 M 14 -22 L -14 8', stroke: pal.red, 'stroke-width': 5, 'stroke-linecap': 'round' }, undo);

  return {
    update(t) {
      // コップが倒れる（テーブルの端でかたむく）
      const tip = easeIn(seg(t, 0.5, 1.2));
      const fallOff = easeIn(seg(t, 1.2, 1.7));
      const rot = lerp(0, -95, tip) + wobble(seg(t, 1.7, 2.3), 2, 6) * 4;
      const cx = lerp(272, 262, tip);
      tf(cup, cx, TY - 14 * tip, rot, 1, 1);
      // コップはテーブル上に横たわる。牛乳はテーブルの端から垂れ落ちる
      cupMilk.setAttribute('opacity', 1 - seg(t, 0.9, 1.3));
      const drip = seg(t, 1.1, 1.8);
      const sx = 218, top = TY + 4, bot = lerp(TY + 4, FY + 8, easeIn(drip));
      k.set(stream, { d: `M ${sx} ${top} L ${sx} ${bot}`, opacity: drip > 0 && seg(t, 2.1, 2.6) < 1 ? 1 : 0 });
      const pp = easeOut(seg(t, 1.7, 2.9));
      k.set(puddle, { cx: 205, rx: 70 * pp, ry: 11 * pp });
      // まめ：驚き→泣く
      const cry = seg(t, 2.3, 2.7);
      const shock = t > 1.2 && t < 2.3;
      b.pose({ ...base, mood: cry > 0 ? 'sad' : shock ? 'open' : 'smile', armL: cry > 0 ? 130 : shock ? 100 : 8, armR: cry > 0 ? 130 : shock ? 100 : 8, lean: cry > 0 ? 8 + 3 * Math.sin(t * 12) : -3, blink: cry > 0 ? 0.7 : 0, look: 0.7, squash: cry > 0 ? 1 - 0.02 * Math.sin(t * 12) : 1 });
      tears.forEach((tr, i) => {
        const p = cry > 0 ? ((t * 1.4 + i * 0.5) % 1) : 0;
        tf(tr, 112 + i * 20, 168 + 50 * p, 0, cry > 0 ? 1 : 0, 1);
      });
      const up = backOut(seg(t, 3.1, 3.5), 2);
      tf(undo, 300, 100, 0, up, up);
    }
  };
}
