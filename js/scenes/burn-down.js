// burn down：古い納屋が炎に包まれ、地面まで崩れ落ちて灰と煙だけが残る（例文 The old barn burned down last summer.）
import { seg, lerp, easeInOut, easeIn, easeOut, wobble, clamp } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '古い納屋'], [1.4, '燃え上がる'], [3.4, '焼け落ちた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'evening' });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#D9C89A' });
  [[30, 180], [370, 190]].forEach(([x, y]) => { el('rect', { x: x - 3, y, width: 6, height: FY - y, fill: pal.woodDark }); });
  el('rect', { x: 0, y: 200, width: 400, height: 4, fill: pal.woodDark, opacity: 0.6 });
  k.shadow(200, FY + 1, 110, 8);
  // 納屋（下端を基準に縮んで崩れる）
  const barn = g({});
  const body = g({}, barn);
  el('rect', { x: -90, y: -110, width: 180, height: 110, fill: '#B5513F' }, body);
  el('path', { d: 'M -100 -106 L 0 -170 L 100 -106 Z', fill: '#7E3A2E' }, body);
  el('rect', { x: -30, y: -70, width: 60, height: 70, fill: '#8E3E30' }, body);
  el('path', { d: 'M -30 -70 L 30 0 M 30 -70 L -30 0', stroke: '#F0D6C0', 'stroke-width': 4 }, body);
  el('rect', { x: -10, y: -140, width: 20, height: 18, fill: '#F0D6C0' }, body);
  const char = el('path', { d: 'M -90 0 L -90 -106 L -100 -106 L 0 -170 L 100 -106 L 90 -106 L 90 0 Z', fill: '#3A2E2E', opacity: 0 }, body);
  tf(barn, 200, FY);
  const ash = el('path', { d: 'M 100 236 Q 130 214 160 222 Q 200 206 240 220 Q 280 212 300 236 Z', fill: '#5A5050' });
  const beams = [[-40, 40], [20, -30], [60, 20]].map(([x, r]) => el('rect', { x: -26, y: -4, width: 52, height: 8, rx: 2, fill: '#2E2626', transform: `translate(${200 + x} 226) rotate(${r * 0.3})` }));
  const F = g({});
  const fl = [-70, -30, 10, 50, 80].map((dx, i) => { const n = g({}, F); el('path', { d: 'M 0 0 C -22 0 -24 -36 -8 -56 C -6 -40 8 -44 2 -80 C 22 -56 26 -20 18 0 Z', fill: i % 2 ? '#FF8A3D' : pal.red }, n); el('path', { d: 'M 0 0 C -10 0 -12 -18 -2 -30 C 4 -18 12 -12 8 0 Z', fill: pal.yellow }, n); return { n, dx, i }; });
  const smoke = [0, 1, 2, 3].map(() => el('circle', { r: 20, fill: '#6E6A70' }));
  const B = k.buddy({ x: 50, y: 262, scale: 0.6 });
  return {
    update(t) {
      const fire = easeOut(seg(t, 0.6, 1.6));
      const col = easeIn(seg(t, 2.0, 3.2));
      char.setAttribute('opacity', 0.7 * seg(t, 1.0, 2.2));
      tf(body, 0, 0, wobble(seg(t, 2.0, 2.6), 3, 3) * 2, 1 + 0.08 * col, 1 - col * 0.98);
      barn.setAttribute('opacity', col >= 0.98 ? 0 : 1);
      ash.setAttribute('opacity', seg(t, 2.6, 3.2));
      beams.forEach((b) => b.setAttribute('opacity', seg(t, 2.8, 3.3)));
      const h = fire * (1 - 0.7 * easeOut(seg(t, 2.6, 4.2)));
      fl.forEach((f) => { const w = 1 + 0.12 * Math.sin(t * 14 + f.i * 1.7); tf(f.n, 200 + f.dx, FY - 110 * (1 - col) * 0.5, 6 * Math.sin(t * 7 + f.i), h * w * 1.1, h * (2 - w) * 1.4 * (1 - col * 0.5)); });
      smoke.forEach((s, i) => { const u = (((t * 0.4 + i / 4) % 1) + 1) % 1; k.set(s, { cx: 200 + (i - 1.5) * 30 + u * 30, cy: 150 - u * 140, r: 16 + 24 * u, opacity: seg(t, 0.9, 1.6) * 0.45 * (1 - u) }); });
      B.pose({ look: 0.9, mood: t > 1.0 ? 'open' : 'smile', armL: 8, armR: lerp(8, 40, seg(t, 1.0, 1.4)) });
      if (t > 3.2) B.pose({ mood: 'sad' });
    }
  };
}
