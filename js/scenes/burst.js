// burst：風船を膨らませ続けると、パンッと大きな音で破裂する。まめは驚いて耳をふさぐ（例文 The balloon burst with a loud pop.）
import { seg, lerp, easeInOut, easeOut, smooth, wobble, clamp } from '../ease.js';
import { hp } from './dig.js';

export const meta = { duration: 4.0, beats: [[0, '膨らむ'], [2.0, '破裂'], [3.2, '耳をふさぐ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236, mood: 'indoor' });
  // 壁の飾り（パーティー）
  el('path', { d: 'M 30 40 Q 100 70 170 40 Q 240 70 310 40 Q 350 55 380 40', fill: 'none', stroke: pal.line, 'stroke-width': 3 });
  [[70, 56, pal.yellow], [135, 54, pal.violet], [205, 56, pal.blue], [275, 56, pal.coral], [340, 52, pal.green]].forEach(([x, y, c]) => el('path', { d: `M ${x - 7} ${y} L ${x + 7} ${y} L ${x} ${y + 16} Z`, fill: c }));
  const b = k.buddy({ x: 140, y: 236 });
  const BX = 188, BY = 160; // 風船の口の位置
  const bal = g({});
  const body = el('ellipse', { cx: 0, cy: -1, rx: 10, ry: 12, fill: pal.red }, bal);
  const shine = el('ellipse', { cx: -4, cy: -6, rx: 3, ry: 4, fill: '#fff', opacity: 0.45 }, bal);
  const knot = el('path', { d: 'M -3 11 L 3 11 L 0 15 Z', fill: '#D9534A' }, bal);
  const str = el('path', { d: '', fill: 'none', stroke: pal.sub, 'stroke-width': 1.6 });
  const star = g({});
  const sp = [];
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, r = i % 2 ? 26 : 46; sp.push(`${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`); }
  el('polygon', { points: sp.join(' '), fill: pal.yellow, stroke: '#fff', 'stroke-width': 3 }, star);
  k.text(0, 1, 'POP!', { 'font-size': 17, fill: pal.red }, star);
  const frag = [];
  for (let i = 0; i < 9; i++) frag.push(el('path', { d: 'M 0 0 Q 7 -3 11 3 Q 5 8 0 0 Z', fill: pal.red }));
  const wav = [0, 1].map(() => el('path', { fill: 'none', stroke: pal.sub, 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
  return {
    update(t) {
      const TB = 2.1; // 破裂の時刻
      const inf = easeInOut(seg(t, 0.2, TB - 0.05));
      const puff = Math.sin(t * 6) * 0.5 + 0.5;
      const pop = t >= TB;
      const sh = smooth(seg(t, TB, TB + 0.12)) * (1 - smooth(seg(t, TB + 0.5, TB + 1.0)));
      const reel = smooth(seg(t, TB, TB + 0.25)) * (1 - 0.3 * smooth(seg(t, TB + 1.0, TB + 1.6)));
      b.pose({
        armR: pop ? lerp(70, 172, smooth(seg(t, TB, TB + 0.3))) : 78, armL: pop ? lerp(8, 172, smooth(seg(t, TB, TB + 0.3))) : 8,
        lean: pop ? -14 * reel : 5 * (0.5 + 0.5 * puff * (t < TB ? 1 : 0)), squash: pop ? 1 - 0.07 * sh : 1 + 0.03 * puff * inf,
        look: pop ? -0.5 : 0.8, mood: pop ? 'open' : 'flat', blink: pop && t < TB + 0.5 ? 0 : 0, x: pop ? 140 - 6 * reel : 140
      });
      const hn = hp(b, 1, 'R', 28);
      // 風船：口元から膨らみ、揺れが大きくなる
      const r = lerp(10, 36, inf), jig = inf * 0.07 * Math.sin(t * 38);
      const bx = hn.x + 8 + r * 0.9, by = hn.y - 8 - r * 0.7;
      if (!pop) {
        bal.setAttribute('opacity', 1);
        tf(bal, bx, by, 8 * Math.sin(t * 3) * inf, (r / 10) * (1 + jig), (r / 10) * (1 - jig));
        k.set(str, { d: '', opacity: 0 });
      } else bal.setAttribute('opacity', 0);
      // 破裂：星形の衝撃、破片、耳をふさぐ音の波
      const px = hn.x + 36, py = hn.y - 40;
      tf(star, px, py, -8, 0.4 + 0.9 * easeOut(seg(t, TB, TB + 0.25)), 0.4 + 0.9 * easeOut(seg(t, TB, TB + 0.25)));
      star.setAttribute('opacity', sh > 0 ? Math.min(1, sh * 1.4) : 0);
      frag.forEach((f, i) => {
        const a = (i / 9) * Math.PI * 2 + 0.3, q = (t - TB) / 1.0, v = 60 + (i % 3) * 22;
        if (q > 0 && q < 1.2) { const x = px + Math.cos(a) * v * easeOut(clamp(q)), y = py + Math.sin(a) * v * easeOut(clamp(q)) + 70 * q * q; tf(f, x, y, q * 400 + i * 40, 1, 1); f.setAttribute('opacity', 1 - smooth(seg(q, 0.8, 1.2))); } else f.setAttribute('opacity', 0);
      });
      wav.forEach((w, i) => { const s2 = i ? 1 : -1, o = sh > 0.05 ? 1 : 0; k.set(w, { d: `M ${b.state.x + s2 * (38 + i * 8)} ${hn.y - 70} q ${s2 * 6} 10 0 20`, opacity: o * (0.4 + 0.4 * Math.sin(t * 30)) }); });
    }
  };
}
