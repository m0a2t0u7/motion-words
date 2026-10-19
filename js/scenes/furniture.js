// furniture：2人で新しいソファを運び入れ、値札付きの家具がそろった部屋になる（例文 We bought new furniture for the room.）
// このファイルは家の中のシーン共通ヘルパーも書き出す（homeBg / priceTag / sofaProp / lamp / sparkle）
import { seg, lerp, easeInOut, easeOut, wobble, hump, clamp } from '../ease.js';
import { hp } from './dig.js';
import { gait } from './weigh.js';
import { P, blinkAt } from './run-after.js';
export { hp, gait, P, blinkAt };

// 室内の背景（壁・腰板・カーテン付きの窓）。戻り値は床の y
export function homeBg(k, { FY = 236, winX = 30, winW = 84, winY = 44, winH = 70, wall = '#F6F1EA', curtain = '#F4C7B5', sky = '#DDEFFA', mood = 'indoor' } = {}) {
  const { el, pal } = k;
  k.backdrop({ floorY: FY, mood });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: wall });
  el('rect', { x: 0, y: FY - 10, width: 400, height: 10, fill: '#EADFD0' });
  el('rect', { x: 0, y: FY + 2, width: 400, height: 300 - FY, fill: '#E9DCCB' });
  for (let x = 30; x < 400; x += 70) el('line', { x1: x, y1: FY + 2, x2: x - 14, y2: 300, stroke: '#DCCDB9', 'stroke-width': 1.5 });
  if (winW > 0) {
    el('rect', { x: winX, y: winY, width: winW, height: winH, rx: 5, fill: sky, stroke: '#fff', 'stroke-width': 5 });
    el('line', { x1: winX + winW / 2, y1: winY, x2: winX + winW / 2, y2: winY + winH, stroke: '#fff', 'stroke-width': 4 });
    if (curtain) {
      el('rect', { x: winX - 14, y: winY - 10, width: winW + 28, height: 5, rx: 2, fill: pal.woodDark });
      el('path', { d: `M ${winX - 12} ${winY - 6} h 16 q -4 ${winH / 2} 2 ${winH + 10} h -18 Z`, fill: curtain });
      el('path', { d: `M ${winX + winW + 12} ${winY - 6} h -16 q 4 ${winH / 2} -2 ${winH + 10} h 18 Z`, fill: curtain });
    }
  }
  return FY;
}
// 値札（原点＝ひもの付け根）
export function priceTag(k, parent, color = '#FFE08A') {
  const g = k.g({}, parent);
  k.el('path', { d: 'M 0 0 q 3 6 7 9', fill: 'none', stroke: k.pal.sub, 'stroke-width': 1.2 }, g);
  k.el('path', { d: 'M 5 8 L 13 6 L 22 14 L 15 22 L 6 15 Z', fill: color, stroke: k.pal.yellowDark, 'stroke-width': 1.4, 'stroke-linejoin': 'round' }, g);
  k.el('circle', { cx: 9.5, cy: 10, r: 1.6, fill: '#fff' }, g);
  return g;
}
// 横から見たソファ（原点＝底の中央、右向き）
export function sofaProp(k, parent, w = 120, col = '#7FB3E8', dark = '#5C93CF') {
  const g = k.g({}, parent), { el } = k;
  el('rect', { x: -w / 2, y: -58, width: w, height: 34, rx: 12, fill: dark }, g);
  el('rect', { x: -w / 2 + 4, y: -34, width: w - 8, height: 24, rx: 8, fill: col }, g);
  el('rect', { x: -w / 2 - 6, y: -40, width: 18, height: 34, rx: 8, fill: col }, g);
  el('rect', { x: w / 2 - 12, y: -40, width: 18, height: 34, rx: 8, fill: col }, g);
  el('line', { x1: 0, y1: -32, x2: 0, y2: -12, stroke: dark, 'stroke-width': 2, opacity: 0.6 }, g);
  el('rect', { x: -w / 2 + 2, y: -10, width: 7, height: 10, fill: k.pal.woodDark }, g);
  el('rect', { x: w / 2 - 9, y: -10, width: 7, height: 10, fill: k.pal.woodDark }, g);
  return g;
}
// スタンドライト付きの小さな台（原点＝床）
export function lampTable(k, x, FY) {
  const { el, pal } = k, g = k.g({});
  k.shadow(x, FY + 1, 26, 4, g);
  el('rect', { x: x - 22, y: FY - 44, width: 44, height: 6, rx: 2, fill: pal.wood }, g);
  el('rect', { x: x - 18, y: FY - 38, width: 5, height: 38, fill: pal.woodDark }, g);
  el('rect', { x: x + 13, y: FY - 38, width: 5, height: 38, fill: pal.woodDark }, g);
  el('rect', { x: x - 2, y: FY - 76, width: 4, height: 32, fill: pal.sub }, g);
  el('path', { d: `M ${x - 16} ${FY - 76} L ${x - 10} ${FY - 100} L ${x + 10} ${FY - 100} L ${x + 16} ${FY - 76} Z`, fill: '#FFE7A8', stroke: pal.yellowDark, 'stroke-width': 1.5 }, g);
  return g;
}
// きらきら（新品の印）
export function sparkle(k, parent) {
  return k.el('path', { d: 'M 0 -8 Q 1 -1 8 0 Q 1 1 0 8 Q -1 1 -8 0 Q -1 -1 0 -8 Z', fill: k.pal.yellow }, parent);
}

