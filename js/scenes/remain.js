// remain：映画館の座席が次々と埋まり、空いている席はあと2つだけ（例文 Only a few seats remain.）
import { seg, lerp, easeInOut, easeOut, wobble, hump, clamp } from '../ease.js';
import { gait } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { COL } from './queue-up.js';

export const meta = { duration: 4.2, beats: [[0, '席が埋まる'], [1.9, 'どんどん座る'], [3.2, '残りはわずか']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.58;
  const FY = k.backdrop({ floorY: 240, mood: 'evening' });
  el('rect', { x: 0, y: 0, width: 400, height: 240, fill: '#3B3550' });
  // スクリーンの光
  el('rect', { x: 70, y: 22, width: 260, height: 70, rx: 6, fill: '#F4EEDC' });
  el('rect', { x: 70, y: 22, width: 260, height: 70, rx: 6, fill: '#FFCF5C', opacity: 0.18 });
  el('path', { d: 'M 0 0 Q 40 30 30 120 L 0 120 Z M 400 0 Q 360 30 370 120 L 400 120 Z', fill: '#B5465A' });
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: '#4A4262' });
  const XS = [78, 124, 170, 216, 262, 308, 354];
  const backs = g({}), people = g({}), fronts = g({});
  XS.forEach((x) => {
    el('rect', { x: x - 20, y: FY - 70, width: 40, height: 52, rx: 10, fill: '#D3485E' }, backs);
    el('rect', { x: x - 16, y: FY - 66, width: 32, height: 6, rx: 3, fill: '#fff', opacity: 0.18 }, backs);
  });
  const glow = XS.map((x) => el('rect', { x: x - 23, y: FY - 73, width: 46, height: 75, rx: 12, fill: 'none', stroke: pal.yellow, 'stroke-width': 3, opacity: 0 }, backs));
  // 最初から座っている人たち
  const seated = [[0, 'violet'], [2, 'blue'], [5, 'yellow']].map(([i, c]) => {
    const b = k.buddy({ x: XS[i], y: FY - 6, scale: S, color: COL[c][0], dark: COL[c][1], parent: people });
    return [b, i];
  });
  // あとから来て座る人（席番号, 入る位置, 来る時刻）
  const comers = [[1, -30, 0.2, 'coral'], [3, 430, 1.0, 'mint2']].map(([i, x0, t0, c]) =>
    ({ b: k.buddy({ x: x0, y: FY, scale: S, color: COL[c === 'mint2' ? 'violet' : c][0], dark: COL[c === 'mint2' ? 'violet' : c][1], parent: people }), i, x0, t0 }));
  XS.forEach((x) => {
    el('rect', { x: x - 21, y: FY - 20, width: 42, height: 20, rx: 6, fill: '#B23A4F' }, fronts);
    el('rect', { x: x - 23, y: FY - 30, width: 6, height: 30, rx: 3, fill: '#2E2A40' }, fronts);
  });
  el('rect', { x: XS[6] + 17, y: FY - 30, width: 6, height: 30, rx: 3, fill: '#2E2A40' }, fronts);
  // まめ（左の通路）
  const me = k.buddy({ x: -40, y: FY, scale: 0.78 });
  const mx = (t) => lerp(-40, 28, easeInOut(seg(t, 2.2, 3.0)));
  return {
    update(t) {
      seated.forEach(([b, i], n) => P(b, { x: XS[i], y: FY - 6, squash: 0.92, look: 0, blink: blinkAt(t, n) }));
      comers.forEach(({ b, i, x0, t0 }, n) => {
        const xf = (u) => lerp(x0, XS[i], easeInOut(seg(u, t0, t0 + 1.1)));
        const w = gait(xf, t, x0), sit = easeInOut(seg(t, t0 + 1.15, t0 + 1.5));
        const land = wobble(seg(t, t0 + 1.5, t0 + 2.0), 2, 6);
        P(b, { x: w.x, y: FY - 6 * sit, walk: w.walk, armL: w.armL, armR: w.armR, facing: x0 < XS[i] ? 1 : -1, squash: lerp(1, 0.92, sit) - 0.04 * land, look: sit > 0.5 ? 0 : 0.5, blink: blinkAt(t, n + 1) });
      });
      // 空いている席が光る
      const pul = seg(t, 3.0, 3.4) * (0.75 + 0.25 * Math.sin(t * 8));
      glow.forEach((n, i) => n.setAttribute('opacity', i === 4 || i === 6 ? pul : 0));
      const w = gait(mx, t, -40);
      const pt = easeOut(seg(t, 3.0, 3.4));
      P(me, { x: w.x, walk: w.walk, armL: w.armL, armR: Math.max(w.armR, lerp(8, 70, pt)), lean: w.lean, look: 0.8, mood: t > 3.1 ? 'open' : 'smile', blink: blinkAt(t, 0.5) });
    }
  };
}
