// lightning：夜の町の空に稲妻が走り、ピカッと夜空全体が明るく照らされる（例文 Lightning lit up the night sky.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { nightBg, cloudG, P, blinkAt } from './nature.js';

export const meta = { duration: 4.2, beats: [[0, '夜の空'], [1.2, 'ピカッ'], [2.8, '空が明るく']] };

export function create(k) {
  const { el, g, tf } = k, S = 0.9;
  const { FY, stars } = nightBg(k, { FY: 244, n: 10, top: '#141B30', bot: '#2C3657', ground: '#2A3343' });
  const lit = el('rect', { x: 0, y: 0, width: 400, height: FY, fill: k.gradient([[0, '#B9C6F5'], [1, '#E9EDFF']]), opacity: 0 });
  const clouds = [[90, 40], [250, 30], [370, 50]].map(([x, y]) => { const c = cloudG(k, 170, 54, '#3A4463', undefined, false); tf(c, x, y); return c; });
  const BOLT = 'M 260 50 L 236 112 L 256 112 L 222 196 L 286 98 L 264 98 L 284 50 Z';
  const glowB = el('path', { d: BOLT, fill: 'none', stroke: '#FFFBE0', 'stroke-width': 10, opacity: 0, 'stroke-linejoin': 'round' });
  const bolt = g({});
  el('path', { d: BOLT, fill: '#FFF3A8' }, bolt);
  el('path', { d: 'M 236 112 L 206 150', stroke: '#FFF3A8', 'stroke-width': 4, 'stroke-linecap': 'round' }, bolt);
  // 町並み（シルエット）
  [[0, 70, 50], [52, 100, 40], [96, 60, 60], [300, 90, 46], [350, 64, 50]].forEach(([x, h, w]) => {
    el('rect', { x, y: FY - h, width: w, height: h, fill: '#1E2638' });
    for (let yy = FY - h + 12; yy < FY - 10; yy += 18) el('rect', { x: x + 10, y: yy, width: 8, height: 8, fill: '#FFD98A', opacity: 0.7 });
  });
  const b = k.buddy({ x: 190, y: FY, scale: S });
  return {
    update(t) {
      const f1 = hump(seg(t, 1.1, 1.5)), f2 = clamp(easeOut(seg(t, 2.4, 2.6)) * (1 - 0.35 * easeInOut(seg(t, 2.8, 4.2))));
      const L = Math.max(f1, f2);
      lit.setAttribute('opacity', (0.85 * L).toFixed(2));
      bolt.setAttribute('opacity', L > 0.05 ? 1 : 0);
      glowB.setAttribute('opacity', (0.5 * L).toFixed(2));
      clouds.forEach((c) => c.setAttribute('opacity', 1 - 0.4 * L));
      stars.forEach((s) => s.setAttribute('opacity', 0.7 * (1 - L)));
      const sur = easeOut(seg(t, 1.15, 1.4));
      P(b, { look: 0.6, lean: -6 * sur, armL: lerp(8, 60, sur), armR: lerp(8, 60, sur), squash: 1 + 0.06 * hump(seg(t, 1.1, 1.5)), lift: 8 * hump(seg(t, 1.15, 1.45)), mood: sur > 0.3 ? 'open' : 'smile', blink: blinkAt(t) });
      b.body.children[3].setAttribute('transform', `translate(${(4 * sur).toFixed(1)} ${(-4 * sur).toFixed(1)})`);
    }
  };
}
