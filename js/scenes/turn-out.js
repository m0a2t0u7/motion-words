// turn out：気が進まないまま来たパーティー。明かりがつくと飾りと友だち、結果はすごく楽しかった（例文 The party turned out to be a lot of fun.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { bubble } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '気が進まない'], [1.6, 'パーティーへ'], [3.2, 'すごく楽しい']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 飾り（ガーランド・風船・テーブル）
  el('path', { d: 'M 0 40 Q 200 90 400 40', stroke: pal.sub, 'stroke-width': 1.5, fill: 'none' });
  for (let i = 0; i < 11; i++) { const x = 18 + i * 36, y = 40 + 50 * (1 - Math.pow((x - 200) / 200, 2)) * 0.97 - 2; el('path', { d: `M ${x - 9} ${y} L ${x + 9} ${y} L ${x} ${y + 16} Z`, fill: [pal.coral, pal.yellow, pal.blue, pal.green][i % 4] }); }
  const balloons = [[40, 120, pal.red], [64, 104, pal.yellow], [350, 112, pal.violet]].map(([x, y, c]) => {
    const bl = g({}); el('line', { x1: 0, y1: 16, x2: 0, y2: 90, stroke: pal.sub, 'stroke-width': 1.2 }, bl); el('ellipse', { rx: 13, ry: 16, fill: c }, bl); el('ellipse', { cx: -4, cy: -6, rx: 3, ry: 5, fill: '#fff', opacity: 0.5 }, bl);
    return [bl, x, y];
  });
  el('rect', { x: 280, y: 190, width: 90, height: 8, rx: 3, fill: pal.wood }); el('rect', { x: 320, y: 198, width: 8, height: 38, fill: pal.woodDark });
  el('path', { d: 'M 300 190 L 304 174 L 324 174 L 328 190 Z', fill: '#fff', stroke: pal.coral, 'stroke-width': 2 });
  el('path', { d: 'M 300 178 q 7 -6 14 0 q 7 6 14 0', stroke: pal.coral, 'stroke-width': 3, fill: 'none' });
  k.shadow(325, 237, 46, 4);
  const S = 0.82;
  const f1 = k.buddy({ x: 250, y: FY, scale: S * 0.92, facing: -1, color: pal.coral, dark: pal.coralDark });
  const f2 = k.buddy({ x: 360, y: FY, scale: S * 0.86, facing: -1, color: pal.blue, dark: pal.blueDark });
  const b = k.buddy({ x: -30, y: FY, scale: S });
  const dark = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#2A3242', opacity: 0.6 });
  const conf = Array.from({ length: 16 }, (_, i) => el('rect', { x: -3, y: -2, width: 6, height: 4, rx: 1, fill: [pal.coral, pal.yellow, pal.blue, pal.green][i % 4] }));
  const meh = bubble(k, 44, 28); [-9, 0, 9].forEach((x) => el('circle', { cx: x, cy: 0, r: 2.6, fill: pal.sub }, meh));
  const xf = (t) => lerp(-30, 140, easeInOut(seg(t, 0.1, 1.5)));
  return {
    update(t) {
      const lit = easeOut(seg(t, 1.6, 1.9));
      dark.setAttribute('opacity', 0.6 * (1 - lit));
      const wk = walkTo(xf, t, -30);
      const party = t > 1.9;
      const dance = party ? Math.sin((t - 1.9) * 9) : 0, jump = party ? Math.abs(Math.sin((t - 2.3) * 4.5)) * seg(t, 2.3, 2.6) : 0;
      P(b, { ...wk, facing: 1, lean: party ? 6 * dance : wk.lean - 2, look: 0.6, lift: 10 * jump, squash: 1 - 0.06 * (1 - jump) * seg(t, 2.3, 2.6),
        armL: party ? lerp(8, 150 + 20 * dance, seg(t, 1.9, 2.3)) : 6, armR: party ? lerp(8, 150 - 20 * dance, seg(t, 1.9, 2.3)) : 6,
        mood: t > 2.0 ? 'grin' : t > 1.6 ? 'open' : 'flat', blink: blinkAt(t) });
      [f1, f2].forEach((f, i) => { const d = Math.sin((t - 1.9) * 9 + i * 1.5) * (party ? 1 : 0); P(f, { x: f === f1 ? 250 : 360, facing: -1, armL: party ? 140 + 20 * d : 8, armR: party ? 140 - 20 * d : 8, lean: 6 * d, mood: party ? 'grin' : 'smile', look: 0.6, lift: party ? 6 * Math.abs(Math.sin((t - 1.9) * 4.5 + i)) : 0, blink: blinkAt(t, i + 1) }); });
      balloons.forEach(([bl, x, y], i) => tf(bl, x, y + 3 * Math.sin(t * 2 + i), 4 * Math.sin(t * 1.6 + i)));
      const mq = seg(t, 0.4, 0.7) * (1 - seg(t, 1.6, 1.8));
      tf(meh, xf(t) + 24, 112, 0, mq); meh.setAttribute('opacity', mq > 0 ? 1 : 0);
      conf.forEach((c, i) => {
        const p = seg(t, 1.9 + (i % 5) * 0.08, 4.4);
        const x = 200 + (i - 8) * 24 + Math.sin(i * 3.1) * 20 + Math.sin(t * 3 + i) * 8, y = lerp(-10, 236, p * (0.8 + (i % 3) * 0.12));
        tf(c, x, Math.min(y, 232), t * 200 + i * 40); c.setAttribute('opacity', p > 0 ? 1 : 0);
      });
    }
  };
}
