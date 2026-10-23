// public：誰でも使える公共の図書館。入口の「OPEN」の前を、まめと近所の人たちが入っていく（例文 You can use the public library.）
import { seg, lerp, easeInOut, backOut, hump } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';

export const meta = { duration: 4.0, beats: [[0, '図書館の前'], [1.2, '誰でも入る'], [2.8, '本を借りに来た']] };
const EF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'outdoor' });
  el('rect', { x: 190, y: 70, width: 200, height: FY - 70, fill: '#EBD9F8' });
  el('path', { d: 'M 180 72 L 290 34 L 400 72 Z', fill: pal.violet });
  k.text(290, 64, 'LIBRARY', { 'font-size': 15, 'font-weight': 800, fill: '#fff', 'text-anchor': 'middle' });
  [210, 350].forEach((x) => el('rect', { x: x - 10, y: 110, width: 40, height: 40, rx: 4, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 4 }));
  el('rect', { x: 262, y: 116, width: 56, height: FY - 116, rx: 4, fill: '#7C5BB8' });
  const bk = g({}); tf(bk, 290, 98); k.text(0, 0, '📚', { 'font-size': 24, 'font-family': EF, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, bk);
  const bs = [k.buddy({ x: 0, y: FY, scale: 0.8, color: pal.blue, dark: pal.blueDark }), k.buddy({ x: 0, y: FY, scale: 0.8, color: pal.coral, dark: pal.coralDark })];
  const b = k.buddy({ x: 30, y: FY, scale: 0.95 });
  const f = [(t) => lerp(0, 290, easeInOut(seg(t, 0.2, 2.2))), (t) => lerp(340, 290, easeInOut(seg(t, 0.5, 2.2)))];
  const fm = (t) => lerp(30, 215, easeInOut(seg(t, 1.0, 3.0)));
  return {
    update(t) {
      bs.forEach((o, i) => {
        const w = walkTo(f[i], t, i ? 340 : 0, i ? -1 : 1), inn = f[i](t) > 280;
        P(o, { ...w, mood: 'smile', look: 0.4, blink: blinkAt(t, i) });
        o.g.setAttribute('opacity', inn ? 0 : 1);
      });
      const w = walkTo(fm, t, 30);
      P(b, { ...w, armR: lerp(w.armR, 150, seg(t, 3.0, 3.4)), mood: t > 2.9 ? 'grin' : 'smile', look: 0.5, blink: blinkAt(t) });
    }
  };
}
