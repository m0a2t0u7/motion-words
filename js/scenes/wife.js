// wife：彼の妻は英語の先生。教室で黒板に Hello と書いて教え、夫は教室の外から手をふる（例文 His wife teaches English.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { arms, bow, heartP, pops, P, blinkAt, C } from './jam.js';

export const meta = { duration: 4.4, beats: [[0, '彼の妻'], [0.8, '英語を書く'], [2.6, '英語を教える']] };

export function create(k) {
  const { el, pal } = k, FY = 236;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#F3F0E8' });
  el('rect', { x: 40, y: 34, width: 220, height: 100, rx: 4, fill: '#3E6B5A', stroke: pal.woodDark, 'stroke-width': 6 });
  const word = k.text(150, 72, 'Hello!', { 'font-size': 30, fill: '#fff' });
  const ab = k.text(150, 112, 'A B C', { 'font-size': 18, fill: '#fff', opacity: 0.7 });
  const cp = k.clip((c) => k.el('rect', { x: 60, y: 40, width: 0, height: 90, id: 'wipe' }, c));
  const wipe = word.ownerSVGElement.querySelector('#wipe');
  word.setAttribute('clip-path', cp); ab.setAttribute('clip-path', cp);
  // ドア（夫）
  el('rect', { x: 300, y: 70, width: 70, height: 166, rx: 3, fill: '#C98A5A' });
  el('rect', { x: 310, y: 84, width: 50, height: 40, rx: 3, fill: '#DDEFFA' });
  const hub = k.buddy({ x: 335, y: FY, scale: 1.05, facing: -1, ...C(k, 'blue') });
  const wife = k.buddy({ x: 220, y: FY, scale: 1.15, facing: -1 });
  bow(k, wife);
  const kids = [[110, 'coral'], [170, 'blue']].map(([x, c]) => k.buddy({ x, y: FY + 30, scale: 0.6, facing: 1, ...C(k, c) }));
  el('rect', { x: 80, y: 228, width: 130, height: 10, rx: 3, fill: pal.wood });
  const A = arms(k, wife, 1.15), H = arms(k, hub, 1.05, { col: pal.blue, dark: pal.blueDark, back: ['L'] });
  const h = heartP(k);
  return {
    update(t) {
      const wr = seg(t, 0.6, 2.2);
      k.set(wipe, { width: 200 * wr });
      P(wife, { look: t < 2.3 ? -0.2 : 0.5, facing: t < 2.3 ? -1 : 1, blink: blinkAt(t), mood: t > 2.4 ? 'open' : 'smile', lean: 2 });
      const wx = 60 + 190 * wr;
      if (t < 2.3) A.to('R', lerp(200, wx, easeInOut(seg(t, 0.2, 0.6))) + Math.sin(t * 20) * 3, lerp(200, 70 + 12 * Math.sin(t * 9), easeInOut(seg(t, 0.2, 0.6))));
      else A.to('R', lerp(150, 200, 0) + 30 * (1 - easeInOut(seg(t, 2.3, 2.6))) + 40, lerp(70, 110, easeInOut(seg(t, 2.3, 2.6))));
      A.to('L', 210, 200);
      kids.forEach((kd, i) => P(kd, { look: 0.3, blink: blinkAt(t, i), mood: t > 2.8 ? 'open' : 'smile', armR: t > 2.9 + i * 0.3 ? 160 : 10 }));
      P(hub, { look: 0.5, facing: -1, blink: blinkAt(t, 0.6), mood: 'smile' });
      H.to('R', 335 - 34 + Math.sin(t * 9) * 5 * (t > 2.8), t > 2.8 ? 130 : 200); H.to('L', 330, 204);
      const q = seg(t, 3.0, 3.5); k.tf(h, 300, 110 - 10 * q, 0, pops(q));
    }
  };
}
