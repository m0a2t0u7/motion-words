// jar：お皿のクッキーをガラスの広口瓶に1枚ずつ入れて、ふたを閉めてしまう（例文 Keep the cookies in a glass jar.）
import { seg, lerp, easeInOut, easeOut, clamp, hump, wobble } from '../ease.js';
import { kitchen, TOP, arms, plateP, P, blinkAt } from './jam.js';

export const meta = { duration: 4.4, beats: [[0, 'クッキー'], [0.6, '瓶に入れる'], [3.4, 'ふたをした']] };

function cookie(k) {
  const g = k.g({});
  k.el('circle', { r: 8, fill: '#D9A05B', stroke: '#B97E3E', 'stroke-width': 1.4 }, g);
  [[-3, -2], [3, 1], [-1, 4]].forEach(([x, y]) => k.el('circle', { cx: x, cy: y, r: 1.6, fill: '#6B4226' }, g));
  return g;
}

export function create(k) {
  const { el, pal } = k, S = 1.2;
  const kit = kitchen(k);
  const b = k.buddy({ x: 170, y: kit.FY, scale: S });
  kit.front();
  const JX = 250, JW = 52, JH = 62;
  const pl = plateP(k, null, 22); k.tf(pl, 130, TOP + 4);
  // 瓶の中身（ガラスの後ろ）
  const cs = [0, 1, 2, 3].map(() => cookie(k));
  el('path', { d: `M ${JX - JW / 2} ${TOP} V ${TOP - JH + 8} Q ${JX - JW / 2} ${TOP - JH} ${JX - JW / 2 + 8} ${TOP - JH} H ${JX + JW / 2 - 8} Q ${JX + JW / 2} ${TOP - JH} ${JX + JW / 2} ${TOP - JH + 8} V ${TOP} Z`, fill: 'rgba(200,232,250,0.35)', stroke: '#A9CDE3', 'stroke-width': 2 });
  el('path', { d: `M ${JX - JW / 2 + 6} ${TOP - JH + 12} V ${TOP - 8}`, stroke: '#fff', 'stroke-width': 3, opacity: 0.7, 'stroke-linecap': 'round' });
  const lid = k.g({});
  el('rect', { x: -JW / 2 - 3, y: -10, width: JW + 6, height: 10, rx: 3, fill: '#E86F57' }, lid);
  el('rect', { x: -8, y: -15, width: 16, height: 6, rx: 3, fill: '#C9553F' }, lid);
  const A = arms(k, b, S, { back: ['L'] });
  const dest = [[JX - 10, TOP - 9], [JX + 11, TOP - 9], [JX, TOP - 24], [JX - 4, TOP - 38]];
  const per = 0.65, t0 = 0.4;
  return {
    update(t) {
      P(b, { lean: 6, look: 0.6, blink: blinkAt(t), mood: t > 3.6 ? 'grin' : 'smile' });
      let hand = { x: 150, y: TOP - 14 };
      cs.forEach((c, i) => {
        const a = t0 + i * per, q = seg(t, a, a + per);
        const src = { x: 124 + i * 4, y: TOP - 4 - (3 - i) * 4 };
        const top = { x: JX, y: TOP - JH - 16 };
        if (t < a) { k.tf(c, src.x, src.y, 0, 1, 0.45); return; }
        if (q < 1) {
          // 皿 → 瓶の口の上 → 中へ落とす
          const up = easeInOut(seg(q, 0, 0.6)), dn = easeInOut(seg(q, 0.6, 1));
          const x = lerp(lerp(src.x, top.x, up), dest[i][0], dn), y = lerp(lerp(src.y, top.y, up) - 24 * hump(up), dest[i][1], dn);
          k.tf(c, x, y, 0, 1, q < 0.6 ? 0.45 + 0.55 * up : 1);
          if (q < 0.6) hand = { x, y: y - 6 };
          else hand = { x: top.x, y: top.y - 4 - 6 * (q - 0.6) };
          return;
        }
        k.tf(c, dest[i][0], dest[i][1] + 1.5 * wobble(seg(t, a + per, a + per + 0.4), 2, 6));
      });
      // ふた：台の上 → 瓶の口へ
      const lq = easeInOut(seg(t, 3.0, 3.6));
      const lx = lerp(310, JX, lq), ly = lerp(TOP, TOP - JH + 1, lq) - 30 * hump(lq);
      const tw = Math.sin(seg(t, 3.6, 4.1) * Math.PI * 3) * 6 * (t < 4.1);
      k.tf(lid, lx, ly, 0);
      if (t > 3.0) hand = { x: lx + 4 + tw * 0.4, y: ly - 14 };
      else if (t > t0 + 4 * per) hand = { x: lerp(JX, 310, easeInOut(seg(t, t0 + 4 * per, 3.0))), y: lerp(TOP - JH - 20, TOP - 14, easeInOut(seg(t, t0 + 4 * per, 3.0))) };
      A.to('R', hand.x, hand.y);
      A.to('L', t > 3.4 ? JX - JW / 2 - 4 : 150, t > 3.4 ? TOP - 30 : TOP + 2);
    }
  };
}
