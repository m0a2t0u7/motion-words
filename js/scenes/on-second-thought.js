// on second thought：カフェで一度コーヒーを指すが、少し考え直して紅茶を指し直し、店員が紅茶を出す（例文 On second thought, I'll have tea instead.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { room } from './dig.js';
import { hp, reach } from './dig.js';
import { say } from './get-on-with.js';

// カップ（kind 0=コーヒー 1=紅茶）
export function cup(k, kind, parent) {
  const g = k.g({}, parent);
  k.el('path', { d: 'M -9 -10 L 9 -10 L 7 6 L -7 6 Z', fill: '#fff', stroke: k.pal.line, 'stroke-width': 2 }, g);
  k.el('path', { d: 'M 9 -6 Q 15 -4 9 2', stroke: k.pal.line, 'stroke-width': 2.4, fill: 'none' }, g);
  k.el('ellipse', { cx: 0, cy: -9, rx: 8, ry: 2.4, fill: kind ? '#D9883E' : k.pal.coffee }, g);
  if (kind) { k.el('line', { x1: -3, y1: -10, x2: -12, y2: -20, stroke: k.pal.sub, 'stroke-width': 1 }, g); k.el('rect', { x: -16, y: -24, width: 6, height: 6, fill: k.pal.yellow }, g); }
  return g;
}

export const meta = { duration: 4.4, beats: [[0, 'コーヒーを指す'], [1.4, '考え直す'], [2.4, 'やっぱり紅茶']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const R = room(k, 'indoor');
  const FY = R.FY;
  // メニュー板（コーヒー／紅茶の絵）
  el('rect', { x: 140, y: 26, width: 140, height: 76, rx: 6, fill: '#3E4A5E', stroke: pal.woodDark, 'stroke-width': 4 });
  const mC = cup(k, 0); tf(mC, 180, 72, 0, 1.6);
  const mT = cup(k, 1); tf(mT, 244, 72, 0, 1.6);
  const ring = el('ellipse', { rx: 26, ry: 24, fill: 'none', stroke: pal.yellow, 'stroke-width': 3.5 });
  const cross = el('path', { d: 'M -14 -14 L 14 14 M 14 -14 L -14 14', stroke: pal.red, 'stroke-width': 4, 'stroke-linecap': 'round' });
  const staff = k.buddy({ x: 262, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 130, y: FY, facing: 1 });
  R.front();
  // 店員の手元のポット（コーヒー・紅茶）
  const pots = [pal.coffee, '#D9883E'].map((c, i) => { const p = g({}); el('rect', { x: -9, y: -20, width: 18, height: 22, rx: 5, fill: i ? '#fff' : pal.ink, stroke: c, 'stroke-width': 3 }, p); el('path', { d: 'M 9 -14 Q 16 -12 9 -4', stroke: c, 'stroke-width': 3, fill: 'none' }, p); return p; });
  [[300, 0], [324, 1]].forEach(([x, i]) => tf(pots[i], x, R.TY - 2));
  const out = cup(k, 1);
  const think = say(k, 30, 26);
  [[-7, 0], [0, 0], [7, 0]].forEach(([x]) => el('circle', { cx: x, cy: 0, r: 2.5, fill: pal.sub }, think.inner));
  return {
    update(t) {
      // 指す先：コーヒー（0.3〜1.3）→考える（1.4〜2.2）→紅茶（2.3〜）
      const p1 = easeOut(seg(t, 0.3, 0.7)) * (1 - easeInOut(seg(t, 1.2, 1.5)));
      const p2 = easeOut(seg(t, 2.3, 2.7)) * (1 - easeInOut(seg(t, 3.4, 3.7)));
      const hmm = seg(t, 1.4, 2.3);
      P(b, { x: 130, facing: 1, look: 0.6 });
      const aC = reach(b, 1, 'R', 180, 80), aT = reach(b, 1, 'R', 244, 80);
      const chin = hmm > 0 && hmm < 1 ? 1 : 0;
      P(b, { x: 130, facing: 1, look: chin ? -0.2 : 0.6, armR: p1 > 0.01 ? lerp(8, aC, p1) : p2 > 0.01 ? lerp(8, aT, p2) : 8, armL: chin ? 150 : 8, lean: chin ? -4 : 2, mood: chin ? 'flat' : t > 2.3 ? 'grin' : 'smile', blink: blinkAt(t) });
      if (chin) b.body.children[3].setAttribute('transform', 'translate(-2 -5)');
      tf(ring, 180, 72, 0, Math.max(0.001, p1 > 0.6 ? 1 : 0));
      ring.setAttribute('cx', 0); ring.setAttribute('cy', 0);
      if (t > 2.4) tf(ring, 244, 72, 0, 1);
      ring.setAttribute('opacity', p1 > 0.6 || t > 2.4 ? 1 : 0);
      tf(cross, 180, 72, 0, Math.max(0.001, easeOut(seg(t, 2.0, 2.3))));
      think.show(108, 112, chin ? easeOut(seg(hmm, 0, 0.2)) : 0);
      // 店員：コーヒーポットに手→止まる→紅茶ポットを持ってカップに注ぎ、差し出す
      const reachC = easeOut(seg(t, 0.8, 1.2)) * (1 - easeInOut(seg(t, 1.9, 2.2)));
      const pour = seg(t, 2.8, 3.5), give = easeInOut(seg(t, 3.5, 4.1));
      P(staff, { x: 262, facing: -1, look: t < 2.6 ? -0.6 : 0.4, armR: lerp(20, 60, reachC), armL: t > 2.8 && t < 3.5 ? 50 : 10, mood: t > 1.9 && t < 2.6 ? 'open' : 'smile', blink: blinkAt(t, 1) });
      if (t > 2.8 && t < 3.5) tf(pots[1], 300, R.TY - 22 - 6 * hump(pour), -40 * hump(pour)); else tf(pots[1], 324, R.TY - 2);
      out.setAttribute('opacity', t > 2.8 ? 1 : 0);
      P(staff, { x: 262, facing: -1, look: -0.5, lean: 14 * give, armR: lerp(30, 85, give), mood: 'smile', blink: blinkAt(t, 1) });
      const sh = hp(staff, 1);
      tf(out, t > 3.5 ? sh.x - 4 : 284, t > 3.5 ? R.TY - 6 : R.TY - 6, 0, 1.2);
    }
  };
}