export const meta = { duration: 4.4, beats: [[0, '新しい家具'], [1.2, '運び入れる'], [3.4, '部屋がそろった']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.82;
  const FY = homeBg(k, { winX: 160, winW: 90 });
  el('ellipse', { cx: 230, cy: FY + 26, rx: 120, ry: 14, fill: '#D9C6E8', opacity: 0.8 });
  // すでに運び入れた家具（値札付き）
  lampTable(k, 352, FY);
  tf(priceTag(k), 334, FY - 44);
  const sofa = g({}), sb = g({}, sofa);
  const ssh = k.shadow(0, 0, 80, 6, sofa);
  tf(sofaProp(k, sb, 130), 0, 0, 0, 1.15);
  const tg = priceTag(k, sb); tf(tg, 52, -62);
  const mint = k.buddy({ x: -40, y: FY, scale: S });
  const coral = k.buddy({ x: 100, y: FY, scale: S, color: pal.coral, dark: pal.coralDark });
  sofa.parentNode.appendChild(sofa); // 2人の前にソファ
  const sp = [0, 1, 2].map(() => sparkle(k));
  const xf = (t) => lerp(-60, 205, easeInOut(seg(t, 0.2, 2.6)));
  return {
    update(t) {
      const x = xf(t), w = gait(xf, t, -60, 0, 0.13);
      const down = easeInOut(seg(t, 2.7, 3.3));
      const lift = 22 * (1 - down) * clamp(seg(t, 0, 0.2) * 5) - 2 * Math.abs(Math.sin(w.walk)) * (1 - down);
      const land = wobble(seg(t, 3.3, 3.9), 2.5, 6);
      tf(sofa, x, FY - lift);
      tf(sb, 0, 0, 0, 1 + 0.03 * land, 1 - 0.04 * land);
      tf(ssh, 0, lift, 0, 1 - lift / 90, 1);
      const back = easeOut(seg(t, 3.5, 4.1));
      const arm = lerp(62, 8, back) + 10 * down * (1 - back);
      P(mint, { x: x - 92 - 8 * back, walk: w.walk, armL: -30 * (1 - back) + 8 * back, armR: arm, lean: 6 * (1 - back) + 10 * down * (1 - back), squash: 1 - 0.05 * down * (1 - back), look: 0.6, mood: t > 3.4 ? 'grin' : 'smile', blink: blinkAt(t) });
      P(coral, { x: x + 92 + 10 * back, facing: -1, walk: w.walk + Math.PI, armL: -30 * (1 - back) + 8 * back, armR: arm, lean: 4 * (1 - back) + 10 * down * (1 - back), squash: 1 - 0.05 * down * (1 - back), look: back > 0.5 ? 0.6 : -0.2, mood: t > 3.4 ? 'grin' : 'open', blink: blinkAt(t, 1) });
      sp.forEach((s, i) => {
        const q = seg(t, 3.5 + i * 0.15, 4.3);
        tf(s, [150, 250, 352][i], [FY - 84, FY - 76, FY - 112][i], 45 * q, hump(q) + 0.001);
      });
    }
  };
}
