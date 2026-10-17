// dress up：ふだん着のまめが、蝶ネクタイと帽子でおめかししてパーティーへ（例文 We dressed up for the party.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 3.8, beats: [[0, 'ふだん着'], [1.2, '着飾る'], [2.6, 'おめかし完了']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 244, mood: 'indoor' });
  // パーティー飾り
  const ban = el('path', { d: 'M 20 40 Q 200 100 380 40', fill: 'none', stroke: pal.yellowDark, 'stroke-width': 3 });
  [[60, 52, pal.coral], [110, 66, pal.blue], [160, 76, pal.yellow], [200, 79, pal.green], [240, 76, pal.violet], [290, 66, pal.coral], [340, 52, pal.blue]].forEach(([x, y, c]) => el('path', { d: `M ${x - 9} ${y} L ${x + 9} ${y} L ${x} ${y + 20} Z`, fill: c }));
  const balloons = [[40, pal.coral], [366, pal.blue]].map(([x, c]) => {
    const bl = g({});
    el('ellipse', { cx: 0, cy: 0, rx: 16, ry: 20, fill: c }, bl);
    el('path', { d: 'M 0 20 q -6 24 4 50', fill: 'none', stroke: pal.sub, 'stroke-width': 2 }, bl);
    return [bl, x];
  });
  const b = k.buddy({ x: 200, y: FY, scale: 1.15 });
  // 小物：蝶ネクタイ・帽子
  const bow = g({});
  el('path', { d: 'M 0 0 L -14 -9 L -14 9 Z M 0 0 L 14 -9 L 14 9 Z', fill: pal.red, stroke: '#C9483C', 'stroke-width': 2, 'stroke-linejoin': 'round' }, bow);
  el('circle', { r: 4, fill: '#C9483C' }, bow);
  const hat = g({});
  el('rect', { x: -22, y: -4, width: 44, height: 6, rx: 3, fill: pal.ink }, hat);
  el('rect', { x: -14, y: -30, width: 28, height: 28, rx: 3, fill: pal.ink }, hat);
  el('rect', { x: -14, y: -10, width: 28, height: 5, fill: pal.red }, hat);
  const sparks = [0, 1, 2, 3, 4].map((i) => el('path', { d: 'M 0 -8 L 2 -2 L 8 0 L 2 2 L 0 8 L -2 2 L -8 0 L -2 -2 Z', fill: pal.yellow }));
  return {
    update(t) {
      balloons.forEach(([bl, x], i) => tf(bl, x, 120 + 4 * Math.sin(t * 2 + i), 4 * Math.sin(t * 1.5 + i)));
      const p1 = seg(t, 1.1, 1.5), p2 = seg(t, 1.5, 1.9);
      const spin = easeInOut(seg(t, 1.2, 2.2));
      const f = Math.cos(spin * Math.PI * 2);
      b.pose({
        facing: Math.abs(f) < 0.01 ? 0.01 : f,
        armL: lerp(8, 50, hump(seg(t, 1.2, 2.2))) + (t > 2.5 ? 30 : 0),
        armR: lerp(8, 50, hump(seg(t, 1.2, 2.2))) + (t > 2.5 ? 30 : 0),
        squash: 1 - 0.03 * wobble(seg(t, 2.2, 3.2), 2, 4), lift: 14 * hump(seg(t, 1.2, 2.2)),
        mood: t > 2.2 ? 'grin' : 'smile'
      });
      const lift = 14 * hump(seg(t, 1.2, 2.2));
      const sB = backOut(p1, 2) , sH = backOut(p2, 2);
      tf(bow, 200, 244 - 10 - 40 * 1.15 - lift, 0, sB * 1.1, sB * 1.1);
      bow.setAttribute('opacity', p1 > 0 ? 1 : 0);
      tf(hat, 200 + 4, 244 - 10 - 80 * 1.15 - lift + 8, 8, sH * 1.1, sH * 1.1);
      hat.setAttribute('opacity', p2 > 0 ? 1 : 0);
      sparks.forEach((s, i) => {
        const a = (i / 5) * Math.PI * 2 + 0.5, p = seg(t, 2.0 + i * 0.07, 2.6 + i * 0.07);
        tf(s, 200 + Math.cos(a) * (70 + 10 * p), 160 + Math.sin(a) * (60 + 8 * p), 0, hump(p) * 1.2, hump(p) * 1.2);
      });
    }
  };
}
