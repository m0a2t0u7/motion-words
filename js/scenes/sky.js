// sky：外に出て見上げると、雲ひとつない青空が広がっている（例文 The sky is clear today.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { scene, hills, sunG, treeG, gait, P, blinkAt, point, popIn } from './nature.js';

export const meta = { duration: 4.2, beats: [[0, '外へ出る'], [1.5, '空を見上げる'], [2.8, '雲ひとつない']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1;
  const { FY } = scene(k, { FY: 240, top: '#79BDF2', bot: '#D6EEFC' });
  hills(k, FY);
  // 家（左）
  el('rect', { x: 10, y: FY - 96, width: 92, height: 96, fill: '#FFF6EA' });
  el('path', { d: `M 0 ${FY - 92} L 56 ${FY - 140} L 112 ${FY - 92} Z`, fill: pal.coral });
  el('rect', { x: 40, y: FY - 62, width: 32, height: 62, rx: 3, fill: pal.woodDark });
  k.tf(treeG(k, 1.05).g, 352, FY + 2);
  const sun = sunG(k, 22); tf(sun.g, 300, 56);
  const shine = el('circle', { cx: 300, cy: 56, r: 40, fill: '#fff', opacity: 0 });
  const b = k.buddy({ x: 56, y: FY, scale: S });
  const xf = (t) => lerp(56, 190, easeInOut(seg(t, 0.2, 1.4)));
  const spark = [[120, 40], [200, 70], [250, 30]].map(([x, y]) => { const s = el('path', { d: 'M 0 -8 L 2 -2 L 8 0 L 2 2 L 0 8 L -2 2 L -8 0 L -2 -2 Z', fill: '#fff' }); return [s, x, y]; });
  return {
    update(t) {
      const w = gait(xf, t, 56), up = easeInOut(seg(t, 1.4, 2.0)), pt = easeInOut(seg(t, 2.3, 2.8));
      P(b, { x: w.x, walk: w.walk, armL: w.armL, armR: w.armR, lean: w.lean - 8 * up, look: lerp(0.4, 0.6, up), mood: t > 2.6 ? 'grin' : 'smile', blink: blinkAt(t) });
      b.body.children[3].setAttribute('transform', `translate(${(3 * up).toFixed(1)} ${(-5 * up).toFixed(1)})`);
      if (pt > 0) b.pose({ armR: lerp(w.armR, point(b, S, 'R', 260, 40), pt), armL: lerp(8, 30, pt) });
      sun.rays.setAttribute('transform', `rotate(${t * 15})`);
      shine.setAttribute('opacity', 0.25 * hump(seg(t, 2.3, 3.4)));
      spark.forEach(([s, x, y], i) => { const q = seg(t, 2.6 + i * 0.25, 3.2 + i * 0.25); tf(s, x, y, t * 60, popIn(q) * (0.8 + 0.2 * Math.sin(t * 6 + i))); });
    }
  };
}
