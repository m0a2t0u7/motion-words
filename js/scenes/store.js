// store：夜9時、店員が札を CLOSED に返し、明かりを消してシャッターを下ろす（例文 The store closes at nine.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { P, blinkAt, storefront, hp, reach } from './restaurant.js';
import { shutter } from './bakery.js';
import { streetBg } from './weigh.js';
import { clock } from './run-after.js';

export const meta = { duration: 4.4, beats: [[0, 'もうすぐ9時'], [1.4, '9時になった'], [2.6, '店が閉まる']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 240;
  streetBg(k, FY, 'evening');
  const dark = el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#1E2A44', opacity: 0.3 });
  el('circle', { cx: 350, cy: 40, r: 14, fill: '#FFF3C4' });
  const sf = storefront(k, { x: 50, w: 300, h: 192, FY, wall: '#E8EEF6', trim: '#4A8BE0', awn: ['#6AA8F7', '#fff'], label: 'STORE', signFill: '#4A8BE0', doorX: 270, doorW: 54 });
  const wx = 62, wy = sf.wy, ww = 196, wh = FY - wy - 10;
  const lit = el('rect', { x: wx, y: wy, width: ww, height: wh, rx: 4, fill: '#FFF6CF', stroke: '#fff', 'stroke-width': 4 });
  [wy + 34, wy + 70].forEach((y) => { el('rect', { x: wx + 6, y, width: ww - 12, height: 4, fill: pal.sub }); for (let i = 0; i < 8; i++) el('rect', { x: wx + 12 + i * 23, y: y - 16, width: 16, height: 16, rx: 2, fill: [pal.red, pal.yellow, pal.green, pal.blue][i % 4] }); });
  const room = el('rect', { x: wx, y: wy, width: ww, height: wh, fill: '#1E2A44', opacity: 0 });
  const dg = el('rect', { x: sf.doorX + 4, y: sf.doorTop + 4, width: sf.doorW - 8, height: FY - sf.doorTop - 4, fill: '#FFF6CF' });
  const clerk = k.buddy({ x: sf.doorX + 27, y: FY, scale: 0.82, facing: -1, color: pal.blue, dark: pal.blueDark });
  // ドアの札（OPEN → CLOSED）
  const tag = g({}); el('line', { x1: -10, y1: -14, x2: 0, y2: -22, stroke: pal.sub, 'stroke-width': 1.5 }, tag); el('line', { x1: 10, y1: -14, x2: 0, y2: -22, stroke: pal.sub, 'stroke-width': 1.5 }, tag);
  const face = g({}, tag);
  const fo = g({}, face); el('rect', { x: -26, y: -14, width: 52, height: 22, rx: 4, fill: pal.green }, fo); k.text(0, -3, 'OPEN', { 'font-size': 12, fill: '#fff' }, fo);
  const fc = g({}, face); el('rect', { x: -26, y: -14, width: 52, height: 22, rx: 4, fill: pal.red }, fc); k.text(0, -3, 'CLOSED', { 'font-size': 11, fill: '#fff' }, fc);
  const sh1 = shutter(k, wx - 4, wy - 4, ww + 8, wh + 8);
  const ck = clock(k, 306, 68, 16);
  const TX = sf.doorX + 27, TY = sf.doorTop + 30;
  return {
    update(t) {
      const mins = lerp(-1, 0, easeOut(seg(t, 1.2, 1.5)));
      ck.set(9 + mins / 60, mins < 0 ? 59 : 0);
      ck.g.setAttribute('transform', `translate(306 68) rotate(${(t > 1.4 && t < 2 ? wobble(seg(t, 1.4, 2), 5, 3) * 8 : 0).toFixed(2)})`);
      // 店員が札に手を伸ばし、くるっと返す
      const rch = easeInOut(seg(t, 1.6, 2.0)) * (1 - easeInOut(seg(t, 2.4, 2.7)));
      const flip = easeInOut(seg(t, 2.0, 2.35));
      P(clerk, { x: TX, armL: 8, mood: 'smile', look: -0.3, blink: blinkAt(t) });
      clerk.pose({ armR: lerp(8, reach(clerk, 0.82, 'R', TX - 12, TY + 4), rch) });
      const sc = Math.cos(flip * Math.PI);
      k.tf(tag, TX - 4, TY + 6, 0); k.tf(face, 0, 0, 0, Math.max(0.02, Math.abs(sc)), 1);
      fo.setAttribute('opacity', sc > 0 ? 1 : 0); fc.setAttribute('opacity', sc > 0 ? 0 : 1);
      const off = easeOut(seg(t, 2.6, 2.9));
      room.setAttribute('opacity', 0.75 * off); dg.setAttribute('fill', off > 0.5 ? '#3A4560' : '#FFF6CF');
      clerk.g.setAttribute('opacity', 1 - off);
      sh1.set(1 - easeInOut(seg(t, 2.9, 4.0)));
    }
  };
}
