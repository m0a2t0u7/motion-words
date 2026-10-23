// smart：先生が黒板に 12×3=? と書くと、まめがすぐ手を挙げて 36 と答える。正解の丸と星がつく（例文 She is a smart student.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { CO, BL, YE, reach, held, P, blinkAt, pop, sc, deskFront, wear } from './member.js';
import { cue, talk } from './in-common.js';
import { star } from './get-on-with.js';

export const meta = { duration: 4.4, beats: [[0, '問題が出る'], [1.0, 'すぐ答える'], [2.4, '正解！']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 236;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 20, y: 30, width: 200, height: 92, rx: 4, fill: '#3E6B5A', stroke: pal.woodDark, 'stroke-width': 6 });
  k.text(92, 72, '12 × 3 =', { 'font-size': 22, fill: '#fff' });
  const qm = k.text(176, 72, '?', { 'font-size': 22, fill: '#fff' });
  const ans = k.text(176, 72, '36', { 'font-size': 22, fill: pal.yellow });
  const ring = el('circle', { cx: 176, cy: 72, r: 18, fill: 'none', stroke: pal.red, 'stroke-width': 3.5 });
  const tch = k.buddy({ x: 250, y: FY, scale: 1, facing: -1, ...CO(k) }); wear(k, tch, 'glasses');
  const kids = [[60, BL(k), 0.75], [200, YE(k), 0.75]].map(([x, c, s]) => k.buddy({ x, y: FY, scale: s, facing: 1, ...c }));
  const b = k.buddy({ x: 130, y: FY, scale: 0.85, facing: 1 });
  [60, 130, 200].forEach((x) => deskFront(k, x - 26, 52, FY - 34, FY));
  const say = cue(k, '36!', 52, 30, 1, 15);
  const st = star(k, k.root, 12);
  return {
    update(t) {
      // 先生は黒板を指して問題を出す → 丸をつける
      P(tch, { look: t < 1 ? -0.4 : 0.4, facing: t < 0.9 ? -1 : -1, blink: blinkAt(t, 1), mood: t > 2.2 ? 'grin' : talk(t, 0.2, 0.8) || 'smile', armR: t < 1.0 ? 8 + 80 * hump(seg(t, 0.1, 1.0)) : 8 + 70 * hump(seg(t, 2.0, 2.6)) });
      const up = easeOut(seg(t, 0.9, 1.15));
      P(b, { look: 0.3, blink: blinkAt(t), mood: talk(t, 1.4, 1.9) || (t > 2.2 ? 'grin' : 'flat'), armR: lerp(10, 172, up) - 30 * seg(t, 2.6, 3.0), lift: 10 * hump(seg(t, 0.95, 1.3)) + 8 * hump(seg(t, 2.6, 3.0)) });
      say.show(seg(t, 1.4, 1.7) - seg(t, 2.6, 2.8), 100, 150);
      ans.setAttribute('opacity', easeOut(seg(t, 1.9, 2.2))); qm.setAttribute('opacity', 1 - seg(t, 1.8, 1.95));
      k.set(ring, { 'stroke-dasharray': '120 120', 'stroke-dashoffset': 120 * (1 - easeInOut(seg(t, 2.2, 2.6))) });
      kids.forEach((kd, i) => P(kd, { look: t > 1.2 ? (i ? -0.6 : 0.6) : 0.2, blink: blinkAt(t, i * 0.8), mood: t > 1.4 ? 'open' : 'flat', armR: 8 + 60 * seg(t, 1.25 + i * 0.1, 1.5) * (1 - seg(t, 1.6, 1.9)) }));
      tf(st, 130, FY - 112 - 6 * hump(seg(t, 2.6, 3.2)), t * 60, pop(seg(t, 2.6, 3.0)));
    }
  };
}
