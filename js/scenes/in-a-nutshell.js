// in a nutshell：長い資料の山を、くるみの殻に収まる一枚の要点カード（時計＋プラス＝もっと時間）にまとめて見せる（In a nutshell, we need more time.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, hump } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '長い資料'], [1.3, '殻に詰める'], [3.0, '要点だけ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 244, mood: 'indoor' });
  // 机
  k.shadow(220, FY + 2, 126, 6);
  const TY = 190;
  const mint = k.buddy({ x: 84, y: FY });
  const coral = k.buddy({ x: 352, y: FY, color: pal.coral, dark: pal.coralDark, facing: -1 });
  el('rect', { x: 128, y: TY, width: 190, height: 11, rx: 4, fill: pal.wood });
  el('rect', { x: 136, y: TY + 11, width: 8, height: FY - TY - 11, fill: pal.woodDark });
  el('rect', { x: 302, y: TY + 11, width: 8, height: FY - TY - 11, fill: pal.woodDark });
  // くるみの殻（半分）
  const SX = 262;
  const shell = g({});
  tf(shell, SX, TY);
  el('ellipse', { cx: 0, cy: 0, rx: 28, ry: 5, fill: pal.shadow }, shell);
  const card = g({});
  el('rect', { x: -26, y: -20, width: 52, height: 40, rx: 6, fill: '#fff', stroke: '#CBD3DF', 'stroke-width': 2 }, card);
  el('circle', { cx: -7, cy: 0, r: 11, fill: '#fff', stroke: pal.ink, 'stroke-width': 2.4 }, card);
  el('line', { x1: -7, y1: 0, x2: -7, y2: -6, stroke: pal.ink, 'stroke-width': 2.2, 'stroke-linecap': 'round' }, card);
  el('line', { x1: -7, y1: 0, x2: -2, y2: 3, stroke: pal.ink, 'stroke-width': 2.2, 'stroke-linecap': 'round' }, card);
  el('path', { d: 'M 14 -8 v 16 M 6 0 h 16', stroke: pal.green, 'stroke-width': 4, 'stroke-linecap': 'round' }, card);
  const shellG = g({});
  tf(shellG, SX, TY);
  el('path', { d: 'M -28 0 C -30 -22 -10 -30 0 -22 C 10 -30 30 -22 28 0 C 20 6 -20 6 -28 0 Z', fill: '#C79A62', stroke: '#9C7342', 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, shellG);
  el('path', { d: 'M 0 -22 C 4 -14 0 -6 0 4 M -14 -16 C -12 -10 -14 -4 -14 2 M 14 -16 C 12 -10 14 -4 14 2', stroke: '#9C7342', 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }, shellG);
  // 長い資料（束）
  const sheets = [0, 1, 2, 3, 4].map((i) => {
    const s = g({});
    el('rect', { x: -22, y: -30, width: 44, height: 60, rx: 3, fill: '#fff', stroke: '#CBD3DF', 'stroke-width': 2 }, s);
    for (let j = 0; j < 5; j++) el('line', { x1: -14, y1: -20 + j * 9, x2: 14 - (j % 2) * 6, y2: -20 + j * 9, stroke: '#CBD3DF', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, s);
    return s;
  });
  const pile = g({});
  el('rect', { x: 150, y: TY - 24, width: 50, height: 24, rx: 3, fill: '#fff', stroke: '#CBD3DF', 'stroke-width': 2 }, pile);
  return {
    update(t) {
      // 資料：机の上に重なって置かれ、1枚ずつ殻へ吸い込まれる
      sheets.forEach((s, i) => {
        const t0 = 1.3 + i * 0.25, p = seg(t, t0, t0 + 0.7);
        const sx = lerp(176 + i * 4, SX, easeInOut(p)), sy = lerp(TY - 32 - i * 3, TY - 10 - 38 * hump(p), p) ;
        tf(s, sx, sy + (p > 0 ? 0 : 0) - (p === 0 ? 0 : 0), lerp(-6 + i * 3, 25, p), lerp(1, 0.18, easeIn(p)), lerp(1, 0.18, easeIn(p)));
        s.setAttribute('opacity', p >= 1 ? 0 : 1);
      });
      pile.setAttribute('opacity', seg(t, 2.2, 2.3) > 0 ? 0 : 1);
      // 殻がぷるっと揺れ、カードが飛び出す
      const gulp = hump(seg(t, 1.4, 2.6));
      const wob = Math.sin(t * 40) * 2 * gulp;
      tf(shellG, SX + wob * 0.3, TY, wob, 1 + 0.04 * gulp, 1 - 0.04 * gulp);
      const pop = seg(t, 2.6, 3.3);
      const cy = lerp(TY - 6, TY - 74, backOut(pop));
      tf(card, SX, cy, 0, pop > 0 ? lerp(0.5, 1.15, backOut(pop)) : 0.001);
      card.setAttribute('opacity', pop > 0 ? 1 : 0);
      // 話し手：資料を指して、最後にカードを指す
      const talk = hump(seg(t, 0.2, 1.4));
      const pt = easeOut(seg(t, 2.9, 3.4));
      mint.pose({
        armR: lerp(8, 70, talk) + (pt > 0 ? lerp(0, 22, pt) : 0) - 70 * hump(seg(t, 0, 0)), armL: 8,
        lean: 2 * talk, look: 0.6, mood: t < 2.6 ? (Math.sin(t * 12) > 0 ? 'open' : 'smile') : 'smile', blink: 0
      });
      const nod = t > 3.2 ? 3 * Math.sin((t - 3.2) * 9) : 0;
      coral.pose({ lean: nod, look: 0.5, mood: t > 3.0 ? 'smile' : 'flat', armL: lerp(8, 12, 1), squash: 1 - 0.015 * Math.abs(nod) });
    }
  };
}
