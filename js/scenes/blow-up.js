// blow up：まめが息を吹き込んで風船をふくらませ、パーティー用の風船が10個そろう（例文 He blew up ten balloons for the party.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, clamp } from '../ease.js';
import { reach } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, 'しぼんだ風船'], [1.6, '息でふくらます'], [3.6, '10個できた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  // 飾りの旗（静止）
  el('path', { d: 'M 0 30 Q 200 70 400 30', stroke: pal.sub, 'stroke-width': 1.5, fill: 'none' });
  [40, 100, 160, 220, 280, 340].forEach((x, i) => el('path', { d: `M ${x - 10} ${36 + Math.sin(x / 400 * Math.PI) * 18} l 20 0 l -10 18 Z`, fill: [pal.coral, pal.yellow, pal.blue][i % 3] }));
  const C = [pal.red, pal.yellow, pal.blue, pal.violet, pal.green, pal.coral, pal.blueDark, pal.yellowDark, pal.mint];
  // すでにふくらませた9個（右側の床に結んである）
  const done = C.map((c, i) => {
    const x = 250 + (i % 5) * 28 + (i > 4 ? 14 : 0), y = i > 4 ? 120 : 92;
    const n = g({});
    el('path', { d: `M 0 14 Q ${(i % 2 ? 6 : -6)} ${(FY - y) / 2} 0 ${FY - y - 4}`, stroke: pal.sub, 'stroke-width': 1.2, fill: 'none' }, n);
    el('ellipse', { cx: 0, cy: 0, rx: 12, ry: 15, fill: c }, n);
    el('ellipse', { cx: -4, cy: -5, rx: 3, ry: 5, fill: '#fff', opacity: 0.4 }, n);
    tf(n, x, y);
    return { n, x, y };
  });
  el('rect', { x: 240, y: FY - 6, width: 150, height: 6, rx: 3, fill: pal.woodDark });
  const B = k.buddy({ x: 120, y: FY, scale: 0.95 });
  // ふくらませ中の風船（原点＝吹き口）
  const bal = g({});
  const skin = el('ellipse', { cx: 0, cy: -16, rx: 6, ry: 14, fill: pal.red }, bal);
  const shine = el('ellipse', { cx: -3, cy: -20, rx: 2, ry: 4, fill: '#fff', opacity: 0.4 }, bal);
  el('path', { d: 'M -3 0 L 3 0 L 2 -4 L -2 -4 Z', fill: pal.red }, bal);
  const cnt = k.text(320, 196, '10', { 'font-size': 22, fill: pal.ink, opacity: 0 });
  const mouth = { x: 120 + 0.95 * 6, y: FY - 0.95 * 52 };
  return {
    update(t) {
      // 3回息を吹き込む（吸う→吹く）
      let size = 0, sq = 1;
      [0.6, 1.4, 2.2].forEach((s, i) => { const u = seg(t, s, s + 0.6); sq += 0.05 * Math.sin(seg(t, s - 0.3, s) * Math.PI) - 0.05 * Math.sin(u * Math.PI); size += easeOut(u) / 3; });
      const tie = seg(t, 3.0, 3.6);
      const r = lerp(0.35, 1, size);
      k.set(skin, { rx: 13 * r * (1 + 0.04 * Math.sin(t * 20) * (size < 1 ? 1 : 0)), ry: 16 * r, cy: -16 * r - 2 });
      k.set(shine, { cx: -4 * r, cy: -20 * r, rx: 3 * r, ry: 5 * r });
      // 吹き口は口元→結んだあと右の束へ
      const bx = lerp(mouth.x + 16, 334, easeInOut(tie)), by = lerp(mouth.y, 120, easeInOut(tie)) - 30 * Math.sin(tie * Math.PI);
      tf(bal, bx, by, lerp(80, 180, easeInOut(tie)) + (tie > 0 ? 3 * wobble(seg(t, 3.6, 4.2), 2, 5) : 0));
      const aim = reach(B, 0.95, 'R', bx, by);
      B.pose({ armR: tie < 1 ? aim : lerp(aim, 12, seg(t, 3.6, 3.9)), armL: tie > 0 ? 12 : reach(B, 0.95, 'L', bx - 4, by + 4), squash: sq, mood: tie > 0.4 ? 'grin' : 'open', look: 0.7, lean: 2 });
      done.forEach((d, i) => tf(d.n, d.x, d.y + 2 * Math.sin(t * 2 + i)));
      cnt.setAttribute('opacity', seg(t, 3.7, 4.0));
    }
  };
}
