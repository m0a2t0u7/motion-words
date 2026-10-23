// anxious：面接室の前のいすで、書類をにぎって時計を見上げ、足をそわそわ動かす（例文 He felt anxious before the job interview.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt, hp, hold, papers, clock, sweat, sym, chair, faceOf, legs, door, blush } from './confused.js';

export const meta = { duration: 4.2, beats: [[0, '面接を待つ'], [1.4, '時計を見る'], [2.8, 'そわそわ不安']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 12, width: 400, height: 12, fill: '#ECE6DC' });
  // 面接室のドアと札
  el('rect', { x: 286, y: FY - 140, width: 80, height: 140, rx: 4, fill: '#C9A577' });
  door(k, { x: 292, y: FY - 134, w: 68, h: 134, hinge: 'R', color: '#8FA9C8' });
  el('rect', { x: 296, y: FY - 168, width: 60, height: 22, rx: 4, fill: '#fff', stroke: pal.ink, 'stroke-width': 2 });
  k.text(326, FY - 157, 'INTERVIEW', { 'font-size': 9 });
  // 壁の時計（針が進む）
  el('circle', { cx: 160, cy: 60, r: 24, fill: '#fff', stroke: pal.ink, 'stroke-width': 3 });
  const hand = el('line', { x1: 0, y1: 0, x2: 0, y2: -17, stroke: pal.red, 'stroke-width': 2.5, 'stroke-linecap': 'round' });
  el('line', { x1: 160, y1: 60, x2: 160, y2: 48, stroke: pal.ink, 'stroke-width': 3, 'stroke-linecap': 'round' });
  chair(k, 150, FY, 26, '#9FB4CC', undefined);
  const b = k.buddy({ x: 150, y: FY - 16, scale: S });
  const doc = papers(k, 3);
  const sw = sweat(k), sw2 = sweat(k), q = sym(k, '!', pal.coralDark, 22);
  const bl = blush(k, b);
  const lines = g({});
  [-1, 1].forEach((d) => el('path', { d: `M ${d * 44} -70 q ${d * 6} 6 0 12 q ${-d * 6} 6 0 12`, stroke: pal.sub, 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }, lines));
  return {
    update(t) {
      const up = easeInOut(seg(t, 1.1, 1.6)) * (1 - easeInOut(seg(t, 2.4, 2.8)));
      const fid = seg(t, 0.6, 1.0), jit = Math.sin(t * 40) * 0.8 * seg(t, 2.6, 3.0);
      P(b, { x: 150 + jit, y: FY - 16, armR: 26 + 4 * Math.sin(t * 7) * fid, armL: 26 - 4 * Math.sin(t * 7) * fid, lean: 4 - 10 * up,
        look: 0.2, mood: t > 2.4 ? 'sad' : 'flat', blink: blinkAt(t), squash: 1 - 0.03 * seg(t, 2.6, 3) });
      faceOf(b).setAttribute('transform', `translate(${(2 * up).toFixed(2)} ${(-6 * up).toFixed(2)})`);
      // 足が小刻みに床をたたく
      const tap = Math.abs(Math.sin(t * 14)) * 14 * fid;
      legs(b, -tap, 0);
      const r = hp(b, S, 'R'), l = hp(b, S, 'L');
      tf(doc, (r.x + l.x) / 2, (r.y + l.y) / 2 - 2, -4, 1);
      tf(hand, 160, 60, 120 + t * 40);
      sw((t * 0.8) % 1 * seg(t, 1.8, 2.2), 186, FY - 92);
      sw2(((t * 0.8) + 0.5) % 1 * seg(t, 2.6, 3), 112, FY - 88);
      q(seg(t, 1.3, 1.6) * (1 - seg(t, 2.2, 2.4)), 196, FY - 118);
      bl(0.3 * seg(t, 2.4, 3));
      tf(lines, 150 + jit, FY - 16, 0, 1); lines.setAttribute('opacity', seg(t, 2.6, 3.0) * (0.6 + 0.4 * Math.sin(t * 20)));
    }
  };
}
