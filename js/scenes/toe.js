// toe：部屋を歩いていて、テーブルの脚につま先をぶつける。片足でぴょんぴょん（例文 I hit my toe on the table.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, clamp } from '../ease.js';
import { hp, reach, P, blinkAt, bp, gait, legs, feet, legG, ache, spot } from './body.js';
import { homeBg } from './furniture.js';
import { star } from './get-on-with.js';

export const meta = { duration: 4.4, beats: [[0, '部屋を歩く'], [1.2, 'ゴン！'], [2.0, 'つま先が痛い']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.3, FY = 240;
  homeBg(k, { FY, winX: 30 });
  // テーブル（動かない）
  el('rect', { x: 250, y: FY - 70, width: 130, height: 10, rx: 3, fill: pal.wood });
  el('rect', { x: 258, y: FY - 60, width: 9, height: 60, fill: pal.woodDark }); el('rect', { x: 362, y: FY - 60, width: 9, height: 60, fill: pal.woodDark });
  el('rect', { x: 300, y: FY - 88, width: 26, height: 18, rx: 3, fill: '#9ED3B2' });
  k.shadow(315, FY + 2, 70, 4);
  const b = k.buddy({ x: 80, y: FY, scale: S });
  const ft = feet(k, b, '#fff');
  ft.forEach((f) => f.setAttribute('stroke', '#C3CCD8'));
  const st = star(k, null, 9), hurt = ache(k), ring = spot(k, pal.red);
  const xf = (t) => lerp(80, 228, seg(t, 0, 1.2));
  return {
    update(t) {
      const gt = gait(xf, t, 80, 18), hit = t > 1.2;
      const hopping = t > 1.4;
      const hp2 = hopping ? Math.abs(Math.sin((t - 1.4) * 8)) : 0;
      P(b, { x: hit ? 228 - 30 * easeOut(seg(t, 1.2, 2.2)) : gt.x, walk: hit ? 0 : gt.walk, lift: 12 * hp2, lean: hit ? -6 : gt.lean, mood: hit ? 'open' : 'smile', blink: hit && t < 1.9 ? 1 : blinkAt(t), look: hit ? 0.5 : 0.2, armL: hit ? 120 : gt.armL, armR: gt.armR });
      if (hopping) { legs(b, 0, -80); const toe = bp(b, S, 26, -6); b.pose({ armR: reach(b, S, 'R', toe.x, toe.y - 4) }); legs(b, 0, -80); }
      const tp = { x: 258, y: FY - 6 };
      tf(st, tp.x - 4, tp.y - 14, t * 200, t > 1.2 && t < 1.7 ? 1.2 : 0.001);
      ft[1].setAttribute('fill', hit ? '#F7A9A0' : '#fff');
      const tf2 = hopping ? (() => { const g2 = legG(b, 1).getBoundingClientRect ? null : null; return bp(b, S, 34, -8); })() : tp;
      hurt.set(easeOut(seg(t, 1.2, 1.4)), tf2.x + 16, tf2.y - 12, t, 50);
      ring.set(seg(t, 1.3, 1.6) * (1 - seg(t, 3.6, 4.0)), tf2.x, tf2.y, 14, t);
    }
  };
}
