// parent：彼女（小さい子）の両親は2人とも先生。父と母がそれぞれ黒板の前で教えている（例文 Her parents are both teachers.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { arms, bow, heartP, pops, P, blinkAt, C } from './jam.js';

export const meta = { duration: 4.4, beats: [[0, '彼女の両親'], [1.2, '2人とも'], [2.6, '先生']] };

export function create(k) {
  const { el, pal } = k, FY = 236;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#F3F0E8' });
  const board = (x, txt) => { el('rect', { x, y: 40, width: 150, height: 90, rx: 4, fill: '#3E6B5A', stroke: pal.woodDark, 'stroke-width': 6 }); return txt; };
  board(20); board(230);
  const w1 = k.text(95, 86, 'A B C', { 'font-size': 24, fill: '#fff' });
  const w2 = k.text(305, 86, '1+2=3', { 'font-size': 22, fill: '#fff' });
  const mom = k.buddy({ x: 130, y: FY, scale: 1.1, facing: -1 });
  const dad = k.buddy({ x: 270, y: FY, scale: 1.15, facing: 1, ...C(k, 'blue') });
  const girl = k.buddy({ x: 200, y: FY, scale: 0.65, ...C(k, 'coral') });
  bow(k, girl);
  const A = arms(k, mom, 1.1), B = arms(k, dad, 1.15, { col: pal.blue, dark: pal.blueDark });
  // 教科書（左手）
  const book = (c) => { const g = k.g({}); el('rect', { x: -10, y: -14, width: 20, height: 26, rx: 2, fill: c }, g); el('rect', { x: -10, y: -14, width: 4, height: 26, fill: '#000', opacity: 0.15 }, g); return g; };
  const bk1 = book(pal.yellow), bk2 = book(pal.violet);
  const hs = [0, 1].map(() => heartP(k));
  const ring = el('path', { d: 'M 130 160 Q 200 120 270 160', stroke: pal.yellowDark, 'stroke-width': 3, fill: 'none', 'stroke-dasharray': '5 6' });
  return {
    update(t) {
      const write = (q) => clamp(q);
      const tw = seg(t, 1.0, 2.4);
      P(mom, { look: 0.6, blink: blinkAt(t), mood: 'open', facing: -1, lean: 3 });
      P(dad, { look: 0.6, blink: blinkAt(t, 0.8), mood: 'open', lean: 3 });
      P(girl, { look: t < 1.2 ? 0 : Math.sin(t * 2) * 0.8, blink: blinkAt(t, 1.4), mood: t > 2.6 ? 'grin' : 'smile', armL: 10, armR: t > 2.6 ? 150 : 10 });
      // 指し示す（チョークで書く）
      const ph = Math.sin(t * 5) * 6;
      A.to('R', lerp(100, 70 + 50 * tw, easeInOut(seg(t, 0.4, 1.0))), lerp(200, 96 + ph * 0.3, easeInOut(seg(t, 0.4, 1.0))));
      B.to('R', lerp(300, 250 + 70 * tw, easeInOut(seg(t, 0.4, 1.0))), lerp(200, 96 - ph * 0.3, easeInOut(seg(t, 0.4, 1.0))));
      const l1 = A.to('L', 150, 190), l2 = B.to('L', 250, 190);
      k.tf(bk1, l1.x, l1.y - 6); k.tf(bk2, l2.x, l2.y - 6);
      w1.setAttribute('opacity', write(tw * 1.3)); w2.setAttribute('opacity', write(tw * 1.3));
      hs.forEach((h, i) => { const q = seg(t, 2.8 + i * 0.3, 3.4 + i * 0.3); k.tf(h, 186 + i * 28, 150 - 14 * q, 0, pops(q)); });
      ring.setAttribute('opacity', seg(t, 2.6, 3.0).toFixed(2));
    }
  };
}
