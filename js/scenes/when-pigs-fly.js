// when pigs fly：散らかった部屋。片づける？ ありえない＝豚が空を飛ぶくらい（He'll clean his room when pigs fly.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, '散らかった部屋'], [1.4, '豚が飛ぶ想像'], [3.0, 'ありえない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  // 散らかった服の山
  const pile = g({});
  [['#FF8E77', -30, -4, -14], ['#6AA8F7', 4, -9, 10], ['#FFCF5C', 30, -3, 20], ['#A58BF3', -8, -22, -28], ['#5FCDB8', 16, -24, 24]].forEach(([c, x, y, r]) =>
    el('rect', { x: -22, y: -9, width: 44, height: 18, rx: 8, fill: c, transform: 'translate(' + x + ' ' + y + ') rotate(' + r + ')' }, pile));
  el('circle', { cx: 40, cy: -18, r: 6, fill: '#FFFFFF', stroke: pal.line, 'stroke-width': 2 }, pile);
  tf(pile, 90, FY - 8, 0, 1.2, 1.2);
  k.shadow(90, FY, 56, 6);
  const b = k.buddy({ x: 190, y: FY, scale: 1.0 });
  // 考え吹き出し
  const bub = g({});
  el('circle', { cx: -78, cy: 62, r: 4, fill: '#fff', stroke: '#CBD3DE', 'stroke-width': 2 }, bub);
  el('circle', { cx: -66, cy: 44, r: 7, fill: '#fff', stroke: '#CBD3DE', 'stroke-width': 2 }, bub);
  el('ellipse', { cx: 0, cy: 0, rx: 100, ry: 54, fill: '#E8F4FC', stroke: '#CBD3DE', 'stroke-width': 2.5 }, bub);
  const cl = clouds(el, bub);
  const pig = g({}, bub);
  const wingB = g({}, pig); const wingF = g({}, pig);
  [wingB, wingF].forEach((w) => el('path', { d: 'M -2 -10 Q -8 -36 -30 -30 Q -20 -22 -24 -12 Q -12 -16 -2 -10 Z', fill: '#fff', stroke: '#CBD3DE', 'stroke-width': 1.6 }, w));
  el('path', { d: 'M -17 -3 q -9 -4 -4 -10 q 5 -3 4 4', fill: 'none', stroke: '#F29AAE', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, pig);
  el('ellipse', { cx: 0, cy: 0, rx: 18, ry: 13, fill: '#FFB6C6' }, pig);
  [[-8, 13], [8, 13]].forEach(([x, y]) => el('rect', { x: x - 3, y: y - 4, width: 6, height: 8, rx: 3, fill: '#F29AAE' }, pig));
  el('circle', { cx: 17, cy: -4, r: 10, fill: '#FFB6C6' }, pig);
  el('path', { d: 'M 14 -13 L 11 -22 L 20 -15 Z', fill: '#F29AAE' }, pig);
  el('ellipse', { cx: 25, cy: -2, rx: 5, ry: 4, fill: '#F29AAE' }, pig);
  el('circle', { cx: 15, cy: -7, r: 1.8, fill: pal.ink }, pig);
  el('circle', { cx: 24, cy: -2, r: 1, fill: pal.ink }, pig);

  return {
    update(t) {
      const bp = backOut(seg(t, 1.0, 1.5), 1.4);
      tf(bub, 270, 88, 0, bp, bp);
      bub.setAttribute('opacity', t < 1.0 ? 0 : 1);
      const p = seg(t, 1.5, 3.4);
      const x = lerp(-48, 48, easeInOut(p));
      const flap = Math.sin(t * 16);
      tf(pig, x, -4 + Math.sin(t * 3) * 5, -6, 1, 1);
      tf(wingB, 0, 0, 0, 1, 0.75 + 0.45 * flap);
      tf(wingF, -4, 2, 0, 1, 0.75 - 0.45 * flap);
      cl.forEach((c, i) => tf(c, ((i * 80 + 70 - t * 30) % 140 + 140) % 140 - 70, -26 + i * 30));
      const sh = easeOut(seg(t, 2.8, 3.3));
      b.pose({
        armL: lerp(8, 70, sh), armR: lerp(8, 70, sh),
        lean: lerp(0, -4, sh), squash: 1 - 0.03 * sh,
        look: lerp(-0.2, 0.7, seg(t, 0.9, 1.6)),
        mood: t < 1.0 ? 'flat' : t < 2.8 ? 'open' : 'flat'
      });
    }
  };
}

function clouds(el, parent) {
  return [0, 1].map((i) => {
    const c = el('g', {}, parent);
    el('ellipse', { rx: 18, ry: 6, fill: '#fff' }, c);
    el('ellipse', { cx: 8, cy: -4, rx: 10, ry: 6, fill: '#fff' }, c);
    return c;
  });
}
