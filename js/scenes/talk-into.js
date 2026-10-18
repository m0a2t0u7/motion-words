// talk into：まめは最初は首をふるが、友だちが楽しさを話して説得→まめはうなずき、クラブの入会表に名前を書く（例文 My friend talked me into joining the club.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { roomBg, say, faceAt, walkPose, hp } from './look-over.js';
import { heart } from './weigh.js';

export const meta = { duration: 4.8, beats: [[0, 'えー、いやだ'], [1.8, '説得される'], [3.4, '入会する']] };

export function racket(k, parent) {
  const n = k.g({}, parent);
  k.el('ellipse', { cx: 0, cy: -6, rx: 8, ry: 10, fill: 'none', stroke: k.pal.red, 'stroke-width': 3 }, n);
  k.el('line', { x1: 0, y1: 4, x2: 0, y2: 14, stroke: k.pal.ink, 'stroke-width': 3, 'stroke-linecap': 'round' }, n);
  return n;
}

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9;
  const FY = roomBg(k, 'home', 240);
  // クラブの入会ボード
  el('rect', { x: 300, y: 70, width: 84, height: 110, rx: 6, fill: '#FFF6DA', stroke: pal.yellowDark, 'stroke-width': 3 });
  const rk = racket(k); tf(rk, 342, 96);
  [126, 142, 158].forEach((y) => el('line', { x1: 312, x2: 372, y1: y, y2: y, stroke: pal.line, 'stroke-width': 2 }));
  el('path', { d: 'M 314 124 q 6 -6 10 0 t 10 0 t 10 0', fill: 'none', stroke: pal.blue, 'stroke-width': 2.4 });
  const name = el('path', { d: 'M 314 140 q 6 -6 10 0 t 10 0 t 10 0 t 10 0', fill: 'none', stroke: pal.mintDark, 'stroke-width': 2.6, 'stroke-dasharray': 50, 'stroke-dashoffset': 50 });
  el('rect', { x: 338, y: 180, width: 8, height: 58, fill: pal.woodDark });
  const fr = k.buddy({ x: 90, y: FY, scale: S, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 190, y: FY, scale: S, facing: -1 });
  const bub = say(k, 52, 40, -1); const r2 = racket(k, bub.g); tf(r2, -8, 2, 0, 0.8); const ht = g({}, bub.g); heart(k, ht, pal.red); tf(ht, 12, 0, 0, 0.9);
  const no = say(k, 34, 30, 1); el('path', { d: 'M -7 -7 L 7 7 M 7 -7 L -7 7', stroke: pal.red, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, no.g);
  const xf = (t) => lerp(190, 296, easeInOut(seg(t, 2.8, 3.6)));
  return {
    update(t) {
      const talk = t > 0.9 && t < 2.9;
      fr.pose({ x: lerp(90, 120, easeInOut(seg(t, 0.9, 1.4))), walk: seg(t, 0.9, 1.4) * 3.14, armR: talk ? 60 + 25 * Math.sin(t * 6) : 20, armL: talk ? 30 + 20 * Math.sin(t * 6 + 1) : 10, lean: 6 * talk, mood: talk && Math.sin(t * 13) > 0 ? 'open' : 'grin', look: 0.6 });
      bub.show(seg(t, 1.0, 1.2) * (1 - seg(t, 2.6, 2.8)), 150, 128);
      no.show(seg(t, 0.2, 0.4) * (1 - seg(t, 1.0, 1.2)), 214, 132);
      const shake = t < 1.2 ? Math.sin(t * 16) * seg(t, 0.2, 0.4) * (1 - seg(t, 1.0, 1.2)) : 0;
      const nod = t > 2.3 && t < 2.8 ? Math.max(0, Math.sin((t - 2.3) * 12)) : 0;
      const p = walkPose(xf, t, 190);
      const turn = t > 2.8;
      const write = t > 3.6 && t < 4.4;
      b.pose({ x: p.x, walk: p.walk, facing: turn ? 1 : -1, armR: write ? 95 + 6 * Math.sin(t * 30) : p.m > 0 ? p.armR : 10, armL: p.armL + (t < 1.2 ? 20 * seg(t, 0.2, 0.4) * (1 - seg(t, 1.0, 1.2)) : 0), lean: 3 * nod - 4 * (t < 1.2 ? seg(t, 0.2, 0.4) : 0), mood: t > 2.3 ? 'grin' : t > 1.5 ? 'smile' : 'flat', look: 0.6 });
      faceAt(b, 4 + shake * 4, 3 * nod + (write ? 2 : 0));
      k.set(name, { 'stroke-dashoffset': 50 * (1 - seg(t, 3.6, 4.4)) });
    }
  };
}
