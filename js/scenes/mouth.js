// mouth：口いっぱいにほおばったまま話そうとして、お母さんに注意される。口を閉じてもぐもぐ（例文 Don't talk with your mouth full.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { hp, reach, P, blinkAt, bp, faceOf } from './body.js';
import { sideTable } from './restaurant.js';
import { homeBg } from './furniture.js';
import { say } from './look-over.js';
import { mark } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '口いっぱい'], [1.0, '話そうとする'], [2.4, '閉じてもぐもぐ']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.05, FY = 240;
  homeBg(k, { FY, winX: 160 });
  const A = k.buddy({ x: 120, y: FY - 20, scale: S, facing: 1 });
  const M = k.buddy({ x: 300, y: FY - 4, scale: 1.1, facing: -1, color: pal.coral, dark: pal.coralDark });
  // ふくらんだほっぺ
  const cheeks = [-1, 1].map((d) => el('ellipse', { cx: d * 17, cy: -45, rx: 9, ry: 8, fill: pal.mint }, faceOf(A)));
  faceOf(A).insertBefore(cheeks[0], faceOf(A).firstChild); faceOf(A).insertBefore(cheeks[1], faceOf(A).firstChild);
  const crumbs = [0, 1, 2, 3].map(() => el('circle', { r: 2.2, fill: '#E7B670' }));
  sideTable(k, 200, FY - 56, 170, FY, '#FFF3E4');
  el('ellipse', { cx: 156, cy: FY - 58, rx: 20, ry: 4.5, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 });
  const sb = say(k, 54, 32, -1); mark(k, 'q', sb.g, 0.9);
  const sm = say(k, 46, 32, 1); mark(k, 'x', sm.g, 0.9);
  return {
    update(t) {
      const talk = t > 0.9 && t < 2.0, chew = t > 2.5 ? Math.sin(t * 14) : Math.sin(t * 6) * 0.4;
      P(A, { y: FY - 20, lean: 4, look: 0.5, mood: talk && Math.sin(t * 20) > -0.2 ? 'open' : 'flat', blink: blinkAt(t), armL: 10, armR: talk ? 60 + 20 * Math.sin(t * 10) : 12 });
      cheeks.forEach((c) => { c.setAttribute('rx', (9 + 1.2 * chew).toFixed(2)); c.setAttribute('ry', (8 - 1.2 * chew).toFixed(2)); });
      if (t > 3.4) A.pose({ mood: 'smile' });
      cheeks.forEach((c) => c.setAttribute('opacity', t > 3.6 ? 1 - seg(t, 3.6, 4.0) : 1));
      const m = bp(A, S, 14, -42);
      crumbs.forEach((c, i) => { const q = talk ? ((t * 2.2 + i * 0.25) % 1) : 1; k.set(c, { cx: m.x + 6 + q * 22, cy: m.y + 30 * q * q - 4 + i, opacity: talk && q < 0.9 ? 1 : 0 }); });
      sb.show(seg(t, 1.0, 1.2) * (1 - seg(t, 1.9, 2.0)), m.x + 26, m.y - 36);
      // お母さん：指を立てて首をふる
      const warn = easeOut(seg(t, 1.5, 1.8)) * (1 - easeInOut(seg(t, 3.0, 3.4)));
      P(M, { look: 0.5, mood: t > 3.2 ? 'smile' : 'flat', blink: blinkAt(t, 1), armR: lerp(10, 150, warn) + 10 * Math.sin(t * 14) * warn, armL: 10 });
      M.body.children[3].setAttribute('transform', `translate(${(3 * Math.sin(t * 9) * warn).toFixed(2)} 0)`);
      sm.show(warn, 286, 104);
    }
  };
}
