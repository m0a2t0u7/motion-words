// catch up：遅れたまめが走って、歩いているグループに追いつく（例文 I ran fast to catch up with the group.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '遅れている'], [1.3, '走って縮める'], [3.2, '追いついた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  el('rect', { x: 0, y: FY, width: 400, height: 10, fill: '#E3E8EE' });
  el('circle', { cx: 80, cy: 150, r: 34, fill: '#CDE8D2' }); el('rect', { x: 77, y: 170, width: 6, height: 70, fill: pal.woodDark });
  el('circle', { cx: 80, cy: 142, r: 36, fill: '#9AD3A8' });
  const cols = [[pal.coral, pal.coralDark, 0.6], [pal.blue, pal.blueDark, 0.56], [pal.yellow, pal.yellowDark, 0.58]];
  const grp = cols.map(([c, d, s], i) => k.buddy({ x: 250 + i * 34, y: FY + 2, scale: s, color: c, dark: d }));
  const dust = Array.from({ length: 5 }, () => el('circle', { r: 5, fill: '#D5DCE5' }));
  const b = k.buddy({ x: 36, y: FY + 8, scale: 0.95 });
  const G0 = 236, V = 12;
  const phaseOf = (t) => (t < 2.9 ? t * 15 : 2.9 * 15 + (t - 2.9) * 9);
  const pos = (t) => lerp(36, 218, easeOut(seg(t, 0.2, 2.9))) + (t > 2.9 ? V * (t - 2.9) : 0);
  return {
    update(t) {
      grp.forEach((q, i) => {
        const ph = t * 6 + i * 1.4;
        q.pose({ x: G0 + i * 34 + V * t, walk: ph, armR: 8 + Math.sin(ph) * 14, armL: 8 - Math.sin(ph) * 14, look: 0.5, mood: 'smile', lean: 2 });
      });
      const run = t < 2.9;
      const ph = phaseOf(t);
      const sw = Math.sin(ph) * (run ? 44 : 18);
      b.pose({ x: pos(t), walk: ph, armR: 8 + sw, armL: 8 - sw, lean: run ? 13 : 3, look: 0.5, mood: t < 1.2 ? 'sad' : run ? 'open' : 'grin' });
      dust.forEach((d, i) => {
        const te = 0.4 + i * 0.5, p = clamp((t - te) / 0.7);
        k.set(d, { cx: pos(te) - 22 - 8 * p, cy: FY + 2 - 16 * p, r: 4 + 7 * p });
        d.setAttribute('opacity', p > 0 && p < 1 && te < 2.9 ? 0.7 * (1 - p) : 0);
      });
    }
  };
}
