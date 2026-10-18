// burn out：夜のたき火が少しずつ小さくなり、朝には燃え尽きて煙だけが残る（例文 The fire burned out by morning.）
import { seg, lerp, easeInOut, easeIn, clamp } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '夜のたき火'], [1.8, '小さくなる'], [3.6, '朝、燃え尽きた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = 236;
  const night = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: k.gradient([[0, '#27315A'], [1, '#4B5A8A']]) });
  const day = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: k.gradient([[0, '#BFE3F7'], [1, '#FCE6D6']]) });
  const sun = el('circle', { cx: 330, cy: 0, r: 22, fill: '#FFD27A' });
  el('path', { d: 'M 0 170 Q 100 120 200 168 T 400 160 L 400 240 L 0 240 Z', fill: '#5D7E78', opacity: 0.6 });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#8C9C7E' });
  // テント（静止）
  el('path', { d: 'M 40 236 L 100 150 L 160 236 Z', fill: pal.yellowDark });
  el('path', { d: 'M 92 236 L 100 190 L 108 236 Z', fill: '#7A5A30' });
  // たき火
  const X = 250;
  k.shadow(X, FY + 2, 40, 6);
  [[-1, 20], [1, -20]].forEach(([s, r]) => el('rect', { x: -30, y: -5, width: 60, height: 10, rx: 5, fill: pal.coffee, transform: `translate(${X} ${FY - 6}) rotate(${r})` }));
  const glow = el('circle', { cx: X, cy: FY - 30, r: 70, fill: '#FFB347' });
  const F = g({});
  const fl = [[0, 1, pal.red], [-12, 0.7, '#FF8A3D'], [12, 0.75, '#FF8A3D'], [0, 0.5, pal.yellow]].map(([dx, s, c]) => {
    const n = g({}, F);
    el('path', { d: 'M 0 0 C -16 0 -18 -26 -6 -40 C -4 -28 6 -32 2 -56 C 16 -40 20 -14 12 0 Z', fill: c }, n);
    return { n, dx, s };
  });
  const ember = el('ellipse', { cx: X, cy: FY - 8, rx: 22, ry: 5, fill: '#FF7A45' });
  const smoke = [0, 1, 2].map(() => el('circle', { r: 8, fill: '#A0A8B6' }));
  return {
    update(t) {
      const d = easeInOut(seg(t, 0.3, 3.6));
      night.setAttribute('opacity', 1 - seg(t, 2.4, 3.8));
      day.setAttribute('opacity', seg(t, 2.4, 3.8));
      k.set(sun, { cy: lerp(260, 70, easeInOut(seg(t, 2.6, 4.2))) });
      const size = clamp(1 - d) * (1 + 0.15 * Math.sin(t * 13) * (1 - d));
      fl.forEach((f, i) => { const w = 1 + 0.1 * Math.sin(t * 15 + i * 2); tf(f.n, X + f.dx * size, FY - 6, 5 * Math.sin(t * 8 + i), f.s * size * w, f.s * size * (2 - w)); });
      glow.setAttribute('opacity', 0.3 * clamp(1 - d) * (1 - seg(t, 2.4, 3.4)));
      k.set(ember, { fill: d > 0.9 ? '#6E6A68' : '#FF7A45', opacity: 1 });
      smoke.forEach((s, i) => {
        const u = (((t * 0.5 + i / 3) % 1) + 1) % 1;
        k.set(s, { cx: X + Math.sin(u * 6 + i) * 10, cy: FY - 20 - u * 110, r: 6 + 14 * u, opacity: seg(t, 2.8, 3.4) * 0.5 * (1 - u) });
      });
    }
  };
}
