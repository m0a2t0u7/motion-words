// on cloud nine：うれしい知らせの手紙を読むと雲が足元にふくらみ、体がふわっと持ち上がって大喜び（She was on cloud nine after the news.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { hp, spark } from './get-something-off-ones-chest.js';

export const meta = { duration: 4.4, beats: [[0, '知らせを読む'], [1.6, '雲がふくらむ'], [3.2, '大喜び']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 244, mood: 'outdoor' });
  [[60, 60, 0.8], [330, 40, 1]].forEach(([x, y, s]) => { const c = g({}); tf(c, x, y, 0, s); [[-22, 4, 14], [0, -4, 19], [22, 4, 14]].forEach(([cx, cy, r]) => el('circle', { cx, cy, r, fill: '#fff', opacity: 0.8 }, c)); });
  const gs = k.shadow(150, FY + 2, 30, 6);
  const mint = k.buddy({ x: 150, y: FY });
  const coral = k.buddy({ x: 250, y: FY, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const mgs = mint.g.firstChild; mgs.setAttribute('display', 'none');
  // 雲（体の後ろの段と前の段）
  const cb = g({}), cf = g({});
  [[-26, -4, 18], [0, -12, 24], [26, -4, 18]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#EAF0F7' }, cb));
  [[-30, 6, 17], [-10, 10, 20], [12, 10, 20], [32, 6, 17]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#fff', stroke: '#DCE4EE', 'stroke-width': 1.5 }, cf));
  const letter = g({});
  el('rect', { x: -14, y: -10, width: 28, height: 20, rx: 3, fill: '#fff', stroke: '#CBD3DF', 'stroke-width': 2 }, letter);
  const star = el('path', { d: 'M0 -7 L2 -2 L7 -2 L3 1.5 L4.5 6.5 L0 3.5 L-4.5 6.5 L-3 1.5 L-7 -2 L-2 -2 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1 }, letter);
  const sp = [0, 1, 2, 3, 4].map((i) => spark(k, g({}), i % 2 ? pal.coral : pal.yellow));
  return {
    update(t) {
      const grow = easeOut(seg(t, 1.5, 2.2));
      const rise = easeInOut(seg(t, 1.9, 3.1));
      const H = 70 * rise;
      const bob = rise >= 1 ? 4 * Math.sin((t - 3.1) * 4) : 0;
      const hop = hump(seg(t, 1.5, 1.9)) * 6;
      const y = FY - H - bob - 0;
      const cheer = easeOut(seg(t, 2.9, 3.4));
      mint.pose({
        y: y - 14 * grow - hop * 0, x: 150, squash: 1 - 0.06 * hump(seg(t, 1.5, 1.8)) - 0.05 * hump(seg(t, 3.1, 3.4)) + 0.02 * Math.sin(t * 8) * cheer,
        lean: t < 1.5 ? 12 : lerp(12, -4, easeOut(seg(t, 1.5, 2.0))),
        armL: t < 1.5 ? 20 : lerp(20, 160, cheer) , armR: t < 1.5 ? 70 : lerp(70, 160, cheer),
        mood: t < 1.0 ? 'flat' : t < 1.5 ? 'open' : 'grin', look: 0.3, blink: 0
      });
      // 手紙：コーラルが手渡し→読む→放り投げる
      const hs = hp(coral, 1, 'R', 24);
      const give = seg(t, 0.2, 0.8);
      coral.pose({ armR: lerp(8, 88, easeOut(seg(t, 0, 0.5))) * (1 - seg(t, 0.8, 1.2)) + 8 * seg(t, 0.8, 1.2), armL: 8 + 140 * cheer * 0, look: 0.5, mood: 'smile', lift: 10 * hump(seg(t, 3.1, 3.7)) });
      const hm = hp(mint, 1, 'R', 24);
      const rd = seg(t, 0.8, 1.0);
      let lx = lerp(hs.x - 4, hm.x + 4, easeInOut(give)), ly = lerp(hs.y, hm.y - 6, easeInOut(give));
      if (t > 1.2) { const p = seg(t, 1.5, 2.3); lx = hm.x + 20 * p; ly = hm.y - 6 - 80 * p; }
      tf(letter, lx, ly, t > 1.5 ? 25 * seg(t, 1.5, 2.3) : 0, 1);
      letter.setAttribute('opacity', t > 2.2 ? 0 : 1);
      star.setAttribute('opacity', t > 0.9 ? 1 : 0);
      // 雲：足元でふくらみ、体と一緒に上がる
      tf(cb, 150, y - 4, 0, grow, grow);
      tf(cf, 150, y - 6, 0, grow, grow);
      cb.setAttribute('opacity', grow > 0 ? 1 : 0); cf.setAttribute('opacity', grow > 0 ? 1 : 0);
      // 地面の影：高さで小さく薄く
      k.set(gs, { cx: 150, rx: 30 - 14 * rise, opacity: 1 - 0.5 * rise });
      sp.forEach((s, i) => {
        const p = seg(t, 2.6 + i * 0.12, 3.4 + i * 0.12), a = i * 1.26 + t * 2;
        tf(s.parentNode, 150 + Math.cos(a) * 56, FY - 70 - 70 * rise - 20 + Math.sin(a) * 26, 0, hump(p) * (0.9 + 0.3 * Math.sin(t * 8 + i)));
      });
    }
  };
}
