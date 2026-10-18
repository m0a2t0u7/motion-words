// leave out：大事な項目（★）を順に書き込み、抜けていた2行目に気づいて戻って書き足す（例文 Don't leave out any important details.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { reach, held } from './dig.js';
import { drawOn, standFor, pen, check } from './work-on.js';

export const meta = { duration: 4.6, beats: [[0, '大事な項目'], [2.0, '抜けに気づく'], [3.8, '全部入れた']] };

const STAR = 'M 0 -7 L 2 -2.2 L 7 -2 L 3.3 1.5 L 4.5 6.6 L 0 3.9 L -4.5 6.6 L -3.3 1.5 L -7 -2 L -2 -2.2 Z';

export function create(k) {
  const { el, g, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 330, y: 56, width: 50, height: 60, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('rect', { x: 26, y: 96, width: 196, height: 118, rx: 6, fill: '#fff', stroke: '#B9C3D0', 'stroke-width': 5 });
  el('rect', { x: 50, y: 214, width: 6, height: 22, fill: '#B9C3D0' }); el('rect', { x: 192, y: 214, width: 6, height: 22, fill: '#B9C3D0' });
  k.shadow(124, FY, 92, 4);
  const ys = [124, 155, 186];
  const lines = ys.map((y, i) => {
    el('path', { d: STAR, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.2, transform: `translate(46 ${y})` });
    el('rect', { x: 60, y: y + 7, width: 120, height: 2, fill: '#D9DFE7' });
    const p = el('path', { d: `M 62 ${y + 1} q 8 -8 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0`, stroke: pal.blueDark, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' });
    return { p, on: drawOn(p) };
  });
  const gap = el('rect', { x: 58, y: ys[1] - 13, width: 128, height: 26, rx: 5, fill: 'none', stroke: pal.red, 'stroke-width': 3, 'stroke-dasharray': '6 5' });
  const bang = k.text(200, ys[1], '!', { 'font-size': 24, fill: pal.red });
  const chk = check(k, 200, 116, 1.1);
  const S = 1.4;
  const b = k.buddy({ x: 300, y: FY, scale: S, facing: -1 });
  const mk = pen(k, pal.blue);
  // 書く順：1行目 → 3行目 → （気づく）→ 2行目
  const W = [[0, 0.5, 1.2], [2, 1.4, 2.1], [1, 3.0, 3.7]];
  return {
    update(t) {
      let pt = { x: 150, y: 205 };
      W.forEach(([i, a, z]) => {
        const q = easeInOut(seg(t, a, z));
        lines[i].on(q);
        if (t > a - 0.3) { const L = lines[i].p.getTotalLength(), p = lines[i].p.getPointAtLength(L * q), m = easeInOut(seg(t, a - 0.3, a)); pt = { x: lerp(pt.x, p.x, m), y: lerp(pt.y, p.y, m) }; }
      });
      const notice = seg(t, 2.3, 2.5) * (1 - seg(t, 3.0, 3.2));
      gap.setAttribute('opacity', notice * (0.6 + 0.4 * Math.sin(t * 12)));
      bang.setAttribute('opacity', notice);
      if (t > 2.15 && t < 2.7) { const m = easeInOut(seg(t, 2.15, 2.5)); pt = { x: lerp(pt.x, 200, m), y: lerp(pt.y, 220, m) }; }
      chk(easeOut(seg(t, 3.85, 4.2)));
      if (t > 3.75) { const r = easeInOut(seg(t, 3.75, 4.1)); pt = { x: lerp(pt.x, 200, r), y: lerp(pt.y, 120, r) }; }
      if (t > 4.2) { const r = easeInOut(seg(t, 4.2, 4.5)); pt = { x: lerp(200, 210, r), y: lerp(120, 225, r) }; }
      const sur = hump(seg(t, 2.3, 2.7));
      b.pose({ x: Math.max(254, standFor(S, pt.x, pt.y, FY)), lean: 5 - 6 * sur, lift: 6 * sur, look: 0.6, mood: notice > 0.3 ? 'open' : t > 4.0 ? 'grin' : 'flat', armL: 10 });
      b.pose({ armR: reach(b, S, 'R', pt.x, pt.y) });
      held(k, b, S, mk, 'R', 0, 26);
    }
  };
}
