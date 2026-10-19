// back：一日中いすに座りっぱなし。立ち上がると背中が痛く、両手で背中をおさえてそらす（例文 My back hurts from sitting all day.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { hp, reach, P, blinkAt, bp, ache, spot } from './body.js';
import { officeBg, desk, monitor } from './get-on-with.js';
import { clock } from './run-after.js';

export const meta = { duration: 4.4, beats: [[0, '一日中座る'], [1.8, '立ち上がる'], [2.6, '背中が痛い']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.15, FY = 236;
  officeBg(k, FY, 40);
  const ck = clock(k, 300, 58, 18);
  const sky = el('rect', { x: 44, y: 44, width: 92, height: 66, fill: '#F9C9A4', opacity: 0 });
  // いす（動かない）
  el('rect', { x: 110, y: FY - 30, width: 56, height: 8, rx: 3, fill: pal.sub }); el('rect', { x: 134, y: FY - 22, width: 7, height: 22, fill: pal.sub });
  el('rect', { x: 106, y: FY - 96, width: 8, height: 70, rx: 3, fill: pal.sub });
  const b = k.buddy({ x: 140, y: FY - 26, scale: S });
  const top = desk(k, 190, 150, FY);
  monitor(k, 282, top);
  const hurt = ache(k), ring = spot(k, pal.red);
  return {
    update(t) {
      const h = lerp(9, 19, easeInOut(seg(t, 0, 1.8)));
      ck.set(h, (h % 1) * 60);
      sky.setAttribute('opacity', (0.7 * seg(t, 1.0, 1.8)).toFixed(2));
      const stand = easeInOut(seg(t, 1.9, 2.4)), arch = easeInOut(seg(t, 2.6, 3.0));
      const sx = lerp(140, 70, stand);
      P(b, { x: sx, y: lerp(FY - 26, FY, stand), lean: t < 1.8 ? 12 + 2 * Math.sin(t * 3) : lerp(12, -14, arch) * (stand > 0.5 ? 1 : 1), mood: t > 2.4 ? 'sad' : 'flat', blink: t > 2.6 ? 0.6 : blinkAt(t), look: t < 1.8 ? 0.7 : 0.1, walk: 0 });
      // 座っている間はキーボード、立つと腰（背中側）に手
      const bk = bp(b, S, -24, -26);
      if (t < 1.8) b.pose({ armR: reach(b, S, 'R', 228 + 4 * Math.sin(t * 22), top - 8), armL: 30 });
      else b.pose({ armR: lerp(10, -30, arch), armL: lerp(10, 40, arch) });
      hurt.set(easeOut(seg(t, 2.5, 2.8)), bk.x - 24, bk.y - 6, t, -70);
      ring.set(seg(t, 2.5, 2.8), bk.x, bk.y, 18, t);
    }
  };
}
