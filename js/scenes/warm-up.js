// warm up：寒そうに縮こまっていたまめが、ジャンプ運動で体を温め、試合の準備が整う（例文 Let's warm up before the game.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '体が冷えている'], [1.2, '準備運動'], [3.4, '体が温まった']] };

const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, p) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * p).toString(16).padStart(2, '0')).join('');

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('rect', { x: 0, y: 236, width: 400, height: 8, fill: '#CFEBC8' });
  el('ellipse', { cx: 90, cy: 52, rx: 34, ry: 12, fill: '#fff', opacity: 0.8 });
  el('ellipse', { cx: 300, cy: 40, rx: 28, ry: 10, fill: '#fff', opacity: 0.8 });
  // ゴールとボール（これから試合）
  [[300, 380]].forEach(([x1, x2]) => {
    el('path', { d: `M ${x1} 236 L ${x1} 132 L ${x2} 132 L ${x2} 236`, fill: 'none', stroke: '#9DAABB', 'stroke-width': 6, 'stroke-linejoin': 'round' });
    for (let i = 1; i < 6; i++) el('line', { x1: x1 + i * 13, y1: 134, x2: x1 + i * 13, y2: 234, stroke: '#B9C4D2', 'stroke-width': 1.5, opacity: 0.8 });
    for (let j = 1; j < 5; j++) el('line', { x1: x1 + 2, y1: 132 + j * 20, x2: x2 - 2, y2: 132 + j * 20, stroke: '#B9C4D2', 'stroke-width': 1.5, opacity: 0.8 });
  });
  k.shadow(286, 240, 14, 3.5);
  el('circle', { cx: 286, cy: 228, r: 12, fill: '#fff', stroke: pal.ink, 'stroke-width': 2 });
  el('path', { d: 'M 286 222 L 291 226 L 289 232 L 283 232 L 281 226 Z', fill: pal.ink });
  // 体温計の看板
  el('rect', { x: 45, y: 150, width: 6, height: 86, fill: pal.woodDark });
  el('rect', { x: 26, y: 60, width: 44, height: 100, rx: 10, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  el('rect', { x: 43, y: 72, width: 10, height: 62, rx: 5, fill: '#EEF1F5' });
  const fill = el('rect', { x: 44.5, y: 120, width: 7, height: 14, rx: 3.5, fill: pal.blue });
  const bulb = el('circle', { cx: 48, cy: 140, r: 10, fill: pal.blue });
  el('rect', { x: 43, y: 72, width: 10, height: 62, rx: 5, fill: 'none', stroke: pal.sub, 'stroke-width': 1.5 });
  [82, 96, 110, 124].forEach((y) => el('line', { x1: 57, y1: y, x2: 63, y2: y, stroke: pal.sub, 'stroke-width': 2, 'stroke-linecap': 'round' }));

  const b = k.buddy({ x: 190, y: FY, scale: 1 });
  const heat = g({});
  [-18, 0, 18].forEach((dx) => el('path', { d: `M ${dx} 0 q -5 -8 0 -16 t 0 -16`, fill: 'none', stroke: pal.coral, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, heat));
  const drops = [0, 1].map(() => el('path', { d: 'M 0 -6 Q 4 0 0 4 Q -4 0 0 -6 Z', fill: pal.water }));

  return {
    update(t) {
      const warm = easeInOut(seg(t, 0.6, 3.2));
      // 寒い：腕を抱えて小刻みに震える → ジャンプ運動 → 構えて元気に
      const cold = 1 - seg(t, 0.5, 0.9);
      const jt = t - 1.1;
      const jumping = jt > 0 && t < 3.2;
      const ph = jumping ? (jt % 0.5) / 0.5 : 0;
      const lift = jumping ? 26 * Math.sin(Math.PI * ph) : 0;
      const land = jumping && ph < 0.12 ? 1 - 0.1 * (1 - ph / 0.12) : 1;
      const arms = jumping ? lerp(15, 168, Math.sin(Math.PI * ph)) : 0;
      const shiver = cold > 0 ? Math.sin(t * 60) * 1.6 : 0;
      const end = easeOut(seg(t, 3.2, 3.6));
      let aR = lerp(-70, 20, 1 - cold), aL = aR;
      if (jumping) { aR = arms; aL = arms; }
      if (t >= 3.2) { aR = lerp(arms, 55, end); aL = aR; }
      b.pose({ x: 190 + shiver, lift, squash: land - (t >= 3.2 ? 0.02 * Math.sin(t * 8) : 0), armR: aR, armL: aL, mood: cold > 0.5 ? 'sad' : t > 3.2 ? 'grin' : 'open', lean: cold * 4, blink: t > 3.7 && t < 3.8 ? 1 : 0 });
      // 体温計：青 → 赤
      const lv = 14 + 46 * warm;
      fill.setAttribute('y', 134 - lv); fill.setAttribute('height', lv);
      const col = mix(pal.blue, pal.red, warm);
      fill.setAttribute('fill', col); bulb.setAttribute('fill', col);
      // 湯気（温まったしるし）と汗
      tf(heat, 190, 120 - 2 * Math.sin(t * 6), 0);
      heat.setAttribute('opacity', seg(t, 2.6, 3.3) * 0.8);
      drops.forEach((d, i) => {
        const p = seg(t, 2.3 + i * 0.3, 3.0 + i * 0.3);
        const q = easeOut(p);
        tf(d, 190 + (i ? 28 : -28) * (0.6 + q), 150 - 10 * Math.sin(Math.PI * p) + 24 * p * p, 0, p > 0 ? 1 : 0.001);
        d.setAttribute('opacity', p > 0 && p < 1 ? 1 - seg(p, 0.7, 1) : 0);
      });
    }
  };
}
