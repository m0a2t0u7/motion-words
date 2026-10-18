// in time：閉店まぎわの店へ2人で走り、店員が札を「閉店」に返す直前に店の中へすべり込む（例文 We got to the store in time.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, run, clock } from './run-after.js';
import { storeFront } from './lock-up.js';
import { streetBg } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, 'もうすぐ閉店'], [1.4, '走って入る'], [3.0, '間に合った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 236);
  const S = storeFront(k, FY);
  const C = clock(k, 178, 86, 13);
  // 店の中（窓の向こう）に入った2人
  const inG = g({});
  const ib = k.buddy({ x: 258, y: 196, scale: 0.6, facing: 1, parent: inG });
  const ic = k.buddy({ x: 290, y: 196, scale: 0.6, facing: 1, color: pal.blue, dark: pal.blueDark, parent: inG });
  const staff = k.buddy({ x: 350, y: 196, facing: -1, color: pal.coral, dark: pal.coralDark, scale: 0.62 });
  // 札（開店＝緑／閉店＝赤）
  const tag = g({});
  const face = el('rect', { x: -22, y: -12, width: 44, height: 24, rx: 4, fill: pal.green }, tag);
  el('line', { x1: -10, y1: -12, x2: 0, y2: -24, stroke: pal.sub, 'stroke-width': 1.5 }, tag);
  el('line', { x1: 10, y1: -12, x2: 0, y2: -24, stroke: pal.sub, 'stroke-width': 1.5 }, tag);
  const mark = el('path', { d: 'M -7 0 L -2 5 L 8 -6', stroke: '#fff', 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round' }, tag);
  const xmark = el('path', { d: 'M -6 -6 L 6 6 M 6 -6 L -6 6', stroke: '#fff', 'stroke-width': 3.5, 'stroke-linecap': 'round', opacity: 0 }, tag);
  const mid = g({});
  const b = k.buddy({ x: -40, y: FY, facing: 1, parent: mid });
  const c = k.buddy({ x: -100, y: FY, facing: 1, color: pal.blue, dark: pal.blueDark, parent: mid });
  
  return {
    update(t) {
      const tm = lerp(8 * 60 + 57, 9 * 60, seg(t, 0.2, 2.8));
      C.set(Math.floor(tm / 60), tm % 60);
      const xb = (tt) => lerp(-40, 178, easeInOut(seg(tt, 0.2, 2.2)));
      const xc = (tt) => lerp(-100, 178, easeInOut(seg(tt, 0.35, 2.45)));
      const rb = run(xb, t, -40, 1), rc = run(xc, t, -100, 1);
      const inB = t > 2.2, inC = t > 2.45;
      const openD = easeOut(seg(t, 1.7, 1.95)) * (1 - easeInOut(seg(t, 2.5, 2.8)));
      S.D.set(openD);
      P(b, { ...rb, mood: 'open', look: 0.4 }); P(c, { ...rc, mood: 'open', look: 0.4 });
      b.g.setAttribute('opacity', inB ? 0 : 1); c.g.setAttribute('opacity', inC ? 0 : 1);
      // 店員：札を返す（2人が入ったあと）
      const flip = seg(t, 2.85, 3.25);
      P(staff, { x: 350, y: 196, facing: -1, look: -0.6, armR: lerp(20, 110, easeOut(seg(t, 2.6, 2.9))) * (1 - seg(t, 3.4, 3.8)) + 8, mood: 'smile', blink: blinkAt(t, 1) });
      tf(tag, 322, 134, 0, Math.max(0.05, Math.abs(Math.cos(flip * Math.PI))), 1);
      const closed = flip > 0.5;
      face.setAttribute('fill', closed ? pal.red : pal.green);
      mark.setAttribute('opacity', closed ? 0 : 1); xmark.setAttribute('opacity', closed ? 1 : 0);
      // 店内：ほっとする2人
      const inside = easeOut(seg(t, 2.7, 3.1));
      inG.setAttribute('opacity', inside);
      P(ib, { x: 258, y: 196, scale: 0.6, facing: 1, mood: 'grin', armR: lerp(8, 150, easeOut(seg(t, 3.2, 3.6))), lift: 6 * hump(seg(t, 3.2, 3.6)), blink: blinkAt(t) });
      P(ic, { x: 290, y: 196, scale: 0.6, facing: 1, mood: 'grin', armL: 8, armR: lerp(8, 60, easeOut(seg(t, 3.3, 3.7))), blink: blinkAt(t, 1) });
    }
  };
}
