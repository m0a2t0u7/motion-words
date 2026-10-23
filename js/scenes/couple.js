// couple：夕方の浜辺を、手をつないだ2人が並んで歩く（足あとが残る）（例文 The couple walked along the beach.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { arms, heartP, pops, P, blinkAt, C } from './jam.js';
import { gait } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '浜辺'], [0.6, '並んで歩く'], [3.6, 'ふたりで']] };

export function create(k) {
  const { el, pal } = k, FY = 236;
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: k.gradient([[0, '#FBD3B0'], [1, '#FDEBD8']]) });
  el('circle', { cx: 300, cy: 130, r: 26, fill: '#FFB86B', opacity: 0.9 });
  el('rect', { x: 0, y: 140, width: 400, height: 60, fill: '#7FC4E8' });
  const waves = [0, 1, 2].map((i) => el('path', { d: 'M -20 0 q 20 -6 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0', stroke: '#fff', 'stroke-width': 2.4, fill: 'none', opacity: 0.6 }));
  el('path', { d: 'M 0 196 Q 100 188 200 196 T 400 194 V 300 H 0 Z', fill: '#F3DDB5' });
  const prints = [...Array(14)].map((_, i) => el('ellipse', { cx: 0, cy: 0, rx: 4, ry: 2, fill: '#E2C796' }));
  const xf = (t) => lerp(-10, 250, easeInOut(seg(t, 0.2, 3.8)) * 0.98 + 0.02 * seg(t, 0.2, 3.8));
  const her = k.buddy({ x: 0, y: FY, scale: 1.05, ...C(k, 'coral') });
  const him = k.buddy({ x: 0, y: FY + 4, scale: 1.1 });
  const A = arms(k, him, 1.1, { back: ['R'] }), B = arms(k, her, 1.05, { col: pal.coral, dark: pal.coralDark });
  const h = heartP(k);
  return {
    update(t) {
      const g = gait(xf, t, -10);
      const x2 = g.x + 74;
      P(her, { x: x2, walk: g.walk + 1, lean: g.lean, look: -0.5, blink: blinkAt(t, 1), mood: 'grin' });
      P(him, { x: g.x, walk: g.walk, lean: g.lean, look: 0.6, blink: blinkAt(t), mood: 'grin' });
      // つないだ手（2人の間）
      const mid = { x: (g.x + x2) / 2 + 2, y: FY - 36 };
      A.to('R', mid.x, mid.y); B.to('L', mid.x, mid.y - 2);
      A.ang('L', 8 + Math.sin(g.walk) * 14); B.ang('R', 8 - Math.sin(g.walk) * 14);
      prints.forEach((p, i) => { const px = -10 + i * 18; const on = px < g.x - 10; k.set(p, { cx: px + (i % 2) * 6, cy: FY + 10 + (i % 2) * 4, opacity: on ? 0.9 : 0 }); });
      waves.forEach((w, i) => k.tf(w, -((t * 20 + i * 13) % 40), 156 + i * 14));
      const q = seg(t, 3.4, 4.0); k.tf(h, mid.x, 120 - 10 * q, 0, pops(q) * 1.4);
    }
  };
}
