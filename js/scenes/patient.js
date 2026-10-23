// patient：病室のベッドで体を起こした患者のまめに、医師がやさしく話しかける。まめはうなずいて安心する（例文 The doctor talked to the patient.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { BL, P, blinkAt, walkTo, path, wear } from './member.js';
import { coat, clinicBg, bed } from './hospital.js';
import { cue, talk } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '病室'], [1.2, '医師が話す'], [3.0, 'うなずく']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 240;
  clinicBg(k, FY);
  const bd = bed(k, 180, FY, 200);
  const b = k.buddy({ x: 300, y: bd.MT + 8, scale: 0.85, facing: -1 }); b.g.firstChild.setAttribute('display', 'none');
  bd.front(196, 366, bd.MT - 14);
  const doc = k.buddy({ x: -40, y: FY, scale: 1, facing: 1, ...BL(k) }); coat(k, doc);
  // 聴診器
  el('path', { d: 'M -14 -36 Q -16 -18 0 -16 Q 16 -18 14 -36 M 0 -16 L 0 -8', stroke: pal.ink, 'stroke-width': 2.2, fill: 'none' }, doc.body.children[3].parentNode);
  const say = cue(k, '', 70, 34, 1);
  const lines = [0, 1].map((i) => el('rect', { x: -22, y: -7 + i * 9, width: 0, height: 4, rx: 2, fill: pal.blueDark }, say.g));
  const heart = el('path', { d: 'M 0 6 C -12 -4 -8 -12 0 -6 C 8 -12 12 -4 0 6 Z', fill: pal.red });
  const dx = path([[0.2, -40], [1.2, 150]]);
  return {
    update(t) {
      const w = walkTo(dx, t, -40, 1);
      P(doc, { x: w.x, walk: w.walk, armL: w.armL, armR: lerp(w.armR, 40 + 30 * hump(seg(t, 1.6, 2.4)), seg(t, 1.2, 1.5)), lean: w.lean + 6 * seg(t, 1.2, 1.6), look: 0.6, blink: blinkAt(t, 1), mood: talk(t, 1.4, 3.0) || 'smile' });
      say.show(seg(t, 1.4, 1.7) - seg(t, 3.0, 3.2), 200, 110);
      lines.forEach((l, i) => l.setAttribute('width', 44 * seg(t, 1.6 + i * 0.5, 2.1 + i * 0.5) - i * 10 * seg(t, 1.6 + i * 0.5, 2.1 + i * 0.5)));
      const nod = (seg(t, 3.0, 3.8) > 0 && t < 3.8) ? Math.abs(Math.sin((t - 3.0) * 8)) : 0;
      P(b, { y: bd.MT + 8, armR: 20, armL: 14, look: lerp(0, 0.7, seg(t, 0.8, 1.2)), blink: blinkAt(t), mood: t > 3.0 ? 'grin' : 'flat', lean: 10 * nod - 4 });
      b.body.children[3].setAttribute('transform', `translate(${(4 * seg(t, 0.8, 1.2)).toFixed(2)} ${(3 * nod).toFixed(2)})`);
      const q = seg(t, 3.4, 4.2); tf(heart, 300, bd.MT - 100 - 10 * q, 0, Math.max(0.001, hump(q)));
    }
  };
}
