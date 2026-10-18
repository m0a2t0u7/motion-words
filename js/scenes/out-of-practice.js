// out of practice：ほこりとクモの巣だらけのピアノ（何年も弾いていない）。弾いてみると音がガタガタに外れ、指もぎこちない（例文 I haven't played piano for years, so I'm out of practice.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, reach, drop } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, 'ほこりのピアノ'], [1.5, '弾いてみる'], [3.2, '腕が鈍った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  el('rect', { x: 40, y: 46, width: 80, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  // アップライトピアノ（動かない）
  k.shadow(296, FY, 80, 5);
  el('rect', { x: 226, y: 92, width: 150, height: FY - 92, rx: 6, fill: '#3D3550' });
  el('rect', { x: 222, y: 86, width: 158, height: 10, rx: 4, fill: '#2C2640' });
  el('rect', { x: 216, y: 168, width: 166, height: 12, rx: 2, fill: '#fff' });
  for (let i = 0; i < 14; i++) el('line', { x1: 218 + i * 11.8, y1: 168, x2: 218 + i * 11.8, y2: 180, stroke: pal.line, 'stroke-width': 1 });
  [1, 2, 4, 5, 6, 8, 9, 11, 12].forEach((i) => el('rect', { x: 214 + i * 11.8, y: 168, width: 6, height: 7, fill: pal.ink }));
  el('rect', { x: 216, y: 180, width: 166, height: 8, fill: '#2C2640' });
  // ほこりとクモの巣（年月）
  const dust = g({});
  [[250, 92], [300, 92], [350, 92], [240, 166], [330, 166]].forEach(([x, y]) => el('ellipse', { cx: x, cy: y - 1, rx: 22, ry: 3, fill: '#C9C1B4', opacity: 0.9 }, dust));
  el('path', { d: 'M 376 96 L 346 96 M 376 96 L 376 126 M 376 96 L 352 120 M 360 96 Q 366 108 376 110 M 352 96 Q 362 116 376 118', stroke: '#D9DFE7', 'stroke-width': 1.5, fill: 'none' });
  const puff = [0, 1, 2, 3].map(() => el('circle', { r: 6, fill: '#D8D1C4' }));
  const A = k.buddy({ x: 190, y: FY, scale: 0.9 });
  const notes = [0, 1, 2, 3].map((i) => {
    const n = g({});
    el('path', { d: 'M 0 0 L 0 -14', stroke: i % 2 ? pal.red : pal.violet, 'stroke-width': 2.4 }, n);
    el('ellipse', { cx: -3, cy: 0, rx: 4.5, ry: 3.4, fill: i % 2 ? pal.red : pal.violet, transform: 'rotate(-20)' }, n);
    return n;
  });
  const zig = el('path', { d: 'M 0 0 l 6 -6 l 6 6 l 6 -6 l 6 6', stroke: pal.red, 'stroke-width': 3, fill: 'none', 'stroke-linejoin': 'round' });
  const sw = drop(k);
  return {
    update(t) {
      // ほこりを払う（0.4〜1.2）
      const wipe = seg(t, 0.4, 1.2);
      dust.setAttribute('opacity', 1 - easeOut(seg(t, 0.6, 1.3)));
      puff.forEach((p, i) => { const q = seg(t, 0.6 + i * 0.1, 1.4 + i * 0.1); k.set(p, { cx: 240 + i * 26 + 10 * q, cy: 160 - 30 * q, r: 4 + 8 * q, opacity: q > 0 && q < 1 ? 0.7 * (1 - q) : 0 }); });
      // 弾く：ぎこちなく、ときどき止まる
      const play = t > 1.5 && t < 3.3;
      const hit = play ? Math.abs(Math.sin((t - 1.5) * 5.5)) : 0;
      const stiff = play && Math.floor((t - 1.5) * 1.75) % 2 === 1;
      const kx = wipe > 0 && wipe < 1 ? lerp(232, 360, wipe) : play ? 250 + 40 * Math.sin(t * 2.3) : 230;
      const ky = wipe > 0 && wipe < 1 ? 164 : play ? 166 - 8 * (1 - hit) : 200;
      P(A, { lean: 8, look: 0.5, mood: t > 1.9 ? (t > 3.3 ? 'sad' : 'flat') : 'smile', squash: 1 - 0.015 * hit });
      A.pose({ armR: t > 0.35 && t < 3.3 ? reach(A, 0.9, 'R', kx, ky) : 10, armL: play ? 60 + 12 * Math.sin(t * 7) : 20 });
      if (t > 3.3) { const e = easeOut(seg(t, 3.3, 3.7)); A.pose({ armR: lerp(60, 165, e), armL: 8, lean: lerp(8, -2, e) }); }
      // 音符：外れてガタつく
      notes.forEach((n, i) => {
        const q = play ? ((t - 1.5) * 0.9 + i / 4) % 1 : 0;
        const bad = i % 2 === 1;
        tf(n, 250 + i * 26 + (bad ? 6 * Math.sin(t * 40) : 0), 150 - 50 * q, bad ? 30 * Math.sin(t * 9 + i) : 0, play ? 1 : 0.001);
        n.setAttribute('opacity', play ? Math.sin(q * Math.PI) : 0);
      });
      tf(zig, 286, 60); zig.setAttribute('opacity', t > 2.0 && t < 3.6 ? (Math.sin(t * 10) > 0 ? 1 : 0.4) : 0);
      sw.setAttribute('opacity', t > 2.2 ? 1 : 0); tf(sw, 162, FY - 96 + 10 * ((t - 2.2) % 1));
    }
  };
}
