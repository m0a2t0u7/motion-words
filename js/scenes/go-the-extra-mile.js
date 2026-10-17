// go the extra mile：配達はここまでの線で終わりのはずが、線を越えて玄関まで届ける。お客さんは大喜び（She always goes the extra mile for her customers.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { hp, spark } from './get-something-off-ones-chest.js';

export const meta = { duration: 4.4, beats: [[0, '荷物を運ぶ'], [1.5, '線を越える'], [3.3, '玄関で手渡し']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 232, mood: 'outdoor' });
  // 道
  el('rect', { x: 0, y: FY + 18, width: 400, height: 50, fill: '#E4E8EE' });
  for (let i = 0; i < 8; i++) el('rect', { x: 14 + i * 52, y: FY + 40, width: 26, height: 4, rx: 2, fill: '#fff' });
  // 左：倉庫の入口
  el('rect', { x: 0, y: 100, width: 70, height: FY - 100, fill: '#E9D9C4' });
  el('rect', { x: 14, y: 130, width: 44, height: FY - 130, fill: '#C9A577' });
  // 右：お客さんの家
  el('rect', { x: 310, y: 90, width: 100, height: FY - 90, fill: '#F2E7DA' });
  el('rect', { x: 306, y: 80, width: 108, height: 14, rx: 4, fill: pal.coralDark });
  el('rect', { x: 345, y: 140, width: 42, height: FY - 140, rx: 4, fill: pal.blueDark });
  el('circle', { cx: 379, cy: 190, r: 3, fill: pal.yellow });
  // 「ここまで」の線と旗
  el('rect', { x: 169, y: FY - 56, width: 4, height: 60, rx: 2, fill: pal.ink });
  el('path', { d: `M 173 ${FY - 56} L 205 ${FY - 46} L 173 ${FY - 36} Z`, fill: pal.red });
  el('line', { x1: 171, y1: FY + 6, x2: 171, y2: FY + 24, stroke: pal.red, 'stroke-width': 3, 'stroke-dasharray': '4 3' });
  // 道に点々と続く足あと印
  const dots = [0, 1, 2, 3, 4].map((i) => el('circle', { cx: 196 + i * 24, cy: FY + 10, r: 3, fill: pal.yellowDark, opacity: 0 }));
  const mint = k.buddy({ x: 50, y: FY });
  const coral = k.buddy({ x: 330, y: FY, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const box = g({});
  el('rect', { x: -15, y: -12, width: 30, height: 24, rx: 3, fill: '#D9B27C', stroke: '#B8915B', 'stroke-width': 2 }, box);
  el('rect', { x: -3, y: -12, width: 6, height: 24, fill: '#F2E7DA' }, box);
  const sp = [0, 1, 2].map((i) => spark(k, g({}), i === 1 ? pal.coral : pal.yellow));
  const xf = (t) => (t < 0.35 ? 50 : t < 3.15 ? lerp(50, 262, easeInOut(seg(t, 0.35, 3.15)) * 0.4 + seg(t, 0.35, 3.15) * 0.6) : 262);
  return {
    update(t) {
      const x = xf(t), v = Math.abs(xf(t + 0.02) - xf(t - 0.02)) / 0.04, m = Math.min(1, v / 25);
      const ph = (x - 50) * 0.107;
      const w = lerp(Math.round(ph / Math.PI) * Math.PI, ph, m);
      const give = easeOut(seg(t, 3.15, 3.5)), got = seg(t, 3.5, 3.7);
      mint.pose({ x, walk: w, lean: 3 * m, armR: lerp(78, 100, give) - 10 * Math.sin(w) * m, armL: 8 + Math.sin(w) * 18 * m, look: 0.4, mood: t < 3.2 ? 'smile' : 'grin' });
      const h = hp(mint, 1, 'R', 24);
      const joy = easeOut(seg(t, 3.3, 3.8));
      coral.pose({ armL: lerp(8, 62, joy), armR: lerp(8, 62, joy), mood: t < 3.5 ? 'smile' : 'grin', lift: 8 * hump(seg(t, 3.7, 4.2)), squash: 1 - 0.05 * hump(seg(t, 3.5, 3.7)), look: 0.4 });
      const ch = hp(coral, 1, 'L', 22);
      const bx = got > 0 ? lerp(h.x + 6, ch.x - 2, easeOut(got)) : h.x + 6, by = got > 0 ? lerp(h.y - 10, ch.y - 4, easeOut(got)) : h.y - 10;
      tf(box, bx, by, 0, 1);
      dots.forEach((d, i) => d.setAttribute('opacity', x > 196 + i * 24 - 30 ? 0.9 : 0));
      sp.forEach((s, i) => { const p = seg(t, 3.7 + i * 0.1, 4.3); tf(s.parentNode, 300 + i * 30, FY - 130 + (i % 2) * 14 - 8 * p, 0, hump(p) * 1.2); });
    }
  };
}
