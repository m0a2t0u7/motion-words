// step by step：ホワイトボードの問題を、2人で手順1→2→3と1つずつ確かめて進め、最後に答えにたどり着く（例文 Let's solve the problem step by step.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { officeBg } from './get-on-with.js';
import { reach } from './dig.js';
import { check } from './work-on.js';
import { popS } from './from-scratch.js';
import { star } from './get-on-with.js';

export const meta = { duration: 4.4, beats: [[0, '難しい問題'], [0.8, '1つずつ'], [3.4, '解けた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = officeBg(k, 236, 20);
  // ホワイトボード
  k.shadow(250, FY + 1, 70, 4);
  el('rect', { x: 160, y: 40, width: 220, height: 130, rx: 6, fill: '#fff', stroke: pal.sub, 'stroke-width': 4 });
  [200, 340].forEach((x) => el('line', { x1: x, y1: 170, x2: x - 10, y2: FY, stroke: pal.sub, 'stroke-width': 4 }));
  const X = [196, 248, 300];
  const boxes = X.map((x, i) => {
    const bx = g({}); tf(bx, x, 88);
    el('rect', { x: -20, y: -18, width: 40, height: 36, rx: 6, fill: '#EEF5FD', stroke: pal.blue, 'stroke-width': 2.5 }, bx);
    k.text(0, 1, String(i + 1), { 'font-size': 18, fill: pal.blueDark }, bx);
    return bx;
  });
  const ck = X.map((x) => check(k, x, 126, 1, pal.green));
  X.slice(0, 2).forEach((x) => el('path', { d: `M ${x + 22} 88 L ${x + 30} 88 M ${x + 26} 84 L ${x + 30} 88 L ${x + 26} 92`, stroke: pal.sub, 'stroke-width': 2, fill: 'none' }));
  el('path', { d: 'M 322 88 L 330 88 M 326 84 L 330 88 L 326 92', stroke: pal.sub, 'stroke-width': 2, fill: 'none' });
  const q = k.text(352, 89, '?', { 'font-size': 26, fill: pal.coralDark });
  const ans = g({}); star(k, ans, 14, pal.yellow);
  const c = k.buddy({ x: 66, y: FY, facing: 1, color: pal.coral, dark: pal.coralDark, scale: 0.95 });
  const b = k.buddy({ x: 130, y: FY, facing: 1 });
  return {
    update(t) {
      const T = [0.8, 1.6, 2.4];
      const cur = t < T[0] ? -1 : t < T[1] ? 0 : t < T[2] ? 1 : t < 3.2 ? 2 : 3;
      P(b, { x: 130, facing: 1, look: 0.6 });
      const tgt = cur >= 0 && cur < 3 ? X[cur] : 352;
      const A = reach(b, 1, 'R', tgt - 18, 100);
      const pt = cur < 0 ? easeOut(seg(t, 0.4, 0.8)) : 1;
      const tap = cur >= 0 && cur < 3 ? hump(seg((t - T[0]) % 0.8, 0.0, 0.25)) : 0;
      const end = easeOut(seg(t, 3.3, 3.7));
      P(b, { x: 130, facing: 1, look: 0.6, armR: lerp(lerp(8, A, pt), 150, end) + 6 * tap, armL: lerp(8, 150, end), lean: 4 * tap, mood: t > 3.3 ? 'grin' : t < 0.8 ? 'flat' : 'smile', blink: blinkAt(t), lift: 8 * hump(seg(t, 3.4, 3.8)) });
      // 相方：手順ごとにうなずく
      const nod = cur >= 0 && cur < 3 ? Math.max(0, Math.sin(((t - T[0]) % 0.8) / 0.8 * Math.PI * 2)) : 0;
      P(c, { x: 66, facing: 1, look: 0.7, lean: 8 * nod, mood: t > 3.3 ? 'grin' : t < 0.8 ? 'sad' : 'smile', armR: t > 3.3 ? lerp(8, 140, end) : 8, blink: blinkAt(t, 1) });
      ck.forEach((f, i) => f(easeOut(seg(t, T[i] + 0.35, T[i] + 0.6))));
      boxes.forEach((bx, i) => tf(bx, X[i], 88, 0, 1 + 0.08 * hump(seg(t, T[i], T[i] + 0.35))));
      q.setAttribute('opacity', t < 3.2 ? 1 : 0);
      tf(ans, 352, 89, t * 30, popS(seg(t, 3.2, 3.6)));
      ans.setAttribute('opacity', t >= 3.2 ? 1 : 0);
    }
  };
}
