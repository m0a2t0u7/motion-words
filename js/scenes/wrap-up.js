// wrap up：箱を青い包装紙でくるみ、リボンをかけてプレゼントにする（例文 I wrapped up the gift in blue paper.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, '箱だけ'], [1.3, '紙でくるむ'], [2.8, 'リボンで完成']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 250, mood: 'indoor' });
  // 机
  el('rect', { x: 90, y: 214, width: 280, height: 14, rx: 5, fill: pal.wood });
  el('rect', { x: 104, y: 228, width: 10, height: 22, fill: pal.woodDark });
  el('rect', { x: 346, y: 228, width: 10, height: 22, fill: pal.woodDark });
  const b = k.buddy({ x: 60, y: FY, scale: 1.0 });
  const BX = 260, BY = 214, BW = 100, BH = 70;
  // 箱
  const box = el('rect', { x: BX - BW / 2, y: BY - BH, width: BW, height: BH, rx: 4, fill: '#D9B98A' });
  el('line', { x1: BX - BW / 2, y1: BY - BH + 10, x2: BX + BW / 2, y2: BY - BH + 10, stroke: '#C4A070', 'stroke-width': 3 });
  // 包装紙：左から右へ覆っていく
  const cp = k.clip((c) => el('rect', { x: BX - BW / 2 - 4, y: BY - BH - 4, width: BW + 8, height: BH + 8 }, c));
  const paperG = g({ 'clip-path': cp });
  const paper = el('rect', { x: BX - BW / 2 - 4, y: BY - BH - 4, width: 0, height: BH + 8, rx: 5, fill: pal.blue }, paperG);
  const fold = el('path', { d: '', fill: pal.blueDark });
  const dots = [[0.2, 0.3], [0.5, 0.6], [0.75, 0.25], [0.35, 0.8], [0.9, 0.7]].map(([u, v]) => el('circle', { cx: BX - BW / 2 + u * BW, cy: BY - BH + v * BH, r: 3, fill: '#fff', opacity: 0 }, paperG));
  // リボン
  const rib = g({});
  el('rect', { x: BX - 6, y: BY - BH - 4, width: 12, height: BH + 4, fill: pal.yellow }, rib);
  el('rect', { x: BX - BW / 2 - 4, y: BY - BH / 2 - 6, width: BW + 8, height: 12, fill: pal.yellow }, rib);
  const bow = g({});
  el('path', { d: 'M 0 0 Q -30 -26 -24 -4 Q -20 8 0 0 Q 30 -26 24 -4 Q 20 8 0 0', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, bow);
  el('circle', { r: 5, fill: pal.yellowDark }, bow);
  const sp = [0, 1, 2].map(() => el('path', { d: 'M 0 -8 L 2 -2 L 8 0 L 2 2 L 0 8 L -2 2 L -8 0 L -2 -2 Z', fill: pal.yellow }));
  return {
    update(t) {
      const cover = easeInOut(seg(t, 1.0, 2.4));
      paper.setAttribute('width', (BW + 8) * cover);
      const r = seg(t, 2.5, 3.0);
      rib.setAttribute('opacity', 1);
      rib.setAttribute('transform', `translate(0 0)`);
      rib.setAttribute('opacity', r > 0 ? 1 : 0);
      // リボンは縦横の線が伸びる
      rib.setAttribute('clip-path', '');
      tf(bow, BX, BY - BH - 4, 0, backOut(seg(t, 3.0, 3.4), 2), backOut(seg(t, 3.0, 3.4), 2));
      bow.setAttribute('opacity', t > 3.0 ? 1 : 0);
      dots.forEach((d) => d.setAttribute('opacity', cover > 0.9 ? 1 : 0));
      // まめが手を添える
      const hx = BX - BW / 2 + (BW + 8) * cover - 4;
      const sx = 60 + 27, sy = FY - 56;
      const a = Math.atan2(hx - sx + 6, (BY - BH / 2) - sy) * 180 / Math.PI;
      const act = t > 0.9 && t < 2.6;
      b.pose({ armR: act ? Math.min(a, 100) : r > 0 ? 100 : 8, armL: 8, x: 60 + (act ? 0 : 0) + 70 * easeOut(seg(t, 0.4, 1.0)), lean: act ? 8 : 0, look: 0.9, mood: t > 3.0 ? 'grin' : 'smile', squash: 1 - 0.02 * Math.sin(t * 8) * (act ? 1 : 0) });
      sp.forEach((s, i) => { const p = seg(t, 3.3 + i * 0.1, 3.9 + i * 0.1); tf(s, BX + (i - 1) * 56, BY - BH - 20 - 10 * p, 0, Math.sin(p * Math.PI) * 1.1, Math.sin(p * Math.PI) * 1.1); });
    }
  };
}
