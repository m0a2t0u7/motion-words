// foolish：「すべりやすい！」の注意の看板を無視して、スマホを見ながら歩いたまめが、ぬれた床でつるっとしりもちをつく（例文 It would be foolish to ignore the warning.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, wobble } from '../ease.js';
import { P, blinkAt, hp, hold, walkTo, path, person, sym, legs } from './confused.js';
import { phone } from './look-over.js';

export const meta = { duration: 4.2, beats: [[0, '注意の看板'], [1.4, '無視して進む'], [2.6, 'すべった！']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 12, width: 400, height: 12, fill: '#ECE6DC' });
  // ぬれた床
  el('ellipse', { cx: 270, cy: FY + 14, rx: 70, ry: 10, fill: '#BDE6FA', opacity: 0.9 });
  el('ellipse', { cx: 250, cy: FY + 11, rx: 20, ry: 3, fill: '#fff', opacity: 0.7 });
  // 黄色い注意の立て看板（A形）
  const SX = 150;
  k.shadow(SX, FY + 2, 24, 3.5);
  el('path', { d: `M ${SX - 20} ${FY} L ${SX - 8} ${FY - 70} L ${SX + 8} ${FY - 70} L ${SX + 20} ${FY} Z`, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 });
  el('path', { d: `M ${SX} ${FY - 60} L ${SX + 12} ${FY - 38} L ${SX - 12} ${FY - 38} Z`, fill: 'none', stroke: pal.ink, 'stroke-width': 2.5, 'stroke-linejoin': 'round' });
  k.text(SX, FY - 46, '!', { 'font-size': 13 });
  el('path', { d: `M ${SX - 10} ${FY - 24} q 4 -6 8 0 q 4 6 8 0`, stroke: pal.blueDark, 'stroke-width': 2.2, fill: 'none' });
  const b = k.buddy({ x: 40, y: FY, scale: S });
  const ph = phone(k);
  const spl = [0, 1, 2, 3].map(() => el('circle', { r: 3, fill: pal.water }));
  const oh = sym(k, '!', pal.red, 28), st = sym(k, '★', pal.yellowDark, 16);
  const xf = path([[0.1, 40], [2.4, 262]]);
  return {
    update(t) {
      const w = walkTo(xf, t, 40, 1), slip = seg(t, 2.35, 2.75), sit = easeIn(slip), land = seg(t, 2.75, 3.2);
      P(b, { x: w.x + 18 * easeOut(slip), walk: w.walk, lean: w.lean + 6 - 34 * sit + 6 * wobble(land, 2, 5), armL: w.armL + 130 * hump(slip) + 40 * sit, armR: lerp(60, 140, hump(slip)) ,
        lift: -26 * sit, squash: 1 - 0.08 * hump(land), look: t < 2.35 ? 0.2 : 0, mood: t < 2.35 ? 'smile' : 'open', blink: blinkAt(t) });
      if (t > 2.35) legs(b, -70 * easeOut(slip), -90 * easeOut(slip));
      if (t > 3.3) b.pose({ mood: 'sad' });
      hold(k, b, S, ph.g, 'R', -10);
      // 歩きながらスマホに夢中（画面が光る）
      ph.scr.setAttribute('fill', t < 2.35 ? '#9FD0F2' : '#9FB4CC');
      spl.forEach((c, i) => { const q = seg(t, 2.7, 3.3); k.set(c, { cx: 280 + (i - 1.5) * 26 * q, cy: FY + 6 - 26 * hump(q) * (1 + (i % 2) * 0.5), opacity: hump(q) }); });
      oh(seg(t, 2.35, 2.55), b.state.x + 30, FY - 120);
      st(seg(t, 2.8, 3.0), b.state.x - 26, FY - 70 + 6 * Math.sin(t * 8));
    }
  };
}
