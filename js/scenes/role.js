// role：子どもが棚の本に手が届かず困っていると、親のまめが抱き上げて手伝い、子は本を取れて笑う（例文 Parents play an important role.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, hp, aim, walkTo, path, person, homeBg, heart } from './confused.js';

export const meta = { duration: 4.4, beats: [[0.0, '手が届かない'], [1.53, '親が支える'], [3.06, 'できた！']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1, KS = 0.58;
  const FY = homeBg(k, { winX: 40 });
  // 高い本棚
  const BX = 220;
  k.shadow(BX + 50, FY + 1, 60, 4);
  el('rect', { x: BX, y: FY - 190, width: 110, height: 190, fill: pal.woodDark });
  [FY - 130, FY - 66].forEach((y) => el('rect', { x: BX + 6, y, width: 98, height: 5, fill: pal.wood }));
  el('rect', { x: BX + 6, y: FY - 184, width: 98, height: 54, fill: '#B98E5E' });
  el('rect', { x: BX + 6, y: FY - 125, width: 98, height: 59, fill: '#B98E5E' });
  el('rect', { x: BX + 6, y: FY - 61, width: 98, height: 58, fill: '#B98E5E' });
  [[12, pal.blue], [24, pal.coral], [36, pal.green], [60, pal.violet], [72, pal.yellow]].forEach(([x, c]) => el('rect', { x: BX + x, y: FY - 104, width: 10, height: 38, rx: 1, fill: c }));
  [[14, pal.yellow], [26, pal.blue], [52, pal.coral], [66, pal.green], [80, pal.blue]].forEach(([x, c]) => el('rect', { x: BX + x, y: FY - 44, width: 11, height: 41, rx: 1, fill: c }));
  const book = g({}); el('rect', { x: -6, y: -20, width: 12, height: 40, rx: 1.5, fill: pal.red }, book); el('rect', { x: -6, y: -14, width: 12, height: 4, fill: '#fff', opacity: 0.6 }, book);
  const b = k.buddy({ x: 60, y: FY, scale: S });
  const kid = person(k, 'coral', { x: 200, y: FY, scale: KS, facing: 1 });
  const hs = [0, 1, 2].map(() => heart(k));
  const xf = path([[0.9, 60], [1.7, 176]]);
  return {
    update(t) {
      t *= 4.6 / 4.4; // 4.4 秒に収める
      // 子：背伸びしても届かない
      const tip = Math.abs(Math.sin(t * 6)) * (t < 1.7 ? 1 : 0);
      const w = walkTo(xf, t, 60, 1);
      const lift = easeInOut(seg(t, 2.0, 2.7));
      P(b, { x: w.x, walk: w.walk, lean: w.lean + 10 * hump(seg(t, 1.8, 2.2)), armL: w.armL, armR: w.armR, mood: t > 3.0 ? 'grin' : 'smile', look: 0.6, blink: blinkAt(t) });
      const kx = lerp(200, 198, lift), ky = FY - lerp(0, 70, lift) - 4 * tip;
      if (t > 1.8) { aim(b, S, 'R', kx - 6, ky - 22); aim(b, S, 'L', kx - 14, ky - 30); }
      const grab = seg(t, 2.8, 3.2);
      P(kid, { x: kx, y: ky, facing: 1, lift: 0, armR: t < 1.7 ? 160 : lerp(160, 175, grab), armL: t < 1.7 ? 140 : 40, mood: t < 1.7 ? 'sad' : t > 3.1 ? 'grin' : 'smile', look: 0.6, blink: blinkAt(t, 1), squash: 1 + 0.04 * tip });
      if (t > 2.6) aim(kid, KS, 'R', BX + 48, FY - 172);
      // 本：棚から子の手へ
      const h = hp(kid, KS, 'R');
      const bx = grab < 1 ? BX + 48 : h.x, by = grab < 1 ? FY - 156 : h.y + 6;
      tf(book, t > 3.2 ? h.x + 4 : bx, t > 3.2 ? h.y + 8 : by, 0, 1);
      if (t > 3.3) kid.pose({ armR: lerp(175, 120, seg(t, 3.3, 3.7)) });
      hs.forEach((n, i) => { const q = seg(t, 3.4 + i * 0.2, 4.6); tf(n, 150 + i * 30, FY - 160 - 20 * q, 0, q > 0 ? 1.2 * hump(q * 0.7 + 0.3) : 0.001); });
    }
  };
}
