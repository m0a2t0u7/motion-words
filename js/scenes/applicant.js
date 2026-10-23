// applicant：応募者はそれぞれ用紙に記入する。2人の応募者が机でそれぞれ自分の用紙に書き込み、チェックが付く（例文 Each applicant must fill out this form.）
import { seg, lerp, easeInOut, backOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, desk } from './look-over.js';
import { held } from './dig.js';

export const meta = { duration: 4.0, beats: [[0, '用紙が配られる'], [1.0, 'それぞれ記入'], [3.0, '書き終えた']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9;
  const FY = roomBg(k, 'office', 240);
  const mk = (x, col, dark) => {
    const b = k.buddy({ x, y: FY, scale: S, color: col, dark });
    desk(k, x - 30, 130, 196);
    const f = g({}); tf(f, x + 50, 190);
    el('rect', { x: -26, y: -6, width: 52, height: 9, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, f);
    const ls = el('rect', { x: -20, y: -2, width: 0, height: 2, rx: 1, fill: pal.blue }, f);
    const pen = g({}); el('rect', { x: -2, y: -16, width: 4, height: 20, rx: 2, fill: pal.red }, pen);
    const ck = el('path', { d: 'M 18 -16 l 5 6 l 10 -12', fill: 'none', stroke: pal.green, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, f);
    return { b, f, pen, ck, x, ls };
  };
  const A = [mk(70, pal.mint, pal.mintDark), mk(250, pal.coral, pal.coralDark)];
  return {
    update(t) {
      A.forEach((a, i) => {
        const d = i * 0.4, w = seg(t, 1.0 + d, 3.0 + d), sc = Math.sin(t * 9) * 4 * (w > 0 && w < 1 ? 1 : 0);
        P(a.b, { armR: 62 + sc * 2, armL: 8, lean: 8 * (w > 0 ? 1 : 0), mood: w >= 1 ? 'grin' : 'flat', look: 0.4, blink: blinkAt(t, i) });
        const h = held(k, a.b, S, a.pen, 'R', 0, 22);
        tf(a.f, a.x + 50, 190, 0, backOut(seg(t, 0.2 + d, 0.7 + d)));
        k.set(a.ls, { width: 36 * w });
        a.ck.setAttribute('opacity', seg(t, 3.0 + d, 3.2 + d));
      });
    }
  };
}
