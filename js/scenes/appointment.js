// appointment：会社で時計が2時半を指し、メモの「歯医者 3:00」を見たまめが、かばんを持って早めに退社する（例文 I have a dentist appointment at three, so I must leave early.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';
import { officeBg, desk, monitor } from './get-on-with.js';
import { clock } from './run-after.js';
import { hp, gait } from './dig.js';
import { TOOTH } from './checkup.js';

export const meta = { duration: 4.4, beats: [[0, '2時半の会社'], [1.0, '3時に歯医者'], [2.4, '早めに出る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = officeBg(k, 236, 40);
  const ck = clock(k, 210, 52, 22);
  // 出口のドア
  el('rect', { x: 326, y: FY - 118, width: 68, height: 118, fill: '#8A7A66' });
  el('rect', { x: 330, y: FY - 114, width: 60, height: 114, fill: '#E8EDF2' });
  const door = g({});
  el('rect', { x: 0, y: 0, width: 60, height: 114, rx: 3, fill: '#C9B08F' }, door);
  el('circle', { cx: 50, cy: 58, r: 4, fill: pal.yellowDark }, door);
  // 同僚（左）
  const co = k.buddy({ x: 42, y: FY, scale: 0.86, color: pal.coral, dark: pal.coralDark });
  desk(k, 14, 104, FY);
  monitor(k, 96, FY - 46);
  // まめの机
  const b = k.buddy({ x: 206, y: FY, scale: 0.95, facing: 1 });
  desk(k, 150, 130, FY);
  monitor(k, 268, FY - 46);
  // メモ（歯医者 3:00）
  const note = g({}); tf(note, 296, 120);
  el('rect', { x: -26, y: -22, width: 52, height: 44, rx: 3, fill: '#FFF0A6' }, note);
  const tooth = el('path', { d: TOOTH, fill: '#fff', stroke: pal.blueDark, 'stroke-width': 1.6 }, note); tf(tooth, -12, -2, 0, 0.9);
  k.text(10, 1, '3:00', { 'font-size': 12 }, note);
  const glow = el('rect', { x: 266, y: 94, width: 60, height: 52, rx: 6, fill: 'none', stroke: pal.coral, 'stroke-width': 3, opacity: 0 });
  // かばん（机の上）
  const bag = g({});
  el('rect', { x: -14, y: 4, width: 28, height: 20, rx: 4, fill: pal.violet }, bag);
  el('path', { d: 'M -8 4 Q 0 -6 8 4', fill: 'none', stroke: '#7E66CC', 'stroke-width': 3 }, bag);
  const xf = (t) => lerp(206, 352, easeInOut(seg(t, 2.7, 4.1)));
  return {
    update(t) {
      const m = lerp(30, 34, seg(t, 0, 4.4));
      ck.set(2, m);
      const look1 = hump(seg(t, 0.5, 1.3)), look2 = hump(seg(t, 1.2, 2.1));
      const typing = t < 0.5 ? Math.sin(t * 30) * 6 : 0;
      const grab = easeInOut(seg(t, 2.1, 2.5));
      const p = gait(xf, t, 206);
      const wave = hump(seg(t, 2.4, 3.2));
      b.pose({ x: p.x, walk: p.walk, lean: p.lean + 6 * grab * (1 - seg(t, 2.5, 2.7)), mood: look2 > 0.3 ? 'open' : 'smile', look: look1 > 0.2 ? -0.2 : 0.6,
        armR: t < 2.4 ? 70 + typing : lerp(70, 150 + 20 * Math.sin(t * 12), wave), armL: t < 2.1 ? 70 : lerp(70, 40, grab) });
      if (t > 3.2) b.pose({ armR: p.armR, armL: lerp(40, 14, seg(t, 3.0, 3.4)) });
      ck.g.setAttribute('transform', `translate(210 52) scale(${1 + 0.12 * look1})`);
      glow.setAttribute('opacity', look2);
      tf(note, 296, 120, 0, 1 + 0.08 * look2);
      const h = hp(b, 0.95, 'L', 28);
      if (t < 2.35) tf(bag, 164, FY - 70);
      else tf(bag, h.x, h.y - 4);
      tf(door, 330, FY - 114, 0, Math.max(0.12, 1 - 0.88 * easeInOut(seg(t, 3.2, 3.7))), 1);
      co.pose({ armR: 70 + Math.sin(t * 26) * 5, armL: 70, look: t > 2.5 ? 1 : 0.6, mood: 'smile' });
    }
  };
}
