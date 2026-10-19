// allergy：ケーキを出された弟。ケーキには卵が入っている→卵にバツ。弟は首を振って皿を押し返す（例文 My brother has an allergy to eggs, so he can't eat cake.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, backOut } from '../ease.js';
import { P, reach, hp } from './hospital.js';
import { cake } from './so-far-so-good.js';
import { cloud } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, 'ケーキが来る'], [1.4, '卵が入っている'], [2.8, '食べられない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 40, y: 40, width: 84, height: 62, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  // テーブル
  const TY = 186;
  el('rect', { x: 120, y: TY, width: 170, height: 10, rx: 3, fill: pal.wood });
  el('rect', { x: 128, y: TY + 10, width: 8, height: FY - TY - 10, fill: pal.woodDark });
  el('rect', { x: 274, y: TY + 10, width: 8, height: FY - TY - 10, fill: pal.woodDark });
  k.shadow(205, FY + 1, 90, 4);
  const bro = k.buddy({ x: 100, y: FY, scale: 0.68 });
  const mom = k.buddy({ x: 330, y: FY, scale: 0.95, facing: -1, color: pal.coral, dark: pal.coralDark });
  // 皿とケーキ
  const dish = g({});
  el('ellipse', { cx: 0, cy: 0, rx: 22, ry: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, dish);
  const ck = cake(k, dish); tf(ck, 0, -1, 0, 1.1);
  // 考え雲：卵→ケーキ、卵にバツ
  const c = cloud(k, 120, 64, -1);
  const egg = g({}, c.g); tf(egg, -32, 0);
  el('ellipse', { rx: 13, ry: 16, fill: '#FFF8E8', stroke: '#E8D6B0', 'stroke-width': 2 }, egg);
  el('circle', { r: 6, fill: pal.yellow }, egg);
  const arrow = el('path', { d: 'M -12 0 L 6 0 M 0 -5 L 6 0 L 0 5', stroke: pal.sub, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, c.g);
  const ck2 = cake(k, c.g); tf(ck2, 32, 10, 0, 0.9);
  const cross = el('path', { d: 'M -16 -16 L 16 16 M 16 -16 L -16 16', stroke: pal.red, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-dasharray': 92, 'stroke-dashoffset': 92 }, c.g);
  const ban = el('circle', { cx: 0, cy: 0, r: 22, fill: 'none', stroke: pal.red, 'stroke-width': 4, opacity: 0 });
  return {
    update(t) {
      // 母がケーキを差し出す→弟が押し返す
      // 母は皿を手に持ったまま差し出し、断られて引っこめる
      const give = easeInOut(seg(t, 0.2, 1.0)), back = easeInOut(seg(t, 3.1, 3.7));
      const mx = lerp(316, 250, give) + lerp(0, 50, back);
      P(mom, { x: mx, walk: (mx - 316) * 0.12, facing: -1, look: 0.5, mood: t > 3.0 ? 'flat' : 'smile', lean: 8 * give * (1 - back) });
      P(mom, { ...mom.state, armR: lerp(8, 82, easeOut(seg(t, 0.0, 0.5))) });
      const mh = hp(mom, 0.95, 'R', 30);
      tf(dish, mh.x - 8, mh.y + 2);
      const shake = t > 2.3 && t < 3.0 ? Math.sin((t - 2.3) * 22) : 0;
      const stop = easeOut(seg(t, 2.5, 2.8)) * (1 - easeInOut(seg(t, 3.8, 4.3)));
      P(bro, { look: shake * 0.9 + (t < 2.3 ? 0.5 : 0), mood: t > 1.6 ? 'sad' : 'smile', lean: -3 * stop });
      P(bro, { ...bro.state, armR: lerp(8, 95, stop) });
      c.show(seg(t, 1.3, 1.6), 112, 92);
      tf(egg, -32, 0, 0, 1);
      cross.setAttribute('stroke-dashoffset', (92 * (1 - easeOut(seg(t, 2.0, 2.4)))).toFixed(1));
      tf(cross, -32, 0);
    }
  };
}
