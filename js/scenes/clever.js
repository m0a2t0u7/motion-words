// clever：女の子のまめが、パズルのピースを次々と素早く正しい場所へはめ、電球がひらめく（例文 She is a clever girl who learns quickly.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, hp, aim, person, homeBg, bulb, star } from './confused.js';

export const meta = { duration: 4.2, beats: [[0, 'パズル'], [0.8, 'すばやくはめる'], [3.0, 'ひらめき！']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const FY = homeBg(k, { winX: 300 });
  // 机の上に立てたパズル盤
  const top = FY - 46;
  k.shadow(200, FY + 1, 90, 5);
  el('rect', { x: 110, y: top, width: 180, height: 8, rx: 3, fill: pal.wood });
  [118, 274].forEach((x) => el('rect', { x, y: top + 8, width: 8, height: 38, fill: pal.woodDark }));
  const BX = 210, BY = top - 74;
  el('rect', { x: BX - 4, y: BY - 4, width: 76, height: 76, rx: 4, fill: pal.woodDark });
  el('rect', { x: BX + 2, y: BY + 2, width: 64, height: 64, fill: '#F6EFE2' });
  const C = [pal.blue, pal.coral, pal.yellow, pal.violet];
  const slots = [[0, 0], [1, 0], [0, 1], [1, 1]].map(([i, j]) => ({ x: BX + 2 + i * 32 + 16, y: BY + 2 + j * 32 + 16 }));
  slots.forEach((s, i) => el('rect', { x: s.x - 14, y: s.y - 14, width: 28, height: 28, rx: 3, fill: 'none', stroke: C[i], 'stroke-width': 2, 'stroke-dasharray': '4 3' }));
  const pcs = C.map((c) => { const n = g({}); el('rect', { x: -14, y: -14, width: 28, height: 28, rx: 3, fill: c }, n); el('circle', { cx: 14, cy: 0, r: 5, fill: c }, n); return n; });
  const pile = [[134, top - 6], [150, top - 8], [166, top - 6], [182, top - 8]];
  const b = k.buddy({ x: 150, y: FY, scale: S });
  // 髪のリボン
  const rib = el('path', { d: 'M 0 0 L -10 -7 L -10 7 Z M 0 0 L 10 -7 L 10 7 Z', fill: pal.red });
  const bl = bulb(k), sp = [0, 1, 2].map(() => star(k, undefined, 7));
  return {
    update(t) {
      // 1ピース 0.5 秒：つかむ→盤へ運ぶ→はめる
      const T = (i) => 0.6 + i * 0.55;
      let i = Math.floor((t - 0.6) / 0.55); i = Math.max(-1, Math.min(4, i));
      let tx = 150, ty = top - 10;
      P(b, { x: 150, look: 0.8, lean: 6, armL: 20, mood: t > 2.9 ? 'grin' : 'smile', blink: blinkAt(t) });
      pcs.forEach((p, j) => {
        const q = seg(t, T(j), T(j) + 0.45), e = easeInOut(q);
        const x = lerp(pile[j][0], slots[j].x, e), y = lerp(pile[j][1], slots[j].y, e) - 30 * hump(q);
        if (q > 0 && q < 1) { tx = x; ty = y; }
        tf(p, x, y, lerp(20 * (j % 2 ? -1 : 1), 0, e), q >= 1 ? 1 + 0.12 * hump(seg(t, T(j) + 0.45, T(j) + 0.6)) : lerp(0.55, 1, e));
      });
      if (t > 0.5 && t < T(3) + 0.45) aim(b, S, 'R', tx, ty); else b.pose({ armR: t > 2.9 ? lerp(30, 150, easeOut(seg(t, 2.9, 3.2))) : 30 });
      const h = { x: b.state.x, y: FY - 92 };
      tf(rib, h.x - 18, h.y + 4, -20, 1);
      const pop = seg(t, 2.9, 3.2);
      tf(bl, 150, FY - 128 - 6 * pop, 0, pop > 0 ? 1.6 * easeOut(pop) : 0.001);
      sp.forEach((s, j) => { const q = seg(t, 3.0 + j * 0.1, 3.6 + j * 0.1); tf(s, 150 + Math.cos(j * 2.1) * 34 * q, FY - 130 + Math.sin(j * 2.1) * 26 * q, 0, q > 0 ? hump(q) * 1.4 : 0.001); });
    }
  };
}
