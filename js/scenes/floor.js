// floor：ねこが部屋の床を歩いてきて、床の上で丸くなって眠る（例文 The cat is sleeping on the floor.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';

export const meta = { duration: 4.6, beats: [[0, '床を歩く'], [1.8, '丸くなる'], [3.4, '床で眠る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  // 室内：壁と、奥行きのある板張りの床
  k.backdrop({ floorY: 190, mood: 'indoor' });
  el('rect', { x: 0, y: 186, width: 400, height: 6, fill: pal.woodDark, opacity: 0.5 });
  el('rect', { x: 0, y: 192, width: 400, height: 108, fill: '#EBCFA3' });
  for (let i = 0; i < 5; i++) el('line', { x1: 0, y1: 192 + i * i * 6 + 14, x2: 400, y2: 192 + i * i * 6 + 14, stroke: pal.woodDark, 'stroke-width': 1.6, opacity: 0.5 });
  for (let x = -100; x < 520; x += 70) el('line', { x1: 200 + (x - 200) * 0.45, y1: 192, x2: x, y2: 300, stroke: pal.woodDark, 'stroke-width': 1.2, opacity: 0.35 });
  el('rect', { x: 58, y: 52, width: 84, height: 70, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('rect', { x: 270, y: 120, width: 60, height: 66, rx: 4, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 3 });
  const cat = g({});
  const CY = 246;
  k.shadow(0, 0, 38, 7, cat);
  const mk = (cx, cy, rx, ry, f, p) => el('ellipse', { cx, cy, rx, ry, fill: f }, p);
  const legs = [[-22, 0.5], [-10, -0.5], [14, -0.5], [26, 0.5]].map(([x, o], i) => { const l = g({}, cat); el('rect', { x: -3.5, y: -26, width: 7, height: 26, rx: 3.5, fill: i % 2 ? '#C9894F' : '#E0A56B' }, l); return { l, x, o }; });
  const tail = g({}, cat); el('path', { d: 'M 0 0 Q 22 -6 28 -26 Q 32 -34 26 -38', fill: 'none', stroke: '#E0A56B', 'stroke-width': 8, 'stroke-linecap': 'round' }, tail);
  const body = g({}, cat); mk(0, 0, 36, 20, '#E0A56B', body); [-12, 4, 18].forEach((x) => el('path', { d: `M ${x} -16 q 4 8 0 16`, fill: 'none', stroke: '#C9894F', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, body));
  const head = g({}, cat);
  el('path', { d: 'M -17 -8 L -17 -26 L -6 -16 Z', fill: '#E0A56B' }, head); el('path', { d: 'M 17 -8 L 17 -26 L 6 -16 Z', fill: '#E0A56B' }, head);
  mk(0, 0, 20, 17, '#E0A56B', head);
  const eyeO = [-7, 7].map((x) => mk(x, -2, 2.8, 3.6, pal.ink, head));
  const eyeC = [-7, 7].map((x) => el('path', { d: `M ${x - 4} -2 Q ${x} 2 ${x + 4} -2`, fill: 'none', stroke: pal.ink, 'stroke-width': 2, 'stroke-linecap': 'round' }, head));
  el('path', { d: 'M -3 5 L 3 5 L 0 8 Z', fill: pal.coral }, head);
  const zs = [0, 1, 2].map((i) => k.text(0, 0, 'Z', { 'font-size': 14 + i * 3, fill: pal.blueDark }));
  return {
    update(t) {
      const w = easeInOut(seg(t, 0.0, 1.8)), cur = easeInOut(seg(t, 1.8, 2.8)), slp = seg(t, 2.6, 3.3);
      const x = lerp(70, 210, w), ph = x * 0.16, mv = (1 - cur) * (t < 1.8 ? 1 : 0);
      const breathe = Math.sin(t * 2.4) * 0.03 * slp;
      tf(cat, x, CY, 0, 1.0, 1.0);
      // 立ち姿 → 伏せ（脚が体に隠れる）
      legs.forEach(({ l, x: lx, o }, i) => { const sw = Math.sin(ph + (i % 2 ? Math.PI : 0)) * 20 * mv; tf(l, lx, 0, sw, 1, 1 - cur * 0.9); l.setAttribute('opacity', 1 - cur); });
      tf(body, 0, -32 + 20 * cur, 0, 1 + 0.06 * cur + breathe, 1 - 0.12 * cur + breathe * 2);
      tf(head, lerp(36, 22, cur), lerp(-44, -14, cur) + 2 * Math.sin(ph * 2) * mv, lerp(0, 18, cur), 1, 1);
      tf(tail, lerp(-34, -30, cur), lerp(-30, -12, cur), lerp(0, 0, cur) + 8 * Math.sin(t * 3) * (1 - slp), 1, 1);
      eyeO.forEach((e) => e.setAttribute('opacity', slp > 0.5 ? 0 : 1)); eyeC.forEach((e) => e.setAttribute('opacity', slp > 0.5 ? 1 : 0));
      zs.forEach((z, i) => { const q = ((t - 3.3) * 0.5 + i / 3) % 1; const on = t > 3.3 ? Math.sin(Math.max(0, q) * Math.PI) : 0; tf(z, x + 40 + i * 14, CY - 60 - 26 * q, 0, 1, 1); z.setAttribute('opacity', on); });
    }
  };
}
