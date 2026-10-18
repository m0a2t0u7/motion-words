// run across：箱の中を探って物を出していると、思いがけず古い写真が出てきて、手に取って見つめる（例文 I ran across an old photo in the box.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { hp, reach } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '箱を整理'], [2.0, '写真が出てきた'], [3.4, 'じっと見る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 290, y: 56, width: 80, height: 60, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const BX = 230;
  k.shadow(BX, FY, 50, 5);
  el('rect', { x: BX - 44, y: FY - 56, width: 88, height: 10, fill: '#8A6A4C' });
  // 中身（取り出す物）：ボール・本
  const ballG = g({}); el('circle', { r: 10, fill: pal.blue }, ballG);
  const bookG = g({}); el('rect', { x: -12, y: -8, width: 24, height: 16, rx: 2, fill: pal.violet }, bookG);
  const photo = g({});
  el('rect', { x: -16, y: -13, width: 32, height: 26, rx: 2, fill: '#F3E7CF', stroke: '#C9A577', 'stroke-width': 2 }, photo);
  el('rect', { x: -12, y: -9, width: 24, height: 15, fill: '#D8C29B' }, photo);
  el('circle', { cx: -4, cy: -2, r: 4, fill: '#A88D63' }, photo); el('circle', { cx: 5, cy: -1, r: 3.4, fill: '#A88D63' }, photo);
  // 箱の前面
  el('rect', { x: BX - 46, y: FY - 48, width: 92, height: 48, rx: 4, fill: pal.wood });
  el('rect', { x: BX - 46, y: FY - 48, width: 92, height: 7, fill: pal.woodDark });
  const items = [ballG, bookG].map((n, i) => ({ n, sh: k.shadow(0, FY, 10, 2.5), land: [{ x: 300, y: FY - 10 }, { x: 328, y: FY - 8 }][i] }));
  const S = 1;
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const spark = g({}); [0, 1, 2, 3].forEach((i) => { const a = i * Math.PI / 2 + 0.6; el('line', { x1: Math.cos(a) * 22, y1: Math.sin(a) * 22, x2: Math.cos(a) * 30, y2: Math.sin(a) * 30, stroke: pal.yellowDark, 'stroke-width': 3, 'stroke-linecap': 'round' }, spark); });
  const T = [0.3, 1.1];
  return {
    update(t) {
      // 箱に手を入れて取り出し、右へ置く（2回）→ 3回目に写真
      let tgt = { x: 200, y: 200 }, lean = 0;
      const cyc = (s) => { const dn = easeInOut(seg(t, s, s + 0.3)), up = easeInOut(seg(t, s + 0.3, s + 0.6)); return { dn, up }; };
      [0.3, 1.1, 1.9].forEach((s) => { const c = cyc(s); if (t >= s) { tgt = { x: BX - 10, y: lerp(lerp(190, FY - 46, c.dn), 168, c.up) }; lean = 18 * c.dn * (1 - c.up); } });
      const look = easeInOut(seg(t, 2.6, 3.1));
      if (t > 2.5) tgt = { x: lerp(BX - 10, 196, look), y: lerp(168, 142, look) };
      b.pose({ lean, squash: 1 - 0.06 * lean / 18, look: 0.6, mood: t > 2.4 ? 'open' : 'flat', armL: 10 });
      b.pose({ armR: reach(b, S, 'R', tgt.x, tgt.y) });
      const h = hp(b, S, 'R');
      items.forEach((it, i) => {
        const s = T[i], up = s + 0.6, f = seg(t, up, up + 0.4);
        let p;
        if (t < s + 0.3) p = { x: BX - 10 + i * 14, y: FY - 60 };
        else if (t < up) p = { x: h.x + 4, y: h.y + 4 };
        else p = { x: lerp(h.x, it.land.x, f), y: lerp(170, it.land.y, f) - 30 * hump(f) };
        tf(it.n, p.x, p.y); it.n.setAttribute('opacity', t < s + 0.3 ? 0 : 1);
        k.set(it.sh, { cx: p.x, opacity: f >= 1 ? 1 : 0 });
      });
      const ph = t > 2.2;
      tf(photo, h.x + 6, h.y - 8, ph ? -6 : 0, ph ? lerp(1, 1.5, look) : 1);
      photo.setAttribute('opacity', t > 2.2 ? 1 : 0);
      const sp = backOut(seg(t, 2.3, 2.6));
      tf(spark, h.x + 6, h.y - 8, 0, Math.max(0.01, sp)); spark.setAttribute('opacity', seg(t, 2.3, 2.4) * (1 - seg(t, 3.0, 3.3)));
      if (t > 3.3) b.pose({ mood: 'smile', blink: hump(seg(t, 3.8, 3.95)) });
    }
  };
}
