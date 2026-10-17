import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';
const D = Math.PI / 180;
// 手(R/L)を点(tx,ty)へ向ける腕の角度
function aim(b, S, tx, ty, side = 'R') {
  const s = b.state, f = s.facing, o = side === 'R' ? 1 : -1;
  return Math.atan2((tx - (s.x + 27 * S * f * o)) * f * o, ty - (s.y - 56 * S - s.lift)) / D;
}
function cursor(k, parent) {
  return k.el('path', { d: 'M0 0 L0 15 L4 11.5 L7 18 L10 16.5 L7 10.5 L12 10.5 Z', fill: k.pal.ink, stroke: '#fff', 'stroke-width': 1.4, 'stroke-linejoin': 'round' }, parent);
}
function pen(k, parent, c) {
  const p = k.g({}, parent);
  k.el('line', { x1: 0, y1: 0, x2: -22, y2: -6, stroke: c || k.pal.coralDark, 'stroke-width': 5, 'stroke-linecap': 'round' }, p);
  k.el('path', { d: 'M 0 0 L 6 1.6 L 0 3 Z', fill: '#F4D9B5' }, p);
  k.el('circle', { cx: 5.2, cy: 1.7, r: 1.1, fill: k.pal.ink }, p);
  return p;
}

// work-out：ダンベルを何度も持ち上げて体を鍛える。週2回（I work out at the gym twice a week.）
export const meta = { duration: 4.2, beats: [[0, '構える'], [1.0, '持ち上げる'], [3.3, '汗をかく']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const S = 1.25;
  // マット
  el('rect', { x: 60, y: 232, width: 280, height: 12, rx: 6, fill: pal.violet, opacity: 0.35 });
  // 週のカレンダー（週2回）
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const cal = g({ transform: 'translate(86 26)' });
  const cells = days.map((d, i) => {
    const gg = g({ transform: `translate(${i * 32} 0)` }, cal);
    el('rect', { width: 26, height: 30, rx: 6, fill: '#fff', stroke: '#D5DBE5', 'stroke-width': 2 }, gg);
    k.text(13, 9, d, { 'font-size': 9, fill: pal.sub }, gg);
    const ck = el('path', { d: 'M 7 20 L 12 25 L 20 14', stroke: pal.green, 'stroke-width': 3.4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, gg);
    return ck;
  });
  const b = k.buddy({ x: 200, y: FY - 4, scale: S });
  const db = () => {
    const d = g({});
    el('line', { x1: -9, y1: 0, x2: 9, y2: 0, stroke: '#6B7585', 'stroke-width': 3, 'stroke-linecap': 'round' }, d);
    el('rect', { x: -14, y: -7, width: 6, height: 14, rx: 2, fill: '#4A5568' }, d);
    el('rect', { x: 8, y: -7, width: 6, height: 14, rx: 2, fill: '#4A5568' }, d);
    return d;
  };
  const dL = db(), dR = db();
  const drops = [0, 1, 2].map(() => el('path', { d: 'M 0 -6 Q 5 1 0 5 Q -5 1 0 -6 Z', fill: pal.water, stroke: '#6BBDE4', 'stroke-width': 1 }));
  return {
    update(t) {
      const prep = easeInOut(seg(t, 0.2, 0.9));
      const reps = t > 1.0 && t < 3.3 ? 0.5 - 0.5 * Math.cos((t - 1.0) * 2 * Math.PI / 1.1) : 0;
      const arm = lerp(18, 150, reps) + 0;
      const sq = 1 - 0.05 * reps * 0 - (t > 0.2 && t < 1.0 ? 0.05 * hump(seg(t, 0.2, 1.0)) : 0);
      const tired = seg(t, 2.6, 3.4);
      b.pose({ armL: arm, armR: arm, squash: sq - 0.02 * Math.sin(reps * Math.PI), lean: 2, look: 0, mood: t > 3.3 ? 'open' : reps > 0.6 ? 'grin' : 'smile', blink: t > 0.2 && t < 0.3 ? 1 : 0, lift: 0 });
      const hl = b.handPos('L'), hr = b.handPos('R');
      tf(dL, hl.x, hl.y, 0); tf(dR, hr.x, hr.y, 0);
      drops.forEach((d, i) => {
        const ph = ((t - 1.8 - i * 0.35) / 1.0);
        const on = ph > 0 ? ph % 1 : 0;
        tf(d, 178 + i * 22 + (i % 2 ? 12 : -4), FY - 118 + on * 36, 0, 0.9);
        k.set(d, { opacity: t > 1.8 && on > 0 ? (1 - on) : 0 });
      });
      // 月・木に ✓（週2回）
      k.set(cells[0], { 'stroke-dashoffset': 1 - seg(t, 1.4, 1.8) });
      k.set(cells[3], { 'stroke-dashoffset': 1 - seg(t, 3.0, 3.4) });
    }
  };
}
