// come across：棚の箱を片づけていたら、古い写真がふと出てきて見入る（例文 I came across an old photo while cleaning.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { hp } from './dig.js';
import { pop } from './queue-up.js';
import { tableTop } from './spread-out.js';

export const meta = { duration: 4.4, beats: [[0, '片づけ中'], [1.8, '写真が出てきた'], [3.8, '見入る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 300, y: 46, width: 70, height: 60, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 4 });
  const S = 1.15;
  const b = k.buddy({ x: 140, y: FY, scale: S });
  const T = tableTop(k, 160, 390, 190, 20);
  // 箱（中身）
  el('rect', { x: 230, y: 160, width: 76, height: 36, rx: 3, fill: '#E2B680', stroke: '#C9975C', 'stroke-width': 2 });
  [[240, 148, 16, pal.blue], [258, 152, 12, pal.green], [286, 146, 14, pal.coral]].forEach(([x, y, w, c]) => el('rect', { x, y, width: w, height: 196 - y - 36 + 12, rx: 2, fill: c }));
  el('rect', { x: 230, y: 160, width: 76, height: 36, rx: 3, fill: '#E2B680' });
  // ぞうきん
  const rag = g({});
  el('path', { d: 'M -10 -6 Q 0 -10 10 -6 L 8 6 Q 0 9 -8 6 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 }, rag);
  // 写真
  const ph = g({});
  el('rect', { x: -18, y: -14, width: 36, height: 28, rx: 2, fill: '#F5ECD9', stroke: '#C8B48E', 'stroke-width': 2 }, ph);
  el('rect', { x: -14, y: -10, width: 28, height: 18, fill: '#D8C39A' }, ph);
  el('circle', { cx: -5, cy: 0, r: 4, fill: '#9C7D52' }, ph); el('circle', { cx: 6, cy: 1, r: 3.4, fill: '#9C7D52' }, ph);
  el('rect', { x: -9, y: 3, width: 8, height: 6, rx: 3, fill: '#9C7D52' }, ph); el('rect', { x: 3, y: 4, width: 7, height: 5, rx: 3, fill: '#9C7D52' }, ph);
  const bang = g({});
  el('rect', { x: -3, y: -16, width: 6, height: 16, rx: 3, fill: pal.red }, bang); el('circle', { cy: 6, r: 3.5, fill: pal.red }, bang);
  return {
    update(t) {
      // 0〜1.6：ぞうきんで箱の縁をふく → 箱から写真をつまみ上げる → 顔の前で見る
      const wipe = t < 1.5 ? Math.sin(t * 9) : 0;
      const pick = easeOut(seg(t, 1.7, 2.1)), lift = easeInOut(seg(t, 2.1, 2.8));
      const armR = t < 1.6 ? 70 + 10 * wipe : lerp(lerp(70, 76, pick), 118, lift);
      b.pose({ armR, armL: 10 + 15 * lift, lean: t < 1.6 ? 8 : lerp(8, -2, lift), look: 0.6, mood: t > 1.9 ? 'open' : 'flat', squash: 1 - 0.04 * hump(seg(t, 1.9, 2.2)) });
      const h = hp(b, S, 'R');
      tf(rag, h.x, h.y + 4, wipe * 8); rag.setAttribute('opacity', t < 1.6 ? 1 : 0);
      const inBox = { x: 268, y: 168 };
      let p = inBox;
      if (t > 1.9) p = { x: lerp(inBox.x, h.x + 6, easeOut(seg(t, 1.9, 2.2))), y: lerp(inBox.y, h.y - 14, easeOut(seg(t, 1.9, 2.2))) };
      tf(ph, p.x, p.y, lerp(-10, 6, lift) + 3 * wobble(seg(t, 2.8, 3.6), 1.5, 4), lerp(0.8, 1.2, lift));
      ph.setAttribute('opacity', t < 1.8 ? 0 : 1);
      const bp = pop(seg(t, 1.9, 2.3));
      bang.setAttribute('opacity', t > 1.9 && t < 3.2 ? 1 : 0);
      tf(bang, 150, FY - 122, 0, Math.max(0.001, bp));
      void T;
    }
  };
}
