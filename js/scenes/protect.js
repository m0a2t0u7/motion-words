// protect：ヘルメットをかぶると、頭上に落ちてきたレンガがはね返され、頭は無事（例文 Wear a helmet to protect your head.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, wobble } from '../ease.js';
import { hp } from './dig.js';

export const meta = { duration: 4.8, beats: [[0, 'ヘルメットを持つ'], [1.6, 'かぶる'], [3.3, '頭は無事']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const S = 1.1, FY = 240, BX = 160;
  k.backdrop({ floorY: FY, mood: 'outdoor' });
  // 工事現場の足場
  [[300, 0], [352, 1]].forEach(([x]) => el('rect', { x, y: 70, width: 6, height: FY - 70, fill: '#B9C4D2' }));
  for (let y = 70; y < FY - 40; y += 50) {
    el('rect', { x: 300, y, width: 58, height: 5, fill: '#9AA6B6' });
    el('line', { x1: 303, y1: y + 5, x2: 355, y2: y + 50, stroke: '#B9C4D2', 'stroke-width': 3 });
  }
  el('rect', { x: 0, y: FY - 4, width: 400, height: 4, fill: pal.floorEdge });
  const b = k.buddy({ x: BX, y: FY, scale: S });
  // ヘルメット（原点＝つばの中央）
  const hel = g({});
  el('path', { d: 'M -32 0 Q -34 -34 0 -36 Q 34 -34 32 0 Z', fill: pal.yellow }, hel);
  el('rect', { x: -3.5, y: -36, width: 7, height: 34, fill: pal.yellowDark, opacity: 0.55 }, hel);
  el('ellipse', { cx: -14, cy: -22, rx: 5, ry: 8, fill: '#fff', opacity: 0.35 }, hel);
  el('rect', { x: -38, y: -4, width: 76, height: 8, rx: 4, fill: pal.yellowDark }, hel);
  // レンガ
  const br = g({});
  el('rect', { x: -15, y: -7, width: 30, height: 14, rx: 2, fill: '#D9694F' }, br);
  el('line', { x1: -15, y1: 0, x2: 15, y2: 0, stroke: '#F3D6C8', 'stroke-width': 1.2 }, br);
  el('line', { x1: 0, y1: -7, x2: 0, y2: 0, stroke: '#F3D6C8', 'stroke-width': 1.2 }, br);
  const bs = k.shadow(0, FY, 12, 3);
  const arm = { a: null, h: null };
  const stars = Array.from({ length: 6 }, () => el('line', { stroke: pal.yellowDark, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0 }));
  const HT = (sq) => ({ x: BX, y: FY + (-10 - 66 * sq) * S });
  return {
    update(t) {
      const up = easeInOut(seg(t, 0.7, 1.3)) * (1 - easeInOut(seg(t, 1.8, 2.2)));
      const impact = seg(t, 2.62, 3.4), wob = wobble(impact, 3, 4) * (impact > 0 ? 1 : 0);
      const sq = 1 - 0.1 * Math.abs(wob);
      b.pose({ armR: lerp(60, 168, up) , armL: 8, lean: 0, squash: sq, look: 0.2, mood: t > 2.62 ? 'grin' : t > 1.8 ? 'open' : 'smile', blink: t > 2.62 && t < 2.8 ? 1 : 0 });
      // ヘルメット：手 → 頭
      const h = hp(b, S, 'R', 22), head = HT(sq), place = easeOut(seg(t, 1.3, 1.7));
      const hx = lerp(h.x, head.x, place), hy = lerp(h.y + 6, head.y + 0, place) + (place >= 1 ? 0 : -6 * hump(place));
      tf(hel, hx, hy - 3, 0, S * (2 - sq) * (place >= 1 ? 1 : 1), S * sq * (place >= 1 ? 1 : 1) / 1);
      // レンガ：落ちて、ヘルメットではね返る
      const fall = easeIn(seg(t, 2.1, 2.62)), hitY = head.y - 36 * S - 6;
      const bt = seg(t, 2.62, 3.5);
      let bxp = BX, byp = lerp(-30, hitY, fall), rot = 0;
      if (bt > 0) {
        const e = easeOut(bt);
        bxp = lerp(BX, 285, e); byp = lerp(hitY, FY - 7, easeIn(bt)) - 85 * hump(bt) * (1 - bt * 0.3); rot = 400 * e;
        if (bt >= 1) { byp = FY - 7; }
      }
      tf(br, bxp, byp, rot, 1);
      k.set(bs, { cx: bxp, rx: 12 - 6 * Math.min(1, Math.max(0, (FY - byp) / 120)), opacity: 0.8 });
      // 衝撃の星
      stars.forEach((s, i) => {
        const q = seg(t, 2.62, 3.0), a = (-160 + i * 28) * Math.PI / 180, r0 = 24 + 18 * q;
        k.set(s, { x1: BX + Math.cos(a) * r0, y1: head.y - 40 + Math.sin(a) * r0, x2: BX + Math.cos(a) * (r0 + 9), y2: head.y - 40 + Math.sin(a) * (r0 + 9), opacity: hump(q) });
      });
    }
  };
}
