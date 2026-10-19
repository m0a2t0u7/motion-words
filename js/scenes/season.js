// season：春・夏・秋・冬の4つの絵が並び、まめは順に見て、春の絵を選んでハートを付ける（例文 Spring is my favorite season.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { flowerG, sunG, gait, reach, P, blinkAt, popIn } from './nature.js';

export const meta = { duration: 4.4, beats: [[0, '4つの季節'], [1.2, 'どれが好き？'], [3.0, '春がいちばん']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: '#E6DED2' });
  const PW = 76, PH = 86, Y = 56;
  const xs = [36, 124, 212, 300];
  const bgs = ['#FDE3EA', '#CDEBFA', '#FCE3C6', '#E6EEF6'];
  const frames = xs.map((x, i) => {
    const f = g({});
    el('rect', { x: x - 3, y: Y - 3, width: PW + 6, height: PH + 6, rx: 6, fill: pal.woodDark }, f);
    el('rect', { x, y: Y, width: PW, height: PH, rx: 4, fill: bgs[i] }, f);
    const cx = x + PW / 2;
    if (i === 0) { el('rect', { x: cx - 3, y: Y + 40, width: 6, height: 40, fill: '#B99572' }, f); [[-14, 34], [10, 30], [0, 22], [16, 44], [-18, 48]].forEach(([dx, dy]) => el('circle', { cx: cx + dx, cy: Y + dy, r: 12, fill: '#F9B9CB' }, f)); }
    if (i === 1) { const s = sunG(k, 12, f); tf(s.g, cx, Y + 32); el('rect', { x, y: Y + 64, width: PW, height: 22, fill: '#7FD0EE' }, f); }
    if (i === 2) { el('rect', { x: cx - 3, y: Y + 40, width: 6, height: 40, fill: '#B99572' }, f); [[-12, 32, '#F28A4C'], [10, 30, '#E8603C'], [0, 22, '#FFB547']].forEach(([dx, dy, c]) => el('circle', { cx: cx + dx, cy: Y + dy, r: 15, fill: c }, f)); }
    if (i === 3) { el('circle', { cx, cy: Y + 64, r: 13, fill: '#fff' }, f); el('circle', { cx, cy: Y + 44, r: 9, fill: '#fff' }, f); [[-24, 16], [20, 22], [-10, 30], [26, 50], [-28, 56]].forEach(([dx, dy]) => el('circle', { cx: cx + dx, cy: Y + dy, r: 2.5, fill: '#fff' }, f)); }
    return f;
  });
  const hl = el('rect', { x: xs[0] - 8, y: Y - 8, width: PW + 16, height: PH + 16, rx: 8, fill: 'none', stroke: pal.red, 'stroke-width': 4, opacity: 0 });
  const heart = el('path', { d: 'M 0 6 C -12 -2 -8 -12 0 -5 C 8 -12 12 -2 0 6 Z', fill: pal.red });
  const b = k.buddy({ x: 340, y: FY, scale: S, facing: -1 });
  const xf = (t) => t < 2.2 ? lerp(340, 220, easeInOut(seg(t, 0.4, 2.2))) : lerp(220, 120, easeInOut(seg(t, 2.2, 3.0)));
  return {
    update(t) {
      const w = gait(xf, t, 340, 10, 0.12);
      P(b, { x: w.x, facing: -1, walk: w.walk, look: -0.5, lean: w.lean, armL: w.armL, armR: w.armR, mood: t > 3.0 ? 'grin' : 'smile', blink: blinkAt(t) });
      b.body.children[3].setAttribute('transform', 'translate(0 -3)');
      const pt = easeOut(seg(t, 3.0, 3.4));
      if (pt > 0) b.pose({ armR: lerp(w.armR, reach(b, S, 'R', xs[0] + PW / 2, Y + PH / 2), pt) });
      hl.setAttribute('opacity', easeOut(seg(t, 3.2, 3.5)));
      const hp = seg(t, 3.4, 3.8);
      tf(heart, xs[0] + PW, Y - 4 + 2 * Math.sin(t * 5), 0, popIn(hp) * 1.4);
      frames.forEach((f, i) => f.setAttribute('opacity', t > 3.2 && i > 0 ? 1 - 0.4 * easeOut(seg(t, 3.2, 3.6)) : 1));
    }
  };
}
