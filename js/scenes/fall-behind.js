// fall behind：3人のランナーのうち、まめだけが少しずつ後ろへ遅れていく（例文 He fell behind the other runners.）
import { seg, lerp, easeInOut, easeOut } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, '一緒に走る'], [1.4, '遅れ始める'], [3.0, '後ろに落ちる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 232 });
  el('rect', { x: 0, y: FY + 6, width: 400, height: 44, fill: '#F0D9C8' });
  const lines = [];
  for (let i = 0; i < 6; i++) lines.push(el('rect', { x: 0, y: FY + 28, width: 30, height: 4, rx: 2, fill: '#fff' }));
  const r1 = k.buddy({ x: 250, y: FY + 6, scale: 0.7, color: pal.coral, dark: pal.coralDark });
  const r2 = k.buddy({ x: 190, y: FY + 6, scale: 0.7, color: pal.yellow, dark: pal.yellowDark });
  const me = k.buddy({ x: 190, y: FY + 6, scale: 0.7 });
  const bibs = [r1, r2, me].map((b, i) => {
    const r = el('rect', { x: -14, y: -50, width: 28, height: 18, rx: 4, fill: '#fff' }, b.body);
    const tx = k.text(0, -41, String(i + 1), { 'font-size': 13, fill: pal.ink }, b.body);
    return tx;
  });
  bibs[0].textContent = '1'; bibs[1].textContent = '2'; bibs[2].textContent = '3';
  const sweat = el('path', { d: 'M 0 -8 Q 5 0 0 5 Q -5 0 0 -8', fill: pal.water });
  const dust = g({});
  [0, 1].forEach((i) => el('circle', { cx: -i * 8, cy: 0, r: 3.5 + i, fill: '#fff', opacity: 0.9 }, dust));
  return {
    update(t) {
      const off = t * 160;
      lines.forEach((l, i) => l.setAttribute('x', ((i * 90 - off) % 540 + 540) % 540 - 60));
      const ph = t * 11;
      const drop = easeInOut(seg(t, 1.3, 3.6));
      const run = (b, x, phase, tired = 0) => b.pose({ x, walk: phase, armL: 8 + Math.sin(phase) * 38, armR: 8 - Math.sin(phase) * 38, lean: 14 + 6 * tired, look: 1, mood: tired > 0.4 ? 'sad' : 'smile' });
      run(r1, 320 + 6 * Math.sin(t * 2), ph + 1);
      run(r2, 260 + 6 * Math.sin(t * 2 + 1), ph + 2.2);
      run(me, 200 - 160 * drop, ph * (1 - 0.2 * drop), drop);
      const mx = 200 - 160 * drop;
      tf(sweat, mx - 12, FY - 66 + ((t * 40) % 20) * drop, 0, drop, drop);
      sweat.setAttribute('opacity', drop > 0.2 ? 0.9 : 0);
      tf(dust, mx - 26, FY, 0, 1, 1);
      dust.setAttribute('opacity', Math.sin(t * 16) > 0 ? 0.9 : 0.3);
    }
  };
}
