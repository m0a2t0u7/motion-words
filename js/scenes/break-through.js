// break through：消防士たちが斧で壁をたたき割り、穴を開けて向こう側へ通り抜ける（例文 The firefighters broke through the wall.）
import { seg, lerp, easeInOut, easeOut, easeIn, wobble, clamp } from '../ease.js';
import { gait } from './weigh.js';
import { held } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '壁の前'], [1.4, '壁をたたき割る'], [3.4, '突き抜けた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 260, y: 0, width: 140, height: FY, fill: '#F2E7DA' });
  // 壁（レンガ）：中央に割れる部分
  const WX = 230, WW = 30;
  el('rect', { x: WX, y: 0, width: WW, height: FY, fill: '#D98B6A' });
  const bricks = [];
  for (let r = 0; r < 12; r++) for (let c = 0; c < 2; c++) {
    const y = r * 20, x = WX + c * 15 - (r % 2) * 7;
    const n = el('rect', { x: -7, y: -9, width: 14, height: 18, rx: 2, fill: r % 3 ? '#C9765A' : '#D98B6A', stroke: '#B66249', 'stroke-width': 1 });
    bricks.push({ n, x: x + 7, y: y + 10, hole: y > 110 && y < 230 });
  }
  const cracks = el('path', { d: 'M 236 150 L 246 168 L 240 184 L 252 200 M 246 168 L 256 160 M 240 184 L 232 196', stroke: '#6E3A2A', 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round', opacity: 0 });
  const S = 0.78;
  const helmet = (b) => { const h = g({}, b.body); el('path', { d: 'M -32 -64 Q 0 -104 32 -64 Z', fill: pal.red }, h); el('rect', { x: -36, y: -66, width: 72, height: 6, rx: 3, fill: pal.yellowDark }, h); };
  const B2 = k.buddy({ x: 70, y: FY, scale: S }); helmet(B2);
  const B1 = k.buddy({ x: 150, y: FY, scale: S }); helmet(B1);
  const axe = g({});
  el('rect', { x: -2, y: -6, width: 5, height: 46, rx: 2, fill: pal.woodDark }, axe);
  el('path', { d: 'M 2 32 L 16 28 Q 20 38 16 48 L 2 44 Z', fill: '#AEB6C4' }, axe);
  const dust = [0, 1, 2, 3].map(() => el('circle', { r: 8, fill: '#E9D6C6' }));
  const x1 = (t) => lerp(150, 350, easeInOut(seg(t, 3.0, 4.2)));
  const x2 = (t) => lerp(70, 160, easeInOut(seg(t, 0.1, 1.0))) + lerp(0, 100, easeInOut(seg(t, 3.2, 4.4)));
  const hits = [0.6, 1.3, 2.0, 2.6];
  return {
    update(t) {
      let sw = 0, n = 0;
      hits.forEach((h) => { const u = t - h; if (u > -0.4 && u < 0.3) sw = u < 0 ? easeOut(seg(u, -0.4, -0.1)) * (1 - easeIn(seg(u, -0.1, 0))) : 0; if (t > h) n++; });
      const p1 = gait(x1, t, 150), p2 = gait(x2, t, 70);
      const swinging = t < 2.9;
      B1.pose({ x: p1.x, walk: p1.walk, armL: p1.armL, armR: swinging ? lerp(70, 170, sw) : 40, lean: swinging ? 10 - 14 * sw : p1.lean, mood: 'flat', look: 0.6 });
      B2.pose({ x: p2.x, walk: p2.walk, armL: p2.armL, armR: p2.armR, lean: p2.lean, mood: 'flat', look: 0.6 });
      held(k, B1, S, axe, 'R', 0);
      cracks.setAttribute('opacity', clamp(n / 2));
      const open = t > 2.6;
      bricks.forEach((b, i) => {
        if (b.hole && open) {
          const f = seg(t, 2.6, 3.4), dx = (b.x - WX) * 3 + 40 + (i % 3) * 20, dy = easeIn(f) * (FY - 8 - b.y);
          tf(b.n, b.x + dx * easeOut(f), b.y + dy - 30 * Math.sin(f * Math.PI), f * (i % 2 ? 200 : -160));
        } else tf(b.n, b.x + (b.hole ? wobble(seg(t, hits[n - 1] || 9, (hits[n - 1] || 9) + 0.3), 4, 6) * 1.5 : 0), b.y);
      });
      dust.forEach((d, i) => { const f = seg(t, 2.6, 3.6); k.set(d, { cx: 250 + i * 18 * f, cy: 210 - i * 14 * f, r: 6 + 20 * f, opacity: f > 0 ? 0.7 * (1 - f) : 0 }); });
    }
  };
}
