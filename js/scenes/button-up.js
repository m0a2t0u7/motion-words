// button up：コートの前を、下から順にボタンで留めていく（例文 He buttoned up his coat.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { jacket } from './zip-up.js';

export const meta = { duration: 4.4, beats: [[0, '前が開いている'], [1.6, '下から留める'], [3.4, '全部留めた']] };

export function create(k) {
  const { el, pal } = k;
  const FY = k.backdrop({ floorY: 256, mood: 'indoor' });
  // 玄関の壁にフック
  el('rect', { x: 40, y: 60, width: 90, height: 8, rx: 4, fill: pal.wood });
  [58, 84, 110].forEach((x) => el('circle', { cx: x, cy: 64, r: 4, fill: pal.woodDark }));
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  const S = 1.6;
  const b = k.buddy({ x: 215, y: FY, scale: S });
  const BY = [-8, -17, -26, -35];
  const j = jacket(k, b, pal.blue, pal.blueDark, BY);
  const T0 = [0.5, 1.25, 2.0, 2.75];
  return {
    update(t) {
      const rest = { x: 33, y: -20 };
      // どのボタンを触っているか
      let yc = 4, hx = rest.x, hy = rest.y, openX = [];
      const fast = T0.map((a) => easeOut(seg(t, a + 0.3, a + 0.55)));
      yc = 4;
      BY.forEach((y, i) => { yc = lerp(yc, i === 3 ? -38 : y - 3, fast[i]); });
      const cur = T0.findIndex((a, i) => t < (i === 3 ? a + 0.75 : T0[i + 1]));
      if (cur >= 0) {
        const a = T0[cur];
        const to = { x: 10 - 8 * fast[cur], y: BY[cur] };
        const arrive = easeOut(seg(t, a - 0.1, a + 0.25));
        const from = cur === 0 ? rest : { x: 2, y: BY[cur - 1] };
        hx = lerp(from.x, to.x, arrive); hy = lerp(from.y, to.y, arrive);
        if (cur === 3) { const leave = easeInOut(seg(t, a + 0.55, a + 1.15)); hx = lerp(hx, rest.x, leave); hy = lerp(hy, rest.y, leave); }
      } else { hx = rest.x; hy = rest.y; }
      b.pose({ armL: 20, look: 0.55, mood: t > 3.4 ? 'grin' : 'smile', lean: 2, squash: 1 - 0.015 * hump(seg(t, 3.2, 3.8)) });
      const btn = j.draw(yc, hx, hy, 9);
      btn.forEach((c, i) => {
        const done = fast[i];
        k.set(c, { cx: lerp(11, 0, done), cy: BY[i] });
      });
    }
  };
}
