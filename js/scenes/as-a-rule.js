// as a rule：夜9時すぎ。おやつを勧められても、壁の「9時以降は食べない」の決まりを指して断る（例文 As a rule, I don't eat after nine.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, clock } from './run-after.js';
import { roomBg } from './look-over.js';
import { hp, reach } from './dig.js';
import { popS } from './from-scratch.js';

export function plate(k, parent) {
  const g = k.g({}, parent);
  k.el('ellipse', { cx: 0, cy: 0, rx: 18, ry: 5, fill: '#fff', stroke: k.pal.line, 'stroke-width': 2 }, g);
  k.el('path', { d: 'M -10 -2 L 10 -2 L 6 -14 Q 0 -18 -6 -14 Z', fill: '#F6D7A6' }, g);
  k.el('path', { d: 'M -9 -8 Q 0 -12 9 -8 L 7 -13 Q 0 -18 -7 -13 Z', fill: '#fff' }, g);
  k.el('circle', { cx: 0, cy: -17, r: 3.5, fill: k.pal.red }, g);
  return g;
}

export const meta = { duration: 4.2, beats: [[0, '夜9時すぎ'], [1.3, 'すすめられる'], [2.4, '決まりで断る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240, 'evening');
  const C = clock(k, 200, 54, 20);
  C.set(9, 20);
  // 決まりの貼り紙：時計（9時）＋お皿に斜線
  const note = g({}); tf(note, 296, 84);
  el('rect', { x: -38, y: -26, width: 76, height: 52, rx: 4, fill: '#FFF8E6', stroke: pal.woodDark, 'stroke-width': 2 }, note);
  el('circle', { cx: 0, cy: -30, r: 3, fill: pal.red }, note);
  const nc = clock(k, -18, 0, 12, note); nc.set(9, 0);
  tf(plate(k, note), 18, 6, 0, 0.6);
  el('circle', { cx: 18, cy: 0, r: 13, fill: 'none', stroke: pal.red, 'stroke-width': 3 }, note);
  el('line', { x1: 9, y1: 9, x2: 27, y2: -9, stroke: pal.red, 'stroke-width': 3 }, note);
  const b = k.buddy({ x: 140, y: FY, facing: 1 });
  const c = k.buddy({ x: 330, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark });
  const pl = plate(k);
  const glow = el('rect', { x: 256, y: 56, width: 80, height: 56, rx: 6, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 3, opacity: 0 });
  return {
    update(t) {
      const off = easeInOut(seg(t, 0.3, 1.2));
      const cx = lerp(330, 262, off);
      P(c, { x: cx, facing: -1, walk: off < 1 ? Math.abs(cx - 330) * 0.107 : 0, armR: lerp(30, 72, easeOut(seg(t, 0.9, 1.4))) * (1 - 0.6 * easeInOut(seg(t, 3.0, 3.5))), mood: t > 3.0 ? 'smile' : 'grin', look: -0.4, blink: blinkAt(t, 1) });
      const ch = hp(c, 1);
      tf(pl, ch.x - 6, ch.y - 4);
      // 手で止める→首を振る→貼り紙を指す
      const stop = easeOut(seg(t, 1.6, 1.9)) * (1 - easeInOut(seg(t, 2.6, 2.9)));
      const shake = t > 1.8 && t < 2.6 ? Math.sin((t - 1.8) * 22) : 0;
      const pt = easeOut(seg(t, 2.7, 3.1)) * (1 - easeInOut(seg(t, 3.8, 4.2)));
      P(b, { x: 140, facing: 1, lean: -4 * stop });
      const ptA = reach(b, 1, 'R', 270, 90);
      P(b, { x: 140, facing: 1, armR: lerp(lerp(8, 82, stop), ptA, pt), armL: 8, lean: -4 * stop, look: 0.5 + shake * 0.5, mood: stop > 0.3 ? 'flat' : 'smile', blink: blinkAt(t) });
      b.body.children[3].setAttribute('transform', `translate(${(3 + shake * 4).toFixed(2)} 0)`);
      glow.setAttribute('opacity', hump(seg(t, 2.9, 3.9)));
      tf(glow, 0, 0);
    }
  };
}
