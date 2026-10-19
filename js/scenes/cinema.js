// cinema：暗い映画館に、ポップコーンを持って入る。見回すと席はほとんど空っぽ（例文 The cinema was almost empty.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { hp, held, reach, P, blinkAt } from './restaurant.js';
import { gait } from './dig.js';
import { seatHead } from './theater.js';

// ポップコーンの容器（原点＝底の中央）
export function popcorn(k, parent) {
  const g = k.g({}, parent), pal = k.pal;
  [[-7, -24], [0, -27], [7, -24], [-3, -29], [4, -30]].forEach(([x, y]) => k.el('circle', { cx: x, cy: y, r: 5, fill: '#FFF4D6' }, g));
  k.el('path', { d: 'M -11 -22 H 11 L 8 0 H -8 Z', fill: '#fff' }, g);
  [-6, 0, 6].forEach((x) => k.el('path', { d: `M ${x - 1.6} -22 H ${x + 1.6} L ${x * 0.75 + 1.2} 0 H ${x * 0.75 - 1.2} Z`, fill: pal.red }, g));
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '映画館に入る'], [1.6, '見回す'], [3.0, 'ほとんど空']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 222;
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#1F2433' });
  // スクリーン（光がゆらぐ）
  const scr = el('rect', { x: 60, y: 22, width: 280, height: 92, rx: 4, fill: '#BFD9F2' });
  el('path', { d: 'M 80 100 Q 140 60 200 90 T 320 70 V 114 H 80 Z', fill: '#9DC3E6', opacity: 0.7 });
  const beam = el('path', { d: 'M 200 300 L 60 114 H 340 Z', fill: '#BFD9F2', opacity: 0.05 });
  // 段になった客席：3列すべて空席、遠くに1人だけ
  const rowY = [132, 170, 208];
  rowY.forEach((y, r) => {
    el('rect', { x: 0, y: y + 30, width: 400, height: 8, fill: '#2C3346' });
    for (let x = 22 + (r % 2) * 14; x < 400; x += 46) { el('rect', { x: x - 18, y, width: 36, height: 34, rx: 8, fill: '#B5473F' }); el('rect', { x: x - 18, y, width: 36, height: 6, rx: 3, fill: '#93372F' }); }
  });
  const other = seatHead(k, pal.violet); tf(other, 356, 136, 0, 0.55);
  el('rect', { x: 338, y: 132, width: 36, height: 34, rx: 8, fill: '#B5473F', opacity: 0 });
  // 通路（右から入る）
  el('rect', { x: 0, y: FY + 24, width: 400, height: 54, fill: '#2C3346' });
  const b = k.buddy({ x: 430, y: FY + 50, scale: 1, facing: -1 });
  const pc = popcorn(k);
  const xf = (t) => lerp(430, 210, easeInOut(seg(t, 0, 1.5)));
  return {
    update(t) {
      const gt = gait(xf, t, 430);
      const look = t < 1.6 ? 0 : t < 2.4 ? Math.sin((t - 1.6) / 0.8 * Math.PI * 1.5) : -0.4;
      const sur = easeOut(seg(t, 2.8, 3.2));
      P(b, { x: gt.x, walk: gt.walk, lean: gt.lean, facing: t < 1.6 ? -1 : 1, armL: gt.armL, look: t < 1.6 ? 0 : look, mood: sur > 0.3 ? 'open' : 'smile', blink: blinkAt(t), lift: 6 * hump(seg(t, 2.8, 3.2)) });
      b.pose({ armR: 70 });
      const h = hp(b, 1, 'R', 26);
      tf(pc, h.x, h.y + 18);
      // 目線の先を示すため、見回すときは顔を上へ
      b.body.children[3].setAttribute('transform', `translate(${(look * 6).toFixed(2)} ${(-4 * clamp(seg(t, 1.6, 1.9))).toFixed(2)})`);
      scr.setAttribute('fill', `hsl(${210 + 10 * Math.sin(t * 2)}, 60%, ${80 + 4 * Math.sin(t * 3)}%)`);
      beam.setAttribute('opacity', (0.05 + 0.02 * Math.sin(t * 5)).toFixed(3));
    }
  };
}
