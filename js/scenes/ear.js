// ear：雪の中、寒さで耳が赤くなってジンジン痛む。両手で耳をおおう（例文 My ears hurt from the cold.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { hp, reach, P, blinkAt, bp, ears, ache } from './body.js';

const mix = (a, b, p) => { const h = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16)); const A = h(a), B = h(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], p))).join(',')})`; };

export const meta = { duration: 4.2, beats: [[0, '寒い雪の日'], [1.2, '耳が痛い'], [2.6, '耳をおおう']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.25, FY = 236;
  k.backdrop({ floorY: FY, mood: 'outdoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#DCE6F0' });
  el('path', { d: `M 0 ${FY - 30} Q 120 ${FY - 70} 240 ${FY - 34} T 400 ${FY - 44} V ${FY} H 0 Z`, fill: '#F4F8FB' });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#fff' });
  [[60, 1], [340, 0.9]].forEach(([x, s]) => { el('rect', { x: x - 4, y: FY - 60 * s, width: 8, height: 60 * s, fill: pal.woodDark }); el('path', { d: `M ${x - 30 * s} ${FY - 40 * s} L ${x} ${FY - 110 * s} L ${x + 30 * s} ${FY - 40 * s} Z`, fill: '#7FB59A' }); el('path', { d: `M ${x - 18 * s} ${FY - 70 * s} L ${x} ${FY - 110 * s} L ${x + 18 * s} ${FY - 70 * s} Z`, fill: '#fff' }); });
  const b = k.buddy({ x: 200, y: FY, scale: S });
  const scarf = el('rect', { x: -31, y: -30, width: 62, height: 10, rx: 5, fill: pal.red }, b.body);
  const ea = ears(k, b, pal.mint, pal.mintDark);
  const aL = ache(k), aR = ache(k);
  const flakes = Array.from({ length: 22 }, (_, i) => el('circle', { r: 2 + (i % 3), fill: '#fff' }));
  return {
    update(t) {
      const red = easeInOut(seg(t, 0.6, 1.6)), cover = easeInOut(seg(t, 2.4, 2.9));
      const shiv = Math.sin(t * 40) * 1.6 * (1 - cover * 0.6);
      P(b, { x: 200 + shiv, squash: 1 - 0.04 * cover, mood: t > 1.2 ? 'sad' : 'flat', blink: t > 1.4 && t < 2.4 ? 0.6 : blinkAt(t), armL: 10, armR: 10 });
      ea.forEach((e) => e.setAttribute('fill', mix('#5FCDB8', '#F2685B', red)));
      const eR = bp(b, S, 29, -56), eL = bp(b, S, -29, -56);
      if (cover > 0) b.pose({ armR: lerp(10, reach(b, S, 'R', eR.x + 4, eR.y), cover), armL: lerp(10, reach(b, S, 'L', eL.x - 4, eL.y), cover) });
      const ap = easeOut(seg(t, 1.2, 1.5)) * (1 - 0.5 * cover);
      aL.set(ap, eL.x - 20, eL.y - 8, t, -50); aR.set(ap, eR.x + 20, eR.y - 8, t + 0.3, 50);
      flakes.forEach((f, i) => { const sx = (i * 73) % 400, sp = 26 + (i % 5) * 6; k.set(f, { cx: ((sx + 12 * Math.sin(t * 1.5 + i)) + 400) % 400, cy: ((i * 37 + t * sp) % 260) }); });
    }
  };
}
