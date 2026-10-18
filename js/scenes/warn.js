// warn：穴に近づく人に気づき、手を上げて「！」と声をかけて止める（例文 I warned him about the danger.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, wobble } from '../ease.js';
import { gait } from './dig.js';
import { bubble, streetBg } from './weigh.js';

export const meta = { duration: 4.2, beats: [[0, '穴に近づく'], [1.4, '声をかける'], [2.8, '止まった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 236, 'outdoor'), Y = 262;
  el('rect', { x: 0, y: 236, width: 400, height: 64, fill: '#D8DDE6' });
  el('ellipse', { cx: 225, cy: Y, rx: 48, ry: 11, fill: '#9AA3B5' });
  el('ellipse', { cx: 225, cy: Y + 2, rx: 42, ry: 8, fill: '#3C4559' });
  // 標識（穴の奥側）
  const sg = g({}); tf(sg, 280, Y - 4);
  el('rect', { x: -2, y: -44, width: 4, height: 44, fill: pal.sub }, sg);
  el('path', { d: 'M 0 -78 L 20 -42 L -20 -42 Z', fill: pal.yellow, stroke: pal.ink, 'stroke-width': 3, 'stroke-linejoin': 'round' }, sg);
  k.text(0, -53, '!', { 'font-size': 18, fill: pal.ink }, sg);
  const C = k.buddy({ x: 40, y: Y, facing: 1, color: pal.coral, dark: pal.coralDark });
  const G = k.buddy({ x: 362, y: Y, facing: -1 });
  const P = (b, o) => b.pose({ armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'smile', blink: 0, lift: 0, ...o });
  const bb = bubble(k, 40, 36); k.text(0, 0, '!', { 'font-size': 26, fill: pal.red }, bb);
  const sweat = el('path', { d: 'M 0 -7 Q 5 0 0 5 Q -5 0 0 -7 Z', fill: pal.water });
  const xf = (t) => lerp(40, 152, easeInOut(seg(t, 0.2, 2.6)));
  return {
    update(t) {
      const p = gait(xf, t, 40, 16, 0.12);
      const hear = easeOut(seg(t, 1.5, 1.9)), rec = hump(seg(t, 1.5, 2.4));
      const talk = t > 1.0 && t < 2.3 && Math.sin(t * 20) > 0;
      P(C, { x: p.x - 8 * hear, walk: p.walk, armL: lerp(p.armL, -30, hear), armR: lerp(p.armR, 30, hear), lean: lerp(p.lean, -9, hear), look: 0.5, mood: t > 1.6 ? 'open' : 'smile', squash: 1 - 0.04 * hump(seg(t, 1.5, 1.9)) });
      P(G, { armR: lerp(8, 110, easeOut(seg(t, 0.9, 1.4))) + (t > 1.4 && t < 2.8 ? 8 * Math.sin(t * 14) : 0), lean: 6 * seg(t, 0.9, 1.4), look: 0.6, mood: talk ? 'open' : t > 2.8 ? 'flat' : 'smile' });
      tf(bb, 352, 108, 0, Math.max(0.001, backOut(seg(t, 1.0, 1.4))) );
      bb.setAttribute('opacity', 1 - 0.7 * seg(t, 3.0, 3.6));
      tf(sweat, p.x + 16 - 8 * hear, 168 - 6 * seg(t, 2.0, 3.0) + 28, 0, hear > 0 ? 1 : 0.001);
    }
  };
}
