// early：朝日がのぼったばかりの早い時刻、まめはベッドから起きて大きくのびをする（例文 I got up early this morning.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';
import { P, blinkAt, clock } from './run-after.js';
import { roomBg } from './look-over.js';

export const meta = { duration: 3.8, beats: [[0, 'ぐっすり'], [1.3, '起きる'], [2.6, '朝日とのび']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  const sky = el('rect', { x: 40, y: 46, width: 84, height: 70, rx: 8, fill: '#3E4A7A' });
  const sun = el('circle', { cx: 82, cy: 130, r: 16, fill: '#FFC857' });
  el('rect', { x: 36, y: 116, width: 92, height: 18, fill: pal.paper });
  el('rect', { x: 40, y: 46, width: 84, height: 70, rx: 8, fill: 'none', stroke: '#fff', 'stroke-width': 5 }); el('line', { x1: 82, y1: 46, x2: 82, y2: 116, stroke: '#fff', 'stroke-width': 4 });
  const ck = clock(k, 250, 80, 20);
  // ベッド
  k.shadow(135, FY + 2, 70, 5);
  el('rect', { x: 62, y: 190, width: 150, height: 34, rx: 8, fill: pal.wood }); el('rect', { x: 62, y: 172, width: 10, height: 52, rx: 4, fill: pal.woodDark });
  const sl = g({}); el('circle', { cx: 0, cy: 0, r: 15, fill: pal.mint }, sl);
  el('path', { d: 'M -9 -1 q 3 3 6 0 M 3 -1 q 3 3 6 0', stroke: pal.ink, 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }, sl);
  el('rect', { x: 76, y: 176, width: 36, height: 16, rx: 8, fill: '#fff' });
  const b = k.buddy({ x: 242, y: FY + 8, scale: 1 });
  const blank = g({}); el('rect', { x: 100, y: 182, width: 110, height: 28, rx: 10, fill: pal.blue }, blank);
  const zz = [0, 1, 2].map((i) => k.text(0, 0, 'z', { 'font-size': 14 + i * 3, fill: pal.sub, 'font-weight': 700 }));
  return {
    update(t) {
      const dawn = easeInOut(seg(t, 0.2, 3.0)), wake = seg(t, 1.2, 1.6), up = easeOut(seg(t, 1.6, 2.3)), st = easeInOut(seg(t, 2.4, 3.2));
      const c = (a, b2) => Math.round(lerp(a, b2, dawn));
      sky.setAttribute('fill', `rgb(${c(62, 255)},${c(74, 214)},${c(122, 170)})`);
      tf(sun, 0, -dawn * 40);
      ck.set(6, 0);
      const sleeping = t < 1.4;
      tf(sl, 94, 183 + Math.sin(t * 2.2) * 1.2); sl.setAttribute('opacity', sleeping ? 1 : 0);
      blank.setAttribute('opacity', sleeping ? 1 : 0);
      zz.forEach((z, i) => { const u = (t * 0.7 + i / 3) % 1; tf(z, 112 + i * 8 + u * 8, 168 - u * 26); z.setAttribute('opacity', sleeping ? hump(u) : 0); });
      b.g.setAttribute('opacity', sleeping ? 0 : 1);
      P(b, { x: 242, armL: 8 + st * 165, armR: 8 + st * 165, lean: -4 * st, squash: 1 + 0.04 * st - 0.04 * hump(seg(t, 1.4, 2.0)), mood: st > 0.3 ? 'open' : 'flat', blink: t < 2.4 ? 0.9 * (1 - up) : blinkAt(t), look: 0.3 });
    }
  };
}
